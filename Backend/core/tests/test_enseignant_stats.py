from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.tests.factories import (
    create_enseignant, create_user, create_etablissement,
    create_niveau, create_matiere, create_chapitre, create_lecon,
    create_etudiant, create_classe, create_examen
)
from core.models import CopieExamen, Chapitre, Lecon
from core.models.pedagogie import ProgressionChapitre


class TeacherStatsViewTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.niveau = create_niveau()
        self.etablissement = create_etablissement()
        self.matiere = create_matiere(niveaux=[self.niveau])
        self.teacher_user = create_user(
            username="teacher1", email="teacher1@test.com",
        )
        self.teacher = create_enseignant(
            utilisateur=self.teacher_user,
            etablissement=self.etablissement,
            niveau=self.niveau,
            specialite="Mathématiques",
        )
        self.student_user = create_user(
            username="student1", email="student1@test.com",
            type_utilisateur="ETUDIANT"
        )
        self.etudiant = create_etudiant(
            utilisateur=self.student_user,
            etablissement=self.etablissement,
            niveau=self.niveau,
        )
        self.classe = create_classe(
            niveau=self.niveau,
            etablissement=self.etablissement,
        )
        self.etudiant.classe = self.classe
        self.etudiant.save()

        self.chapitre = create_chapitre(
            matiere=self.matiere, niveau=self.niveau,
            createur=self.teacher
        )
        self.lecon = create_lecon(
            chapitre=self.chapitre, createur=self.teacher,
            est_publie=True
        )
        self.url = '/api/stats/teacher/'

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_teacher_stats_returns_data(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('published_courses', response.data)
        self.assertIn('total_students', response.data)
        self.assertIn('total_exams', response.data)
        self.assertIn('success_rate', response.data)
        self.assertIn('moyenne_notes', response.data)
        self.assertIn('total_copies', response.data)

    def test_teacher_stats_counts_published_courses(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data['published_courses'], 1)

    def test_teacher_stats_counts_students(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data['total_students'], 1)

    def test_teacher_stats_counts_exams(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data['total_exams'], 0)

    def test_teacher_stats_with_exam_and_copies(self):
        examen = create_examen(
            enseignant=self.teacher, matiere=self.matiere,
            niveau=self.niveau
        )
        CopieExamen.objects.create(
            examen=examen, etudiant=self.etudiant,
            est_termine=True, note_obtenue=15.0
        )
        self.authenticate(self.teacher_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data['total_exams'], 1)
        self.assertEqual(response.data['total_copies'], 1)
        self.assertEqual(response.data['moyenne_notes'], 15.0)

    def test_teacher_stats_success_rate(self):
        ProgressionChapitre.objects.create(
            etudiant=self.etudiant,
            chapitre=self.chapitre,
            est_valide=True,
        )
        self.authenticate(self.teacher_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data['success_rate'], 100.0)

    def test_teacher_stats_student_forbidden(self):
        self.authenticate(self.student_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_teacher_stats_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ClasseViewSetTeacherFilterTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.niveau = create_niveau()
        self.etablissement = create_etablissement()
        self.teacher_user = create_user(
            username="teacher1", email="teacher1@test.com",
        )
        self.teacher = create_enseignant(
            utilisateur=self.teacher_user,
            etablissement=self.etablissement,
            niveau=self.niveau,
        )
        self.other_niveau = create_niveau(nom="5ème", ordre=5)
        self.classe = create_classe(
            nom="6A", niveau=self.niveau,
            etablissement=self.etablissement
        )
        self.other_classe = create_classe(
            nom="5A", niveau=self.other_niveau,
            etablissement=self.etablissement
        )

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_teacher_sees_only_classes_for_their_niveau(self):
        self.authenticate(self.teacher_user)
        response = self.client.get('/api/classes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in response.data['results']]
        self.assertIn(self.classe.id, ids)
        self.assertNotIn(self.other_classe.id, ids)
