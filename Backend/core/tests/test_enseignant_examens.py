import datetime
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from core.tests.factories import (
    create_enseignant, create_user, create_etablissement,
    create_niveau, create_matiere, create_etudiant,
    create_examen
)
from core.models import Examen, CopieExamen, QuestionExamen


class BaseEnseignantAPITest(APITestCase):
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
        self.admin_user = create_user(
            username="admin", email="admin@test.com",
            type_utilisateur="ADMINISTRATEUR"
        )
        self.examen = create_examen(
            enseignant=self.teacher,
            matiere=self.matiere,
            niveau=self.niveau,
        )

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )


class ExamenViewSetTeacherTest(BaseEnseignantAPITest):
    def test_teacher_sees_only_own_examens(self):
        other_teacher = create_enseignant(
            utilisateur=create_user(
                username="otherteacher", email="other@test.com",
            ),
            etablissement=self.etablissement,
            niveau=self.niveau,
        )
        other_examen = create_examen(
            enseignant=other_teacher, matiere=self.matiere,
            niveau=self.niveau, titre="Other Exam"
        )
        self.authenticate(self.teacher_user)
        response = self.client.get('/api/examens/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [e['id'] for e in response.data['results']]
        self.assertIn(self.examen.id, ids)
        self.assertNotIn(other_examen.id, ids)

    def test_teacher_creates_examen_assigns_enseignant(self):
        self.authenticate(self.teacher_user)
        now = timezone.now()
        data = {
            'titre': 'Nouvel Examen',
            'matiere': self.matiere.id,
            'niveau': self.niveau.id,
            'duree_minutes': 60,
            'date_debut': now.isoformat(),
            'date_fin': (now + datetime.timedelta(hours=2)).isoformat(),
            'type_examen': 'QCM',
            'enseignant': self.teacher.id,
        }
        response = self.client.post('/api/examens/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        examen = Examen.objects.get(id=response.data['id'])
        self.assertEqual(examen.enseignant, self.teacher)

    def test_teacher_corrigeables_returns_submitted_copies(self):
        q = QuestionExamen.objects.create(
            examen=self.examen,
            texte="Question 1",
            type_question="QCM",
            points=1,
            ordre=1,
            options=["A", "B"],
            reponse_correcte="A",
        )
        copie = CopieExamen.objects.create(
            examen=self.examen,
            etudiant=self.etudiant,
            est_termine=True,
            date_soumission=timezone.now(),
        )
        self.authenticate(self.teacher_user)
        response = self.client.get('/api/examens/corrigeables/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in response.data['results']]
        self.assertIn(copie.id, ids)

    def test_teacher_corrigeables_excludes_unsubmitted_copies(self):
        CopieExamen.objects.create(
            examen=self.examen,
            etudiant=self.etudiant,
            est_termine=False,
        )
        self.authenticate(self.teacher_user)
        response = self.client.get('/api/examens/corrigeables/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_corrigeables_requires_teacher(self):
        self.authenticate(self.student_user)
        response = self.client.get('/api/examens/corrigeables/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_corriger_copie(self):
        q = QuestionExamen.objects.create(
            examen=self.examen,
            texte="Question 1",
            type_question="QCM",
            points=5,
            ordre=1,
            options=["A", "B"],
            reponse_correcte="A",
        )
        copie = CopieExamen.objects.create(
            examen=self.examen,
            etudiant=self.etudiant,
            est_termine=True,
        )
        from core.models import ReponseExamen
        reponse = ReponseExamen.objects.create(
            copie=copie,
            question=q,
            reponse_etudiant="A",
        )
        self.authenticate(self.teacher_user)
        url = f'/api/examens/{self.examen.id}/corriger/{copie.id}/'
        data = {
            'corrections': [
                {'reponse_id': reponse.id, 'points_obtenus': 4}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        copie.refresh_from_db()
        self.assertEqual(copie.note_obtenue, 4)

    def test_teacher_publishes_examen(self):
        self.authenticate(self.teacher_user)
        url = f'/api/examens/{self.examen.id}/publier/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.examen.refresh_from_db()
        self.assertTrue(self.examen.est_publie)

    def test_student_cannot_publish_examen(self):
        self.authenticate(self.student_user)
        url = f'/api/examens/{self.examen.id}/publier/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CorrectionViewSetTeacherTest(BaseEnseignantAPITest):
    def setUp(self):
        super().setUp()
        self.url = '/api/corrections/'
        self.question = QuestionExamen.objects.create(
            examen=self.examen,
            texte="Question 1",
            type_question="QCM",
            points=5,
            ordre=1,
            options=["A", "B"],
            reponse_correcte="A",
        )
        self.copie = CopieExamen.objects.create(
            examen=self.examen,
            etudiant=self.etudiant,
            est_termine=True,
        )

    def test_list_copies_teacher_only(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in response.data['results']]
        self.assertIn(self.copie.id, ids)

    def test_list_copies_student_forbidden(self):
        self.authenticate(self.student_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_classes_returns_niveaux(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(f'{self.url}classes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        noms = [n['nom'] for n in response.data]
        self.assertIn(self.niveau.nom, noms)

    def test_matieres_returns_matieres(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(f'{self.url}matieres/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        noms = [m['nom'] for m in response.data]
        self.assertIn(self.matiere.nom, noms)

    def test_noter_copie(self):
        self.authenticate(self.teacher_user)
        url = f'{self.url}{self.copie.id}/noter/'
        data = {'note': 15}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.copie.refresh_from_db()
        self.assertEqual(self.copie.note_obtenue, 15.0)

    def test_spellcheck_copie(self):
        from core.models import ReponseExamen
        ReponseExamen.objects.create(
            copie=self.copie,
            question=self.question,
            reponse_etudiant="Ceci est une reponse",
        )
        self.authenticate(self.teacher_user)
        url = f'{self.url}{self.copie.id}/spellcheck/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class NotesEnseignantViewTest(BaseEnseignantAPITest):
    def test_returns_notes_for_teacher(self):
        self.authenticate(self.teacher_user)
        from core.models import CopieExamen
        CopieExamen.objects.create(
            examen=self.examen, etudiant=self.etudiant,
            est_termine=True, note_obtenue=15.0,
            date_soumission=timezone.now(),
        )
        response = self.client.get('/api/notes-enseignant/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('eleves', response.data)
        self.assertEqual(len(response.data['eleves']), 1)
        self.assertEqual(response.data['eleves'][0]['total_points'], 15.0)

    def test_forbidden_for_student(self):
        self.authenticate(self.student_user)
        response = self.client.get('/api/notes-enseignant/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
