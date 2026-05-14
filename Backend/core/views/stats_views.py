from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Count
from core.models import Utilisateur, Etudiant, Etablissement, Lecon

class GlobalStatsView(APIView):
    """
    Vue pour récupérer les statistiques réelles de la plateforme.
    Accessible par tous pour le dashboard informatif.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        stats = {
            'total_users': Utilisateur.objects.count(),
            'total_students': Etudiant.objects.count(),
            'total_schools': Etablissement.objects.count(),
            'total_lessons': Lecon.objects.count(),
        }
        return Response(stats)

from core.models.pedagogie import ProgressionChapitre
from rest_framework.permissions import IsAuthenticated

class StudentStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.type_utilisateur != 'ETUDIANT' or not hasattr(user, 'etudiant_profile'):
            return Response({"error": "Not a student"}, status=400)
            
        etudiant = user.etudiant_profile
        progressions = ProgressionChapitre.objects.filter(etudiant=etudiant).select_related('chapitre__matiere')
        
        total_time_seconds = sum(p.temps_passe_secondes for p in progressions)
        total_time_hours = round(total_time_seconds / 3600, 1)
        
        subjects_time = {}
        for p in progressions:
            matiere_nom = p.chapitre.matiere.nom
            subjects_time[matiere_nom] = subjects_time.get(matiere_nom, 0) + p.temps_passe_secondes
            
        for k in subjects_time:
            subjects_time[k] = round(subjects_time[k] / 3600, 1)
            
        exercices_valides = progressions.filter(est_valide=True).count()
        
        return Response({
            "total_time_hours": total_time_hours,
            "subjects": subjects_time,
            "exercises_done": exercices_valides
        })
