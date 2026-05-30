from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.models import Utilisateur, Etudiant, Etablissement, Lecon, Classe
from core.models.pedagogie import ProgressionChapitre, Chapitre
from core.models.examens import Examen, CopieExamen


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


class StudentStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.type_utilisateur != 'ETUDIANT' or not hasattr(user, 'etudiant_profile'):
            return Response({"error": "Not a student"}, status=400)

        etudiant = user.etudiant_profile
        niveau = etudiant.niveau

        if niveau is None:
            return Response({
                "total_time_hours": 0,
                "total_study_time": 0,
                "total_validated_chapters": 0,
                "exercises_done": 0,
                "pending_chapters": 0,
                "total_chapters": 0,
                "subjects": {},
                "matieres": [],
            })

        chapitres_du_niveau = Chapitre.objects.filter(niveau=niveau)
        total_chapters = chapitres_du_niveau.count()

        progressions = ProgressionChapitre.objects.filter(
            etudiant=etudiant,
            chapitre__in=chapitres_du_niveau
        ).select_related('chapitre__matiere')

        total_time_seconds = sum(p.temps_passe_secondes for p in progressions)
        total_time_hours = round(total_time_seconds / 3600, 1)
        validated = progressions.filter(est_valide=True).count()

        pending = total_chapters - validated
        if pending < 0:
            pending = 0

        matiere_map = {}
        for ch in chapitres_du_niveau.select_related('matiere').order_by('matiere__nom'):
            nom = ch.matiere.nom
            if nom not in matiere_map:
                matiere_map[nom] = {
                    'chapitre__matiere__nom': nom,
                    'total_chapitres': 0,
                    'total_secondes': 0,
                    'chapitres_valides': 0,
                }
            matiere_map[nom]['total_chapitres'] += 1

        for p in progressions:
            nom = p.chapitre.matiere.nom
            if nom in matiere_map:
                matiere_map[nom]['total_secondes'] += p.temps_passe_secondes
                if p.est_valide:
                    matiere_map[nom]['chapitres_valides'] += 1

        subjects_time = {}
        for nom, data in matiere_map.items():
            subjects_time[nom] = round(data['total_secondes'] / 3600, 1)

        return Response({
            "total_time_hours": total_time_hours,
            "total_study_time": total_time_seconds,
            "total_validated_chapters": validated,
            "exercises_done": validated,
            "pending_chapters": pending,
            "total_chapters": total_chapters,
            "subjects": subjects_time,
            "matieres": list(matiere_map.values()),
        })


class TeacherStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.type_utilisateur != 'ENSEIGNANT' or not hasattr(user, 'enseignant_profile'):
            return Response({"error": "Not a teacher"}, status=400)

        enseignant = user.enseignant_profile
        etablissement = enseignant.etablissement

        from core.models.pedagogie import Matiere as MatiereModel, ProgressionChapitre
        from core.models.examens import Examen, CopieExamen
        from django.db.models import Q, Avg

        matieres = MatiereModel.objects.filter(nom__iexact=enseignant.specialite)
        chapitres_teacher = Chapitre.objects.filter(
            Q(createur=enseignant) |
            (Q(createur__isnull=True) & Q(matiere__in=matieres))
        ) if matieres.exists() else Chapitre.objects.filter(createur=enseignant)
        if enseignant.niveau:
            chapitres_teacher = chapitres_teacher.filter(niveau=enseignant.niveau)

        chapitres_publies = chapitres_teacher.filter(lecons__est_publie=True).distinct().count()

        classes_teacher = Classe.objects.filter(
            etablissement=enseignant.etablissement
        )
        if enseignant.niveau:
            classes_teacher = classes_teacher.filter(niveau=enseignant.niveau)
        total_students = Etudiant.objects.filter(
            classe__in=classes_teacher
        ).count() if enseignant.etablissement else 0

        total_exams = Examen.objects.filter(enseignant=enseignant).count()

        progressions = ProgressionChapitre.objects.filter(
            chapitre__in=chapitres_teacher
        )
        total_progressions = progressions.count()
        validated_progressions = progressions.filter(est_valide=True).count()
        success_rate = round((validated_progressions / total_progressions) * 100, 1) if total_progressions > 0 else 0

        copies_corrigees = CopieExamen.objects.filter(
            examen__in=Examen.objects.filter(enseignant=enseignant),
            est_termine=True, note_obtenue__isnull=False
        )
        moyenne_notes = copies_corrigees.aggregate(moyenne=Avg('note_obtenue'))['moyenne']
        moyenne_notes = round(moyenne_notes, 2) if moyenne_notes else None

        return Response({
            "published_courses": chapitres_publies,
            "total_students": total_students,
            "total_exams": total_exams,
            "success_rate": success_rate,
            "moyenne_notes": moyenne_notes,
            "total_copies": copies_corrigees.count(),
        })
