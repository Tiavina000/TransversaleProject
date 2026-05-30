from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import models
from core.tests.factories import (
    create_enseignant, create_user, create_etablissement,
    create_niveau, create_matiere, create_chapitre, create_lecon,
    create_etudiant
)
from core.models import Chapitre, Lecon


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

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )


class ChapitreViewSetTeacherTest(BaseEnseignantAPITest):
    def setUp(self):
        super().setUp()
        self.url = '/api/teacher/chapitres/'
        self.chapitre = create_chapitre(
            matiere=self.matiere, niveau=self.niveau,
            createur=self.teacher
        )

    def test_teacher_creates_chapitre_assigns_createur(self):
        self.authenticate(self.teacher_user)
        data = {
            'titre': 'Nouveau Chapitre',
            'matiere': self.matiere.id,
            'niveau': self.niveau.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        chapitre = Chapitre.objects.get(id=response.data['id'])
        self.assertEqual(chapitre.createur, self.teacher)

    def test_teacher_creates_chapitre_requires_niveau(self):
        self.authenticate(self.teacher_user)
        data = {
            'titre': 'Chapitre Sans Niveau',
            'matiere': self.matiere.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_teacher_creates_chapitre_auto_order(self):
        self.authenticate(self.teacher_user)
        max_order = Chapitre.objects.filter(
            matiere=self.matiere, niveau=self.niveau
        ).aggregate(m=models.Max('order'))['m'] or 0
        data = {
            'titre': 'Chapitre Ordered',
            'matiere': self.matiere.id,
            'niveau': self.niveau.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        chapitre = Chapitre.objects.get(id=response.data['id'])
        self.assertEqual(chapitre.order, max_order + 1)

    def test_teacher_sees_own_chapitres(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in response.data['results']]
        self.assertIn(self.chapitre.id, ids)

    def test_student_sees_only_chapitres_with_published_lecons(self):
        published_chap = create_chapitre(
            matiere=self.matiere, niveau=self.niveau,
            createur=self.teacher, titre="Published Chap"
        )
        create_lecon(
            chapitre=published_chap, createur=self.teacher,
            est_publie=True
        )
        self.authenticate(self.student_user)
        response = self.client.get('/api/chapitres/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in response.data['results']]
        self.assertIn(published_chap.id, ids)

    def test_student_does_not_see_chapitre_without_published_lecons(self):
        self.authenticate(self.student_user)
        response = self.client.get('/api/chapitres/')
        ids = [c['id'] for c in response.data['results']]
        self.assertNotIn(self.chapitre.id, ids)

    def test_retrieve_chapitre_detail(self):
        self.authenticate(self.teacher_user)
        url = f'{self.url}{self.chapitre.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.chapitre.id)

    def test_update_chapitre(self):
        self.authenticate(self.teacher_user)
        url = f'{self.url}{self.chapitre.id}/'
        data = {'titre': 'Titre modifié'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.chapitre.refresh_from_db()
        self.assertEqual(self.chapitre.titre, 'Titre modifié')

    def test_delete_chapitre(self):
        self.authenticate(self.teacher_user)
        url = f'{self.url}{self.chapitre.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Chapitre.objects.filter(id=self.chapitre.id).exists())


class LeconViewSetTeacherTest(BaseEnseignantAPITest):
    def setUp(self):
        super().setUp()
        self.chapitre = create_chapitre(
            matiere=self.matiere, niveau=self.niveau,
            createur=self.teacher
        )
        self.lecon = create_lecon(
            chapitre=self.chapitre, createur=self.teacher,
            est_publie=True
        )
        self.url = '/api/teacher/lecons/'

    def test_teacher_creates_lecon_assigns_createur(self):
        self.authenticate(self.teacher_user)
        data = {
            'titre': 'Nouvelle Lecon',
            'chapitre': self.chapitre.id,
            'duree_estimee': 30,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        lecon = Lecon.objects.get(id=response.data['id'])
        self.assertEqual(lecon.createur, self.teacher)

    def test_teacher_creates_lecon_auto_order(self):
        self.authenticate(self.teacher_user)
        max_order = Lecon.objects.filter(
            chapitre=self.chapitre
        ).aggregate(m=models.Max('order'))['m'] or 0
        data = {
            'titre': 'Lecon Ordered',
            'chapitre': self.chapitre.id,
            'duree_estimee': 30,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        lecon = Lecon.objects.get(id=response.data['id'])
        self.assertEqual(lecon.order, max_order + 1)

    def test_teacher_sees_own_lecons(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [l['id'] for l in response.data['results']]
        self.assertIn(self.lecon.id, ids)

    def test_cannot_create_lecon_for_wrong_niveau_chapitre(self):
        other_niveau = create_niveau(nom="Terminale", ordre=13)
        other_chapitre = create_chapitre(
            matiere=self.matiere, niveau=other_niveau
        )
        self.authenticate(self.teacher_user)
        data = {
            'titre': 'Lecon Mauvais Niveau',
            'chapitre': other_chapitre.id,
            'duree_estimee': 30,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_update_other_teacher_lecon(self):
        other_teacher = create_enseignant(
            utilisateur=create_user(
                username="otherteacher", email="other@test.com",
            ),
            etablissement=self.etablissement,
            niveau=self.niveau,
        )
        other_lecon = create_lecon(
            chapitre=self.chapitre, createur=other_teacher,
            est_publie=False
        )
        self.authenticate(self.teacher_user)
        url = f'{self.url}{other_lecon.id}/'
        data = {'titre': 'Hack titre'}
        response = self.client.patch(url, data, format='json')
        self.assertIn(response.status_code,
                      [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_cannot_delete_other_teacher_lecon(self):
        other_teacher = create_enseignant(
            utilisateur=create_user(
                username="otherteacher2", email="other2@test.com",
            ),
            etablissement=self.etablissement,
            niveau=self.niveau,
        )
        other_lecon = create_lecon(
            chapitre=self.chapitre, createur=other_teacher,
            est_publie=False
        )
        self.authenticate(self.teacher_user)
        url = f'{self.url}{other_lecon.id}/'
        response = self.client.delete(url)
        self.assertIn(response.status_code,
                      [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_student_sees_only_published_lecons(self):
        draft_lecon = create_lecon(
            chapitre=self.chapitre, createur=self.teacher,
            est_publie=False, titre="Draft Lecon"
        )
        self.authenticate(self.student_user)
        response = self.client.get('/api/lecons/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [l['id'] for l in response.data['results']]
        self.assertIn(self.lecon.id, ids)
        self.assertNotIn(draft_lecon.id, ids)

    def test_update_own_lecon(self):
        self.authenticate(self.teacher_user)
        url = f'{self.url}{self.lecon.id}/'
        data = {'titre': 'Titre modifié'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lecon.refresh_from_db()
        self.assertEqual(self.lecon.titre, 'Titre modifié')

    def test_delete_own_lecon(self):
        self.authenticate(self.teacher_user)
        url = f'{self.url}{self.lecon.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Lecon.objects.filter(id=self.lecon.id).exists())
