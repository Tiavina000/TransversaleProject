from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from core.models import (
    Examen, QuestionExamen, CopieExamen, ReponseExamen, LogSurveillance, Enseignant
)
from core.serializers.examens_serializers import (
    ExamenSerializer, QuestionExamenSerializer, CopieExamenSerializer,
    ReponseExamenSerializer, LogSurveillanceSerializer
)
from core.permissions import IsEnseignantOrReadOnly
from django.utils.translation import gettext as _
from django.shortcuts import get_object_or_404
import re


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ExamenViewSet(viewsets.ModelViewSet):
    """API pour gérer les examens"""
    queryset = Examen.objects.all()
    serializer_class = ExamenSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'matiere__nom', 'enseignant__utilisateur__username']
    ordering_fields = ['date_debut', 'titre']
    ordering = ['-date_debut']

    def get_queryset(self):
        qs = Examen.objects.all()
        user = self.request.user
        if user.is_authenticated and user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
            qs = qs.filter(enseignant=user.enseignant_profile)
        matiere = self.request.query_params.get('matiere')
        niveau = self.request.query_params.get('niveau')
        if matiere:
            qs = qs.filter(matiere_id=matiere)
        if niveau:
            qs = qs.filter(niveau_id=niveau)
        return qs

    def perform_create(self, serializer):
        if self.request.user.is_authenticated and hasattr(self.request.user, 'enseignant_profile'):
            serializer.save(enseignant=self.request.user.enseignant_profile)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def publies(self, request):
        examens = self.get_queryset().filter(est_publie=True)
        page = self.paginate_queryset(examens)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(examens, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publier(self, request, pk=None):
        examen = self.get_object()
        examen.est_publie = True
        examen.save()
        return Response({'status': 'published'})

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        examen = self.get_object()
        user = request.user
        if not (user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile')):
            return Response({'detail': 'Accès étudiant requis'}, status=403)
        from core.models import CopieExamen
        copie, created = CopieExamen.objects.get_or_create(
            examen=examen, etudiant=user.etudiant_profile,
            defaults={'est_termine': False}
        )
        if copie.est_termine:
            return Response({'detail': 'Examen déjà soumis'}, status=400)
        from core.serializers.examens_serializers import CopieExamenSerializer
        return Response(CopieExamenSerializer(copie).data, status=201 if created else 200)

    @action(detail=True, methods=['get'])
    def timer(self, request, pk=None):
        examen = self.get_object()
        user = request.user
        remaining = examen.duree_minutes * 60
        if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            copie = CopieExamen.objects.filter(examen=examen, etudiant=user.etudiant_profile).first()
            if copie and copie.date_debut:
                elapsed = (__import__('django').utils.timezone.now() - copie.date_debut).total_seconds()
                remaining = max(0, examen.duree_minutes * 60 - int(elapsed))
        return Response({
            'total_seconds': examen.duree_minutes * 60,
            'remaining_seconds': remaining,
            'duree_minutes': examen.duree_minutes
        })

    @action(detail=True, methods=['post'])
    def log_event(self, request, pk=None):
        examen = self.get_object()
        user = request.user
        if not (user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile')):
            return Response({'detail': 'Accès étudiant requis'}, status=403)
        copie = CopieExamen.objects.filter(examen=examen, etudiant=user.etudiant_profile).first()
        if not copie:
            return Response({'detail': 'Aucune copie trouvée'}, status=404)
        from core.models import LogSurveillance
        LogSurveillance.objects.create(
            copie=copie,
            evenement=request.data.get('evenement', 'unknown'),
            details=request.data.get('details', {})
        )
        return Response({'status': 'logged'})

    @action(detail=True, methods=['post'])
    def ajouter_question(self, request, pk=None):
        examen = self.get_object()
        serializer = QuestionExamenSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(examen=examen)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        examen = self.get_object()
        questions = examen.questions.all().order_by('ordre')
        serializer = QuestionExamenSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def soumettre(self, request, pk=None):
        examen = self.get_object()
        user = request.user
        if not (user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile')):
            return Response({'detail': 'Seuls les étudiants peuvent soumettre un examen'}, status=403)

        etudiant = user.etudiant_profile
        copie, created = CopieExamen.objects.get_or_create(examen=examen, etudiant=etudiant)
        if copie.est_termine:
            return Response({'detail': 'Examen déjà soumis'}, status=400)

        reponses_data = request.data.get('reponses', [])
        for rep_data in reponses_data:
            question_id = rep_data.get('question_id')
            reponse_texte = rep_data.get('reponse', '')
            question = get_object_or_404(QuestionExamen, id=question_id, examen=examen)

            rep, _ = ReponseExamen.objects.get_or_create(copie=copie, question=question)
            rep.reponse_etudiant = reponse_texte

            if question.type_question in ('QCM', 'VRAI_FAUX'):
                rep.est_correct = reponse_texte.strip().lower() == question.reponse_correcte.strip().lower()
                rep.points_obtenus = question.points if rep.est_correct else 0
            else:
                rep.nb_mots = len(reponse_texte.split())
                fautes = auto_spell_check(reponse_texte)
                rep.fautes_orthographe = fautes

            rep.save()

        copie.est_termine = True
        copie.date_soumission = __import__('django').utils.timezone.now()
        copie.save()
        return Response(CopieExamenSerializer(copie).data)

    @action(detail=False, methods=['get'])
    def corrigeables(self, request):
        user = request.user
        if not (user.is_authenticated and user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile')):
            return Response({'detail': 'Accès enseignant requis'}, status=403)
        teacher = user.enseignant_profile
        examens = Examen.objects.filter(enseignant=teacher)
        copies = CopieExamen.objects.filter(examen__in=examens, est_termine=True)
        page = self.paginate_queryset(copies)
        if page is not None:
            serializer = CopieExamenSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = CopieExamenSerializer(copies, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='corriger/(?P<copie_id>[^/.]+)')
    def corriger_copie(self, request, pk=None, copie_id=None):
        examen = self.get_object()
        copie = get_object_or_404(CopieExamen, id=copie_id, examen=examen)
        corrections = request.data.get('corrections', [])

        for corr in corrections:
            rep_id = corr.get('reponse_id')
            points = corr.get('points_obtenus')
            commentaire = corr.get('commentaire', '')
            rep = get_object_or_404(ReponseExamen, id=rep_id, copie=copie)
            rep.points_obtenus = points
            rep.correction_commentaire = commentaire
            rep.save()

        total = sum(r.points_obtenus for r in copie.reponses.all())
        copie.note_obtenue = total
        copie.save()
        return Response(CopieExamenSerializer(copie).data)


def auto_spell_check(text):
    fautes = []
    mots = re.findall(r'\b\w+\b', text)
    dico_fr = {'est', 'un', 'une', 'le', 'la', 'les', 'des', 'du', 'de', 'ce', 'cet', 'cette',
               'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'nos', 'vos',
               'leur', 'leurs', 'au', 'aux', 'sur', 'sous', 'dans', 'avec', 'pour', 'par',
               'pas', 'plus', 'moins', 'très', 'trop', 'peu', 'assez', 'si', 'que', 'qui',
               'quoi', 'dont', 'où', 'comment', 'pourquoi', 'mais', 'ou', 'et', 'donc', 'or',
               'ni', 'car', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
               'on', 'me', 'te', 'se', 'nous', 'vous', 'le', 'la', 'les', 'lui', 'leur',
               'en', 'y', 'ne', 'à', 'été', 'être', 'avoir', 'faire', 'dire', 'pouvoir',
               'vouloir', 'savoir', 'voir', 'devoir', 'falloir', 'réponse', 'question',
               'exercice', 'devoir', 'note', 'cours', 'examen', 'matière', 'professeur',
               'étudiant', 'classe', 'école', 'de', 'l', 'd', 's', 'a', 'c', 'n'}
    for mot in mots:
        if len(mot) > 3 and mot.lower() not in dico_fr:
            if len(set(mot.lower())) < 3:
                fautes.append({'mot': mot, 'position': text.find(mot), 'suggestion': mot + '?'})
    return fautes


class QuestionExamenViewSet(viewsets.ModelViewSet):
    """API pour gérer les questions d'examen"""
    queryset = QuestionExamen.objects.all()
    serializer_class = QuestionExamenSerializer
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['ordre']
    ordering = ['ordre']

    def get_queryset(self):
        qs = QuestionExamen.objects.all()
        examen = self.request.query_params.get('examen')
        if examen:
            qs = qs.filter(examen_id=examen)
        return qs


class CopieExamenViewSet(viewsets.ModelViewSet):
    """API pour gérer les copies d'examen"""
    queryset = CopieExamen.objects.all()
    serializer_class = CopieExamenSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_debut', 'note_obtenue']
    ordering = ['-date_debut']

    def get_queryset(self):
        qs = CopieExamen.objects.all()
        user = self.request.user
        if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            qs = qs.filter(etudiant=user.etudiant_profile)
        examen = self.request.query_params.get('examen')
        if examen:
            qs = qs.filter(examen_id=examen)
        return qs

    @action(detail=True, methods=['post'])
    def soumettre(self, request, pk=None):
        copie = self.get_object()
        if copie.est_termine:
            return Response(
                {'detail': _('Cette copie a déjà été soumise')},
                status=400
            )
        copie.est_termine = True
        copie.date_soumission = __import__('django').utils.timezone.now()
        copie.save()
        serializer = self.get_serializer(copie)
        return Response(serializer.data)


class ReponseExamenViewSet(viewsets.ModelViewSet):
    """API pour gérer les réponses d'examen"""
    queryset = ReponseExamen.objects.all()
    serializer_class = ReponseExamenSerializer
    pagination_class = StandardPagination


class LogSurveillanceViewSet(viewsets.ModelViewSet):
    """API pour gérer les logs de surveillance"""
    queryset = LogSurveillance.objects.all()
    serializer_class = LogSurveillanceSerializer
    pagination_class = StandardPagination
    ordering = ['-date_evenement']


class CorrectionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        if not (user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile')):
            return Response({'detail': 'Accès enseignant requis'}, status=403)
        teacher = user.enseignant_profile

        matiere = request.query_params.get('matiere')
        niveau = request.query_params.get('niveau')
        etudiant_search = request.query_params.get('search', '')

        examens = Examen.objects.filter(enseignant=teacher)
        if matiere:
            examens = examens.filter(matiere_id=matiere)
        if niveau:
            examens = examens.filter(niveau_id=niveau)

        copies = CopieExamen.objects.filter(examen__in=examens, est_termine=True)

        if etudiant_search:
            from django.db.models import Q
            copies = copies.filter(
                Q(etudiant__utilisateur__prenom__icontains=etudiant_search) |
                Q(etudiant__utilisateur__username__icontains=etudiant_search) |
                Q(etudiant__numero_etudiant__icontains=etudiant_search)
            )

        copies = copies.select_related('etudiant__utilisateur', 'examen', 'examen__matiere')
        page = self.paginate_queryset(copies)
        if page is not None:
            serializer = CopieExamenSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = CopieExamenSerializer(copies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def classes(self, request):
        user = request.user
        if not (user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile')):
            return Response({'detail': 'Accès enseignant requis'}, status=403)
        teacher = user.enseignant_profile
        niveaux = set()
        for ex in Examen.objects.filter(enseignant=teacher):
            if ex.niveau:
                niveaux.add(ex.niveau)
        from core.serializers.pedagogie_serializers import NiveauScolaireSerializer
        return Response(NiveauScolaireSerializer(list(niveaux), many=True).data)

    @action(detail=False, methods=['get'])
    def matieres(self, request):
        user = request.user
        if not (user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile')):
            return Response({'detail': 'Accès enseignant requis'}, status=403)
        teacher = user.enseignant_profile
        matieres = set()
        for ex in Examen.objects.filter(enseignant=teacher):
            if ex.matiere:
                matieres.add(ex.matiere)
        from core.serializers.pedagogie_serializers import MatiereSerializer
        return Response(MatiereSerializer(list(matieres), many=True).data)

    @action(detail=True, methods=['post'])
    def noter(self, request, pk=None):
        copie = get_object_or_404(CopieExamen, id=pk)
        note = request.data.get('note')
        if note is not None:
            copie.note_obtenue = float(note)
            copie.save()
            return Response(CopieExamenSerializer(copie).data)
        return Response({'detail': 'Note requise'}, status=400)

    @action(detail=True, methods=['get'])
    def spellcheck(self, request, pk=None):
        copie = get_object_or_404(CopieExamen, id=pk)
        resultats = []
        for rep in copie.reponses.all():
            fautes = auto_spell_check(rep.reponse_etudiant)
            resultats.append({
                'reponse_id': rep.id,
                'question_id': rep.question_id,
                'nb_mots': len(rep.reponse_etudiant.split()),
                'fautes': fautes
            })
        return Response(resultats)

    def paginate_queryset(self, queryset):
        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, self.request)
        self.paginator = paginator
        return page

    def get_paginated_response(self, data):
        return self.paginator.get_paginated_response(data)


from rest_framework.views import APIView
from core.models.pedagogie import FichierMultimedia
from django.http import HttpResponseRedirect

class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, file_id):
        fichier = get_object_or_404(FichierMultimedia, id=file_id)
        token = request.query_params.get('token') or request.auth
        if not token:
            return Response({'detail': 'Authentification requise'}, status=401)
        url = fichier.url_fichier
        if url.startswith('/') or not url.startswith('http'):
            url = request.build_absolute_uri(url)
        return HttpResponseRedirect(url)


class MesNotesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.type_utilisateur != 'ETUDIANT' or not hasattr(user, 'etudiant_profile'):
            return Response({'detail': 'Accès étudiant requis'}, status=403)
        etudiant = user.etudiant_profile
        copies = CopieExamen.objects.filter(etudiant=etudiant, est_termine=True)\
            .select_related('examen__matiere', 'examen__niveau')\
            .order_by('examen__date_debut')
        data = []
        for c in copies:
            data.append({
                'id': c.id,
                'examen': c.examen.id,
                'examen_titre': c.examen.titre,
                'examen_matiere_nom': c.examen.matiere.nom if c.examen.matiere else 'Général',
                'examen_niveau_nom': c.examen.niveau.nom if c.examen.niveau else '',
                'examen_coefficient': c.examen.coefficient,
                'date_soumission': c.date_soumission,
                'note_obtenue': c.note_obtenue,
                'est_termine': c.est_termine,
            })
        return Response(data)
