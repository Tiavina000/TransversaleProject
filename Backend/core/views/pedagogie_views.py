from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from core.models import (
    NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia, SessionEtude, ProgressionChapitre
)
from core.serializers.pedagogie_serializers import (
    NiveauScolaireSerializer, MatiereSerializer, ChapitreSerializer,
    LeconSerializer, FichierMultimediaSerializer, ChapitreDetailSerializer,
    SessionEtudeSerializer
)
from core.permissions import IsEnseignantOrReadOnly, IsAdminOrReadOnly, IsEtudiant


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class NiveauScolaireViewSet(viewsets.ModelViewSet):
    """API pour gérer les niveaux scolaires"""
    queryset = NiveauScolaire.objects.all()
    serializer_class = NiveauScolaireSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = StandardPagination
    ordering_fields = ['ordre']
    ordering = ['ordre']


class MatiereViewSet(viewsets.ModelViewSet):
    """API pour gérer les matières"""
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'code']
    ordering_fields = ['ordre', 'nom']
    ordering = ['ordre']

    @action(detail=True, methods=['get'])
    def chapitres(self, request, pk=None):
        """Retourner tous les chapitres d'une matière"""
        matiere = self.get_object()
        chapitres = matiere.chapitres.all()
        serializer = ChapitreDetailSerializer(chapitres, many=True)
        return Response(serializer.data)


class ChapitreViewSet(viewsets.ModelViewSet):
    """API pour gérer les chapitres"""
    queryset = Chapitre.objects.all()
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order']
    ordering = ['order']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChapitreDetailSerializer
        return ChapitreSerializer

    @action(detail=True, methods=['get'])
    def lecons(self, request, pk=None):
        chapitre = self.get_object()
        serializer = LeconSerializer(chapitre.lecons.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='validate')
    def validate(self, request, pk=None):
        from core.models.pedagogie import ProgressionChapitre
        chapitre = self.get_object()
        user = request.user
        
        if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            prog, created = ProgressionChapitre.objects.get_or_create(
                etudiant=user.etudiant_profile,
                chapitre=chapitre
            )
            prog.est_valide = True
            prog.temps_passe_secondes += 1800 
            prog.save()
            return Response({"status": "validated"})
            
        return Response({"error": "Unauthorized"}, status=403)

    @action(detail=True, methods=['get'], url_path='validation-question')
    def validation_question(self, request, pk=None):
        from core.models.examens import QuestionExamen
        chapitre = self.get_object()
        
        question = QuestionExamen.objects.filter(
            examen__matiere=chapitre.matiere,
            examen__niveau=chapitre.niveau
        ).order_by('?').first()

        if question:
            return Response({
                "id": question.id,
                "texte": question.texte,
                "options": question.options,
                "reponse_correcte": question.reponse_correcte,
                "type_question": question.type_question
            })
        
        # Si aucune question n'est trouvée, on retourne une erreur explicite
        return Response({
            "error": "Aucune question de validation n'est configurée pour ce chapitre.",
            "detail": "Veuillez contacter un enseignant."
        }, status=404)


class LeconViewSet(viewsets.ModelViewSet):
    """API pour gérer les leçons"""
    queryset = Lecon.objects.all()
    serializer_class = LeconSerializer
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order']
    ordering = ['order']

    def get_queryset(self):
        queryset = Lecon.objects.all()
        user = self.request.user
        
        # Get filters from query params
        niveau_param = self.request.query_params.get('niveau')
        matiere = self.request.query_params.get('matiere')
        
        # Determine the level to filter by
        niveau = niveau_param
        
        # If user is a student and no specific level was asked, use their own level
        if not niveau or niveau == 'All':
            if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
                if user.etudiant_profile.niveau:
                    niveau = user.etudiant_profile.niveau.nom
        
        if niveau and niveau != 'All':
            queryset = queryset.filter(chapitre__niveau__nom__iexact=niveau)
        if matiere and matiere != 'All':
            queryset = queryset.filter(chapitre__matiere__nom__iexact=matiere)
            
        return queryset.select_related('chapitre', 'chapitre__niveau', 'chapitre__matiere')

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        from core.models.pedagogie import ProgressionChapitre
        lecon = self.get_object()
        user = request.user
        
        if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            prog = ProgressionChapitre.objects.filter(
                etudiant=user.etudiant_profile,
                chapitre=lecon.chapitre
            ).first()
            if prog:
                return Response({
                    "progress": 100 if prog.est_valide else 0,
                    "completed": prog.est_valide,
                    "time_spent": prog.temps_passe_secondes
                })
                
        return Response({"progress": 0, "completed": False})

class SessionEtudeViewSet(viewsets.ModelViewSet):
    """API pour gérer les sessions d'étude et le chronomètre"""
    queryset = SessionEtude.objects.all()
    serializer_class = SessionEtudeSerializer
    permission_classes = [IsEtudiant]

    def get_queryset(self):
        return SessionEtude.objects.filter(etudiant=self.request.user.etudiant_profile)

    @action(detail=False, methods=['post'], url_path='start')
    def start_session(self, request):
        chapitre_id = request.data.get('chapitre_id')
        chapitre = Chapitre.objects.get(id=chapitre_id)
        etudiant = request.user.etudiant_profile
        
        # Clôturer les anciennes sessions en cours pour ce chapitre
        SessionEtude.objects.filter(etudiant=etudiant, chapitre=chapitre, statut='EN_COURS').update(statut='ABANDONNE')
        
        session = SessionEtude.objects.create(
            etudiant=etudiant,
            chapitre=chapitre,
            statut='EN_COURS'
        )
        return Response(SessionEtudeSerializer(session).data)

    @action(detail=True, methods=['post'], url_path='heartbeat')
    def heartbeat(self, request, pk=None):
        session = self.get_object()
        if session.statut == 'EN_COURS':
            session.temps_cumule_secondes += 30 # heartbeat toutes les 30s
            session.save()
            
            # Update global progression too
            prog, _ = ProgressionChapitre.objects.get_or_create(
                etudiant=session.etudiant,
                chapitre=session.chapitre
            )
            prog.temps_passe_secondes += 30
            prog.save()
            
        return Response({"seconds": session.temps_cumule_secondes})

    @action(detail=True, methods=['post'], url_path='pause')
    def pause_session(self, request, pk=None):
        session = self.get_object()
        session.statut = 'PAUSE'
        session.save()
        return Response({"status": "paused"})

    @action(detail=True, methods=['post'], url_path='resume')
    def resume_session(self, request, pk=None):
        session = self.get_object()
        session.statut = 'EN_COURS'
        session.save()
        return Response({"status": "resumed"})

    @action(detail=True, methods=['post'], url_path='end')
    def end_session(self, request, pk=None):
        import django.utils.timezone as timezone
        session = self.get_object()
        session.statut = 'TERMINE'
        session.date_fin = timezone.now()
        session.save()
        return Response({"status": "ended", "total_time": session.temps_cumule_secondes})


class StudentStatsView(APIView):
    """Statistiques de progression pour l'étudiant"""
    permission_classes = [IsEtudiant]
    
    def get(self, request):
        from django.db.models import Sum, Count
        etudiant = request.user.etudiant_profile
        
        # Temps par matière
        stats_matieres = ProgressionChapitre.objects.filter(etudiant=etudiant) \
            .values('chapitre__matiere__nom') \
            .annotate(
                total_secondes=Sum('temps_passe_secondes'),
                chapitres_valides=Count('id', filter=Q(est_valide=True)),
                total_chapitres=Count('id')
            )
            
        total_time = ProgressionChapitre.objects.filter(etudiant=etudiant).aggregate(Sum('temps_passe_secondes'))['temps_passe_secondes__sum'] or 0
        total_valides = ProgressionChapitre.objects.filter(etudiant=etudiant, est_valide=True).count()
        
        return Response({
            "total_study_time": total_time,
            "total_validated_chapters": total_valides,
            "matieres": list(stats_matieres)
        })




class FichierMultimediaViewSet(viewsets.ModelViewSet):
    """API pour gérer les fichiers multimédia"""
    queryset = FichierMultimedia.objects.all()
    serializer_class = FichierMultimediaSerializer
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['titre', 'type_fichier']


from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.models import Q
from core.models import Etablissement

class PublicSearchView(APIView):
    """API de recherche publique pour la landing page"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response([])
        
        results = []
        
        # Recherche dans les matières
        matieres = Matiere.objects.filter(Q(nom__icontains=query) | Q(code__icontains=query))[:3]
        for m in matieres:
            results.append({
                'id': m.id,
                'titre': m.nom,
                'type': 'Matière',
                'niveau': 'Multi-niveaux'
            })
            
        # Recherche dans les chapitres
        chapitres = Chapitre.objects.filter(titre__icontains=query).select_related('niveau')[:5]
        for c in chapitres:
            results.append({
                'id': c.id,
                'titre': c.titre,
                'type': 'Chapitre',
                'niveau': c.niveau.nom
            })
            
        # Recherche dans les établissements
        etabs = Etablissement.objects.filter(nom__icontains=query)[:3]
        for e in etabs:
            results.append({
                'id': e.id,
                'titre': e.nom,
                'type': 'Établissement',
                'niveau': 'National'
            })
            
        return Response(results)
