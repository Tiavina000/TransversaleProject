from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from core.models import (
    Examen, QuestionExamen, CopieExamen, ReponseExamen, LogSurveillance,
    Enseignant, Notification, Etudiant
)
from core.serializers.examens_serializers import (
    ExamenSerializer, QuestionExamenSerializer, CopieExamenSerializer,
    ReponseExamenSerializer, LogSurveillanceSerializer
)
from core.permissions import IsEnseignantOrReadOnly
from django.utils.translation import gettext as _
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db import IntegrityError
import traceback
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
        elif user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            etudiant = user.etudiant_profile
            qs = qs.filter(est_publie=True)
            if etudiant.etablissement:
                qs = qs.filter(enseignant__etablissement=etudiant.etablissement)
            if etudiant.niveau:
                qs = qs.filter(niveau=etudiant.niveau)
        matiere = self.request.query_params.get('matiere')
        niveau = self.request.query_params.get('niveau')
        if matiere:
            qs = qs.filter(matiere_id=matiere)
        if niveau:
            qs = qs.filter(niveau_id=niveau)
        return qs

    def perform_create(self, serializer):
        defaults = {}
        if self.request.user.is_authenticated and hasattr(self.request.user, 'enseignant_profile'):
            teacher = self.request.user.enseignant_profile
            defaults['enseignant'] = teacher
            if teacher.niveau and 'niveau' not in serializer.validated_data:
                defaults['niveau'] = teacher.niveau
        if 'date_debut' not in serializer.validated_data:
            defaults.setdefault('date_debut', timezone.now())
        if 'date_fin' not in serializer.validated_data:
            defaults.setdefault('date_fin', timezone.now() + timedelta(hours=1))
        serializer.save(**defaults)

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
        # Notifier tous les étudiants du niveau concerné
        etudiants = Etudiant.objects.filter(niveau=examen.niveau)
        for etudiant in etudiants:
            Notification.objects.create(
                utilisateur=etudiant.utilisateur,
                titre=f"Nouvel examen : {examen.titre}",
                message=f"Un nouvel examen '{examen.titre}' est disponible dans la matière {examen.matiere.nom}.",
                url_lien=f"/examens/{examen.id}"
            )
        return Response({'status': 'published', 'notified': etudiants.count()})

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
                elapsed = (timezone.now() - copie.date_debut).total_seconds()
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
            try:
                serializer.save(examen=examen)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                return Response(
                    {'detail': 'Une question avec le même ordre existe déjà pour cet examen.', 'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                traceback.print_exc()
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        examen = self.get_object()
        questions = examen.questions.all().order_by('ordre')
        serializer = QuestionExamenSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='submit')
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
        copie.date_soumission = timezone.now()
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
        copie.date_soumission = timezone.now()
        copie.save()
        serializer = self.get_serializer(copie)
        return Response(serializer.data)


class ReponseExamenViewSet(viewsets.ModelViewSet):
    """API pour gérer les réponses d'examen"""
    queryset = ReponseExamen.objects.all()
    serializer_class = ReponseExamenSerializer
    pagination_class = StandardPagination

    def perform_update(self, serializer):
        instance = self.get_object()
        est_correct = serializer.validated_data.get('est_correct')
        if est_correct is not None:
            serializer.save(points_obtenus=instance.question.points if est_correct else 0)
        else:
            serializer.save()


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
        statut_filter = request.query_params.get('statut', 'soumis')

        examens = Examen.objects.filter(enseignant=teacher)
        if matiere:
            examens = examens.filter(matiere_id=matiere)
        if niveau:
            examens = examens.filter(niveau_id=niveau)

        copies = CopieExamen.objects.filter(examen__in=examens, est_termine=True)
        copies = copies.prefetch_related('reponses')

        if statut_filter == 'soumis':
            copies = copies.filter(note_obtenue__isnull=True)
        elif statut_filter == 'corrige':
            copies = copies.filter(note_obtenue__isnull=False)

        if etudiant_search:
            from django.db.models import Q
            copies = copies.filter(
                Q(etudiant__utilisateur__prenom__icontains=etudiant_search) |
                Q(etudiant__utilisateur__username__icontains=etudiant_search) |
                Q(etudiant__numero_etudiant__icontains=etudiant_search)
            )

        copies = copies.select_related('etudiant__utilisateur', 'examen', 'examen__matiere')
        from core.serializers.examens_serializers import CopieCorrectionSerializer
        page = self.paginate_queryset(copies)
        if page is not None:
            serializer = CopieCorrectionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = CopieCorrectionSerializer(copies, many=True)
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
        if copie.note_validee:
            return Response({'detail': 'Cette copie a déjà été validée et ne peut plus être modifiée.'}, status=400)
        note = request.data.get('note')
        if note is not None:
            copie.note_obtenue = float(note)
            copie.save()
            # Notifier l'étudiant
            Notification.objects.create(
                utilisateur=copie.etudiant.utilisateur,
                titre=f"Résultat : {copie.examen.titre}",
                message=f"Votre copie pour l'examen '{copie.examen.titre}' a été corrigée. Note obtenue : {note}/20.",
                url_lien=f"/resultats/{copie.id}"
            )
            return Response(CopieExamenSerializer(copie).data)
        return Response({'detail': 'Note requise'}, status=400)

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        copie = get_object_or_404(CopieExamen, id=pk)
        if copie.note_validee:
            return Response({'detail': 'Cette copie est déjà validée.'}, status=400)
        if copie.note_obtenue is None:
            reponses = copie.reponses.all()
            pts = sum(r.points_obtenus or 0 for r in reponses)
            max_pts = sum(r.question.points for r in reponses if r.question)
            copie.note_obtenue = round((pts / max_pts * 20) if max_pts > 0 else 0, 2)
        copie.note_validee = True
        copie.date_validation = timezone.now()
        copie.save()
        # Notifier l'étudiant
        Notification.objects.create(
            utilisateur=copie.etudiant.utilisateur,
            titre=f"Note validée : {copie.examen.titre}",
            message=f"Votre note pour l'examen '{copie.examen.titre}' a été publiée : {copie.note_obtenue}/20.",
            url_lien=f"/bulletin"
        )
        return Response(CopieExamenSerializer(copie).data)

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
from core.models.etablissements import Classe
from django.http import HttpResponseRedirect

class NotesEnseignantView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.type_utilisateur != 'ENSEIGNANT' or not hasattr(user, 'enseignant_profile'):
            return Response({'detail': 'Accès enseignant requis'}, status=403)
        enseignant = user.enseignant_profile

        classe_id = request.query_params.get('classe')
        matiere_id = request.query_params.get('matiere')

        examens = Examen.objects.filter(enseignant=enseignant)
        if matiere_id:
            examens = examens.filter(matiere_id=matiere_id)

        copies = CopieExamen.objects.filter(
            examen__in=examens,
            est_termine=True
        ).select_related(
            'etudiant__utilisateur',
            'etudiant__classe',
            'examen__matiere'
        )

        if classe_id:
            copies = copies.filter(etudiant__classe_id=classe_id)

        classes_enseignant = Classe.objects.filter(
            etablissement=enseignant.etablissement
        )
        if enseignant.niveau:
            classes_enseignant = classes_enseignant.filter(niveau=enseignant.niveau)

        eleves_notes = {}
        for c in copies:
            key = c.etudiant.id
            if key not in eleves_notes:
                eleves_notes[key] = {
                    'etudiant_id': c.etudiant.id,
                    'prenom': c.etudiant.utilisateur.prenom,
                    'nom_utilisateur': c.etudiant.utilisateur.username,
                    'classe': c.etudiant.classe.nom if c.etudiant.classe else 'N/A',
                    'classe_id': c.etudiant.classe_id,
                    'notes': [],
                    'total_points': 0,
                    'nb_examens': 0,
                }
            eleves_notes[key]['notes'].append({
                'copie_id': c.id,
                'examen_id': c.examen.id,
                'examen_titre': c.examen.titre,
                'matiere': c.examen.matiere.nom if c.examen.matiere else 'Général',
                'matiere_id': c.examen.matiere_id,
                'note': c.note_obtenue,
                'coefficient': c.examen.coefficient,
                'date_soumission': c.date_soumission,
            })
            if c.note_obtenue is not None:
                eleves_notes[key]['total_points'] += c.note_obtenue * c.examen.coefficient
                eleves_notes[key]['nb_examens'] += 1

        moyennes_par_classe = {}
        for c in classes_enseignant:
            copies_classe = copies.filter(etudiant__classe=c)
            if copies_classe.exists():
                from django.db.models import Avg
                moyenne = copies_classe.aggregate(m=Avg('note_obtenue'))['m']
                if moyenne:
                    moyennes_par_classe[c.nom] = round(moyenne, 2)

        moyennes_par_matiere = {}
        matiere_examens = examens.values_list('matiere_id', flat=True).distinct()
        from core.models.pedagogie import Matiere as MatiereModel
        for m_id in matiere_examens:
            if m_id:
                copies_matiere = copies.filter(examen__matiere_id=m_id)
                if copies_matiere.exists():
                    from django.db.models import Avg
                    moyenne = copies_matiere.aggregate(m=Avg('note_obtenue'))['m']
                    matiere = MatiereModel.objects.filter(id=m_id).first()
                    if moyenne and matiere:
                        moyennes_par_matiere[matiere.nom] = round(moyenne, 2)

        return Response({
            'eleves': list(eleves_notes.values()),
            'moyennes_par_classe': moyennes_par_classe,
            'moyennes_par_matiere': moyennes_par_matiere,
        })


class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, file_id):
        fichier = get_object_or_404(FichierMultimedia, id=file_id)
        token = request.query_params.get('token') or request.auth
        if not token:
            return Response({'detail': 'Authentification requise'}, status=401)

        from django.conf import settings
        import os

        url = fichier.url_fichier
        if url and url.startswith(settings.MEDIA_URL):
            file_path = os.path.join(settings.MEDIA_ROOT, url[len(settings.MEDIA_URL):])
            if os.path.exists(file_path):
                from django.http import FileResponse
                response = FileResponse(open(file_path, 'rb'), as_attachment=True, filename=fichier.titre or os.path.basename(file_path))
                return response

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
        copies = CopieExamen.objects.filter(etudiant=etudiant, est_termine=True, note_validee=True)\
            .select_related('examen__matiere', 'examen__niveau')\
            .order_by('examen__date_debut')
        # Grouper par matiere
        from collections import defaultdict
        by_matiere = defaultdict(list)
        for c in copies:
            matiere_nom = c.examen.matiere.nom if c.examen.matiere else 'Général'
            by_matiere[matiere_nom].append(c)
        data = []
        for matiere_nom, grp in by_matiere.items():
            # Separer CC et EF
            cc_notes = [c.note_obtenue for c in grp if c.examen.session == 'CC' and c.note_obtenue is not None]
            ef_notes = [c.note_obtenue for c in grp if c.examen.session == 'EF' and c.note_obtenue is not None]
            cc_moy = sum(cc_notes) / len(cc_notes) if cc_notes else None
            ef_moy = sum(ef_notes) / len(ef_notes) if ef_notes else None
            if ef_moy is not None and cc_moy is not None:
                note = round((cc_moy + ef_moy) / 2, 2)
            elif ef_moy is not None:
                note = round(ef_moy, 2)
            elif cc_moy is not None:
                note = round(cc_moy, 2)
            else:
                continue
            # Coefficient et date
            first = grp[0]
            data.append({
                'matiere_nom': matiere_nom,
                'coefficient': first.examen.coefficient,
                'note': note,
                'date_soumission': first.date_soumission,
                'a_cc': cc_moy is not None,
                'a_ef': ef_moy is not None,
            })
        return Response(data)
