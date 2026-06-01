from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Max
from django.shortcuts import get_object_or_404
import django.utils.timezone as timezone
from datetime import timedelta
from core.models import (
    NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia,
    SessionEtude, ProgressionChapitre, Etablissement, Classe
)
from core.serializers.pedagogie_serializers import (
    NiveauScolaireSerializer, MatiereSerializer, ChapitreSerializer,
    LeconSerializer, FichierMultimediaSerializer, ChapitreDetailSerializer,
    SessionEtudeSerializer, ClasseDetailSerializer
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

    def get_queryset(self):
        qs = Matiere.objects.all()
        niveau = self.request.query_params.get('niveau')
        etablissement = self.request.query_params.get('etablissement')
        if niveau and niveau != 'All':
            qs = qs.filter(niveaux__nom__iexact=niveau)

        # Étudiant : ne voir que les matières qui ont des leçons publiées
        # par un enseignant de son établissement, à son niveau
        user = self.request.user
        if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            student = user.etudiant_profile
            if student.etablissement and student.niveau:
                qs = qs.filter(
                    chapitres__lecons__est_publie=True,
                    chapitres__lecons__createur__etablissement=student.etablissement,
                    chapitres__niveau=student.niveau
                ).distinct()
            else:
                qs = qs.none()

        return qs

    @action(detail=True, methods=['get'])
    def chapitres(self, request, pk=None):
        """Retourner les chapitres d'une matière pour le niveau de l'étudiant"""
        matiere = self.get_object()
        chapitres = matiere.chapitres.all()
        niveau = request.query_params.get('niveau')
        if niveau:
            chapitres = chapitres.filter(niveau__nom__iexact=niveau)
        elif request.user.is_authenticated and request.user.type_utilisateur == 'ETUDIANT' and hasattr(request.user, 'etudiant_profile'):
            niveau_etudiant = request.user.etudiant_profile.niveau
            if niveau_etudiant:
                chapitres = chapitres.filter(niveau=niveau_etudiant)

        # Étudiant : ne voir que les chapitres avec leçons publiées par son établissement
        if request.user.is_authenticated and request.user.type_utilisateur == 'ETUDIANT' and hasattr(request.user, 'etudiant_profile'):
            student = request.user.etudiant_profile
            if student.etablissement:
                chapitres = chapitres.filter(
                    lecons__est_publie=True,
                    lecons__createur__etablissement=student.etablissement
                ).distinct()
            else:
                chapitres = chapitres.none()

        serializer = ChapitreDetailSerializer(chapitres, many=True, context={'request': request})
        return Response(serializer.data)


class ChapitreViewSet(viewsets.ModelViewSet):
    """API pour gérer les chapitres"""
    queryset = Chapitre.objects.all()
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['order']
    ordering = ['order']
    search_fields = ['titre', 'description']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChapitreDetailSerializer
        return ChapitreSerializer

    def get_queryset(self):
        qs = Chapitre.objects.all()
        user = self.request.user
        matiere = self.request.query_params.get('matiere')
        niveau = self.request.query_params.get('niveau')

        # Enseignant: voir ses chapitres (ceux quil a cree + ceux de sa matiere et niveau)
        if user.is_authenticated and user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
            teacher = user.enseignant_profile
            from core.models.pedagogie import Matiere as MatiereModel
            matieres_teacher = MatiereModel.objects.filter(nom__iexact=teacher.specialite)
            qs = qs.filter(
                Q(createur=teacher) |
                (Q(createur__isnull=True) & Q(matiere__in=matieres_teacher) & Q(niveau=teacher.niveau))
            ) if matieres_teacher.exists() and teacher.niveau else qs.filter(createur=teacher) if not matieres_teacher.exists() else qs.filter(
                Q(createur=teacher) |
                (Q(createur__isnull=True) & Q(matiere__in=matieres_teacher))
            )

        if not niveau and user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile') and user.etudiant_profile.niveau:
            niveau = user.etudiant_profile.niveau.nom

        # Étudiant : ne voir que les chapitres avec leçons publiées par son établissement
        if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            student = user.etudiant_profile
            if student.etablissement:
                qs = qs.filter(
                    lecons__est_publie=True,
                    lecons__createur__etablissement=student.etablissement
                ).distinct()
            else:
                qs = qs.none()

        if matiere:
            qs = qs.filter(matiere_id=matiere)
        if niveau:
            try:
                qs = qs.filter(niveau_id=int(niveau))
            except (ValueError, TypeError):
                qs = qs.filter(niveau__nom__iexact=niveau)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        defaults = {}
        if user.is_authenticated and user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
            teacher = user.enseignant_profile
            defaults['createur'] = teacher
            if teacher.niveau and 'niveau' not in serializer.validated_data:
                defaults['niveau'] = teacher.niveau
        matiere = serializer.validated_data.get('matiere')
        niveau = serializer.validated_data.get('niveau') or defaults.get('niveau')
        if matiere and niveau:
            last = Chapitre.objects.filter(matiere=matiere, niveau=niveau).aggregate(
                m=Max('order')
            )['m'] or 0
            defaults['order'] = last + 1
        serializer.save(**defaults)

    @action(detail=True, methods=['get'])
    def lecons(self, request, pk=None):
        chapitre = self.get_object()
        lecons = chapitre.lecons.all()
        if request.user.is_authenticated and request.user.type_utilisateur == 'ETUDIANT' and hasattr(request.user, 'etudiant_profile'):
            from django.db.models import Q
            q_filter = Q(est_publie=True)
            etudiant = request.user.etudiant_profile
            if etudiant.etablissement:
                q_filter &= Q(createur__etablissement=etudiant.etablissement)
            lecons = lecons.filter(q_filter)
        elif request.user.is_authenticated and request.user.type_utilisateur == 'ETUDIANT':
            lecons = lecons.filter(est_publie=True)
        serializer = LeconSerializer(lecons, many=True)
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
        
        return Response({
            "error": "Aucune question de validation n'est configurée pour ce chapitre.",
            "detail": "Veuillez contacter un enseignant."
        }, status=404)

    @action(detail=True, methods=['get', 'post', 'delete'], url_path='qcm-validation')
    def qcm_validation(self, request, pk=None):
        chapitre = self.get_object()
        from core.models.examens import Examen, QuestionExamen

        if request.method == 'GET':
            examen = Examen.objects.filter(
                titre__startswith=f"Validation - {chapitre.titre}",
                type_examen='QCM'
            ).first()
            if not examen:
                return Response({"exists": False, "questions": []})
            questions = examen.questions.all().order_by('ordre')
            return Response({
                "exists": True,
                "examen_id": examen.id,
                "duree": examen.duree_minutes,
                "questions": [{
                    "id": q.id,
                    "texte": q.texte,
                    "options": q.options,
                    "reponse_correcte": q.reponse_correcte,
                    "points": q.points,
                    "ordre": q.ordre,
                } for q in questions]
            })

        user = request.user
        if not (user.is_authenticated and user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile')):
            return Response({"error": "Seuls les enseignants peuvent créer un QCM de validation"}, status=403)

        if request.method == 'DELETE':
            Examen.objects.filter(
                titre__startswith=f"Validation - {chapitre.titre}",
                type_examen='QCM'
            ).delete()
            return Response({"status": "deleted"})

        # POST - create or update QCM validation
        questions_data = request.data.get('questions', [])
        if not questions_data:
            return Response({"error": "Aucune question fournie"}, status=400)

        examen, created = Examen.objects.update_or_create(
            titre__startswith=f"Validation - {chapitre.titre}",
            type_examen='QCM',
            defaults={
                'titre': f"Validation - {chapitre.titre}",
                'enseignant': user.enseignant_profile,
                'matiere': chapitre.matiere,
                'niveau': chapitre.niveau,
                'duree_minutes': request.data.get('duree', 15),
                'date_debut': timezone.now(),
                'date_fin': timezone.now() + timedelta(hours=1),
                'est_publie': True,
                'type_examen': 'QCM'
            }
        )

        examen.questions.all().delete()
        for i, qdata in enumerate(questions_data):
            QuestionExamen.objects.create(
                examen=examen,
                texte=qdata['texte'],
                type_question='QCM',
                points=qdata.get('points', 1),
                ordre=i + 1,
                options=qdata.get('options', []),
                reponse_correcte=qdata['reponse_correcte'],
                obligatoire=True
            )

        return Response({
            "status": "qcm_saved",
            "examen_id": examen.id,
            "nb_questions": len(questions_data),
            "created": created
        })

    @action(detail=False, methods=['post'])
    def upload_file(self, request):
        lecon_id = request.data.get('lecon_id')
        if not lecon_id:
            return Response({"error": "lecon_id requis"}, status=400)

        lecon = get_object_or_404(Lecon, id=lecon_id)
        fichier = request.FILES.get('fichier')
        if not fichier:
            return Response({"error": "Fichier requis"}, status=400)

        ext = fichier.name.split('.')[-1].lower()
        type_map = {'pdf': 'PDF', 'mp4': 'VIDEO', 'webm': 'VIDEO', 'mp3': 'AUDIO', 'wav': 'AUDIO'}
        type_fichier = type_map.get(ext, 'PDF')

        from django.core.files.storage import default_storage
        import uuid
        unique_name = f"{uuid.uuid4().hex}_{fichier.name}"
        relative_path = f"lessons/{lecon_id}/{unique_name}"
        saved_path = default_storage.save(relative_path, fichier)

        from django.conf import settings
        fm = FichierMultimedia.objects.create(
            type_fichier=type_fichier,
            titre=request.data.get('titre', fichier.name),
            url_fichier=settings.MEDIA_URL + saved_path,
            taille_no=fichier.size / (1024 * 1024),
            lecon=lecon,
            format=ext,
            est_telechargeable=request.data.get('est_telechargeable', 'true').lower() == 'true',
            metadata={'original_name': fichier.name}
        )
        serializer = FichierMultimediaSerializer(fm)
        return Response(serializer.data, status=201)


class LeconViewSet(viewsets.ModelViewSet):
    """API pour gérer les leçons"""
    queryset = Lecon.objects.all()
    serializer_class = LeconSerializer
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['order']
    ordering = ['order']
    search_fields = ['titre', 'contenue_texte']

    def perform_create(self, serializer):
        user = self.request.user
        defaults = {}
        if user.is_authenticated and user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
            teacher = user.enseignant_profile
            defaults['createur'] = teacher
            chapitre = serializer.validated_data.get('chapitre')
            if chapitre and teacher.niveau and chapitre.niveau != teacher.niveau:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Ce chapitre n'appartient pas à votre niveau d'enseignement.")
        chapitre = serializer.validated_data.get('chapitre') or defaults.get('chapitre')
        if chapitre:
            last = Lecon.objects.filter(chapitre=chapitre).aggregate(
                m=Max('order')
            )['m'] or 0
            defaults['order'] = last + 1
        serializer.save(**defaults)

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        if not self._can_modify(user, instance):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous ne pouvez modifier que vos propres leçons.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not self._can_modify(user, instance):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous ne pouvez supprimer que vos propres leçons.")
        instance.delete()

    def _can_modify(self, user, lecon):
        if not user.is_authenticated:
            return False
        if user.type_utilisateur == 'ADMINISTRATEUR':
            return True
        if user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
            teacher = user.enseignant_profile
            if lecon.createur and lecon.createur == teacher:
                return True
            if not lecon.createur and lecon.chapitre.createur == teacher:
                return True
        return False

    def get_queryset(self):
        queryset = Lecon.objects.all()
        user = self.request.user
        
        niveau_param = self.request.query_params.get('niveau')
        matiere = self.request.query_params.get('matiere')
        chapitre = self.request.query_params.get('chapitre')
        
        niveau = niveau_param

        if not niveau or niveau == 'All':
            if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
                if user.etudiant_profile.niveau:
                    niveau = user.etudiant_profile.niveau.nom

        # Les etudiants ne voient que les lecons publiees par les enseignants de leur etablissement
        if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            student = user.etudiant_profile
            from django.db.models import Q
            q_filter = Q(est_publie=True)
            if student.etablissement:
                q_filter &= Q(createur__etablissement=student.etablissement)
            queryset = queryset.filter(q_filter)
        # Les enseignants voient leurs propres lecons (meme brouillons) + les lecons publiees de leur matiere et niveau
        elif user.is_authenticated and user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
            teacher = user.enseignant_profile
            from django.db.models import Q
            from core.models.pedagogie import Matiere as MatiereModel
            matieres_teacher = MatiereModel.objects.filter(nom__iexact=teacher.specialite)
            q_filter = Q(createur=teacher)
            if teacher.niveau and matieres_teacher.exists():
                q_filter |= (Q(est_publie=True) & Q(chapitre__matiere__in=matieres_teacher) & Q(chapitre__niveau=teacher.niveau))
            elif teacher.niveau:
                q_filter |= (Q(est_publie=True) & Q(chapitre__niveau=teacher.niveau))
            elif matieres_teacher.exists():
                q_filter |= (Q(est_publie=True) & Q(chapitre__matiere__in=matieres_teacher))
            else:
                q_filter |= Q(est_publie=True)
            queryset = queryset.filter(q_filter)
        
        if chapitre:
            queryset = queryset.filter(chapitre_id=chapitre)
        if niveau and niveau != 'All':
            queryset = queryset.filter(chapitre__niveau__nom__iexact=niveau)
        if matiere and matiere != 'All':
            queryset = queryset.filter(chapitre__matiere__nom__iexact=matiere)
            
        return queryset.select_related('chapitre', 'chapitre__niveau', 'chapitre__matiere', 'createur')

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

    @action(detail=False, methods=['get'])
    def enseignants(self, request):
        user = request.user
        if user.is_authenticated and user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
            lecons = Lecon.objects.filter(
                chapitre__in=Chapitre.objects.filter(
                    matiere__nom__iexact=user.enseignant_profile.specialite
                )
            )
            serializer = self.get_serializer(lecons, many=True)
            return Response(serializer.data)
        return Response([])

class SessionEtudeViewSet(viewsets.ModelViewSet):
    """API pour gérer les sessions d'étude et le chronomètre"""
    queryset = SessionEtude.objects.all()
    serializer_class = SessionEtudeSerializer
    permission_classes = [IsEtudiant]

    def get_queryset(self):
        return SessionEtude.objects.filter(etudiant=self.request.user.etudiant_profile)

    @action(detail=False, methods=['post'], url_path='start')
    def start_session(self, request, pk=None):
        chapitre_id = request.data.get('chapitre_id') or pk
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
        session = self.get_object()
        session.statut = 'TERMINE'
        session.date_fin = timezone.now()
        session.save()
        return Response({"status": "ended", "total_time": session.temps_cumule_secondes})



class FichierMultimediaViewSet(viewsets.ModelViewSet):
    """API pour gérer les fichiers multimédia"""
    queryset = FichierMultimedia.objects.all()
    serializer_class = FichierMultimediaSerializer
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['titre', 'type_fichier']

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


class ClasseViewSet(viewsets.ReadOnlyModelViewSet):
    """API pour lister les classes avec leurs élèves et professeurs"""
    queryset = Classe.objects.all().select_related(
        'niveau', 'etablissement'
    ).prefetch_related(
        'etudiants__utilisateur'
    )
    serializer_class = ClasseDetailSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'etablissement__nom', 'niveau__nom']
    ordering_fields = ['niveau__ordre', 'nom']
    ordering = ['niveau__ordre', 'nom']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        etablissement_id = self.request.query_params.get('etablissement')
        niveau_id = self.request.query_params.get('niveau')

        if etablissement_id:
            qs = qs.filter(etablissement_id=etablissement_id)
        if niveau_id:
            qs = qs.filter(niveau_id=niveau_id)

        if user.type_utilisateur == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
            enseignant = user.enseignant_profile
            if enseignant.etablissement:
                qs = qs.filter(etablissement=enseignant.etablissement)
            else:
                qs = qs.none()
            if enseignant.niveau:
                qs = qs.filter(niveau=enseignant.niveau)
            classes_teacher = Classe.objects.filter(
                etablissement=enseignant.etablissement,
                niveau=enseignant.niveau
            ) if enseignant.etablissement and enseignant.niveau else Classe.objects.none()
            if not qs.exists() and classes_teacher.exists():
                qs = classes_teacher
        # Étudiant: ne voir que sa propre classe
        elif user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            qs = qs.filter(id=user.etudiant_profile.classe_id)

        return qs
