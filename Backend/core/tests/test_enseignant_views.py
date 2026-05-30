from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.tests.factories import (
    create_enseignant, create_user, create_etablissement,
    create_niveau, create_etudiant
)
from core.models import Enseignant


class EnseignantViewSetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.list_url = '/api/enseignants/'
        self.niveau = create_niveau()
        self.etablissement = create_etablissement()
        self.admin_user = create_user(
            username="admin", email="admin@test.com",
            type_utilisateur="ADMINISTRATEUR"
        )
        self.teacher_user = create_user(
            username="teacher1", email="teacher1@test.com",
        )
        self.teacher = create_enseignant(
            utilisateur=self.teacher_user,
            etablissement=self.etablissement,
            niveau=self.niveau,
        )
        self.student_user = create_user(
            username="student1", email="student1@test.com",
            type_utilisateur="ETUDIANT"
        )

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_list_enseignants_authenticated(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_list_enseignants_unauthenticated(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_enseignant_as_admin(self):
        self.authenticate(self.admin_user)
        new_user = create_user(
            username="newteacher", email="new@test.com",
        )
        data = {
            'utilisateur_id': new_user.id,
            'specialite': 'Physique',
            'date_embauche': '2021-01-15',
            'niveau': self.niveau.id,
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enseignant.objects.count(), 2)

    def test_create_enseignant_unauthenticated(self):
        data = {
            'utilisateur_id': 999,
            'specialite': 'Physique',
            'date_embauche': '2021-01-15',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_enseignant_as_student(self):
        self.authenticate(self.student_user)
        new_user = create_user(
            username="anotherteacher", email="another@test.com",
        )
        data = {
            'utilisateur_id': new_user.id,
            'specialite': 'Physique',
            'date_embauche': '2021-01-15',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enseignant.objects.count(), 2)

    def test_retrieve_enseignant(self):
        self.authenticate(self.teacher_user)
        url = f'{self.list_url}{self.teacher.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.teacher.id)
        self.assertIn('utilisateur', response.data)
        self.assertIn('niveau_nom', response.data)

    def test_update_enseignant(self):
        self.authenticate(self.admin_user)
        url = f'{self.list_url}{self.teacher.id}/'
        data = {'specialite': 'Physique-Chimie'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.teacher.refresh_from_db()
        self.assertEqual(self.teacher.specialite, 'Physique-Chimie')

    def test_delete_enseignant(self):
        self.authenticate(self.admin_user)
        url = f'{self.list_url}{self.teacher.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Enseignant.objects.count(), 0)

    def test_search_by_username(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(
            self.list_url, {'search': 'teacher1'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_search_by_specialite(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(
            self.list_url, {'search': 'Mathématiques'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_search_no_match(self):
        self.authenticate(self.teacher_user)
        response = self.client.get(
            self.list_url, {'search': 'zzzzzzz'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_pagination_default_page_size(self):
        self.authenticate(self.teacher_user)
        for i in range(15):
            u = create_user(
                username=f"batchteacher{i}", email=f"bt{i}@test.com",
            )
            create_enseignant(
                utilisateur=u, etablissement=self.etablissement,
                niveau=self.niveau, specialite="Physique"
            )
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)
        self.assertIsNotNone(response.data['next'])
