from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.tests.factories import (
    create_user, create_etablissement, create_niveau, create_classe
)
from core.models import Etablissement, AdminEtablissement, Classe


class EtablissementModelTest(APITestCase):
    def setUp(self):
        self.etablissement = Etablissement.objects.create(
            nom="Lycée Test", code_etablissement="LYT001", type="LYCEE",
            adresse="123 Rue", telephone="+261123456789", email="lycee@test.com"
        )

    def test_str_representation(self):
        expected = f"[{self.etablissement.get_type_display()}] {self.etablissement.nom}"
        self.assertEqual(str(self.etablissement), expected)

    def test_create_etablissement(self):
        etab = Etablissement.objects.create(
            nom="École Primaire",
            adresse="456 Rue Principale",
            telephone="+261987654321",
            email="primaire@test.com",
            code_etablissement="EP001",
            type="EPP"
        )
        self.assertEqual(etab.nom, "École Primaire")
        self.assertEqual(etab.type, "EPP")
        self.assertEqual(etab.code_etablissement, "EP001")


class EtablissementViewSetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.etablissement = Etablissement.objects.create(
            nom="Lycée Alpha", code_etablissement="LYA001", type="LYCEE",
            adresse="1 Rue", telephone="+261123456788", email="alpha@test.com"
        )
        Etablissement.objects.create(
            nom="CEG Beta", code_etablissement="CEG001", type="CEG",
            adresse="2 Rue", telephone="+261123456787", email="beta@test.com"
        )
        self.list_url = '/api/etablissements/'

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def _get_results(self, response):
        return response.data.get('results') if isinstance(response.data, dict) else response.data

    def test_list_public_no_auth(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._get_results(response)
        self.assertEqual(len(results), 2)

    def test_filter_by_type(self):
        response = self.client.get(f'{self.list_url}?type=LYCEE')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._get_results(response)
        for item in results:
            self.assertEqual(item['type'], 'LYCEE')

    def test_filter_by_type_no_match(self):
        response = self.client.get(f'{self.list_url}?type=EPP')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._get_results(response)
        self.assertEqual(len(results), 0)

    def test_search_by_nom(self):
        response = self.client.get(f'{self.list_url}?search=Alpha')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['nom'], 'Lycée Alpha')

    def test_search_by_code_etablissement(self):
        response = self.client.get(f'{self.list_url}?search=CEG001')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['code_etablissement'], 'CEG001')

    def test_search_by_email(self):
        response = self.client.get(f'{self.list_url}?search=alpha@test.com')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._get_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['email'], 'alpha@test.com')

    def test_retrieve_requires_auth(self):
        url = f'{self.list_url}{self.etablissement.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_as_authenticated(self):
        user = create_user()
        self._auth(user)
        url = f'{self.list_url}{self.etablissement.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.etablissement.id)
        self.assertEqual(response.data['nom'], self.etablissement.nom)

    def test_create_requires_auth(self):
        data = {
            'nom': 'Nouveau',
            'adresse': 'Adresse',
            'telephone': '+261381234567',
            'email': 'new@test.com',
            'code_etablissement': 'NEW001',
            'type': 'AUTRE'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_as_authenticated(self):
        user = create_user()
        self._auth(user)
        data = {
            'nom': 'Nouveau Etablissement',
            'adresse': '123 Avenue',
            'telephone': '+261381234567',
            'email': 'new@test.com',
            'code_etablissement': 'NEW001',
            'type': 'LYCEE'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nom'], 'Nouveau Etablissement')
        self.assertEqual(response.data['type'], 'LYCEE')

    def test_update_as_authenticated(self):
        user = create_user()
        self._auth(user)
        url = f'{self.list_url}{self.etablissement.id}/'
        response = self.client.patch(url, {'nom': 'Lycée Alpha Modifié'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.etablissement.refresh_from_db()
        self.assertEqual(self.etablissement.nom, 'Lycée Alpha Modifié')

    def test_delete_as_authenticated(self):
        user = create_user()
        self._auth(user)
        url = f'{self.list_url}{self.etablissement.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Etablissement.objects.filter(id=self.etablissement.id).exists())


class AdminEtablissementViewSetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.etablissement = create_etablissement()
        self.url = '/api/admin-etablissements/'

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_list_requires_auth(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_admin_etablissement(self):
        self._auth(self.user)
        data = {
            'utilisateur_id': self.user.id,
            'etablissement_id': self.etablissement.id,
            'fonction': 'Directeur'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fonction'], 'Directeur')
        self.assertTrue(AdminEtablissement.objects.filter(utilisateur=self.user).exists())

    def test_list_admin_etablissements(self):
        self._auth(self.user)
        AdminEtablissement.objects.create(
            utilisateur=self.user,
            etablissement=self.etablissement,
            fonction='Directeur'
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results')
        if results is not None:
            self.assertEqual(len(results), 1)
        else:
            self.assertEqual(len(response.data), 1)

    def test_retrieve_admin_etablissement(self):
        self._auth(self.user)
        admin = AdminEtablissement.objects.create(
            utilisateur=self.user,
            etablissement=self.etablissement,
            fonction='Directeur'
        )
        url = f'{self.url}{admin.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['fonction'], 'Directeur')

    def test_delete_admin_etablissement(self):
        self._auth(self.user)
        admin = AdminEtablissement.objects.create(
            utilisateur=self.user,
            etablissement=self.etablissement,
            fonction='Directeur'
        )
        url = f'{self.url}{admin.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(AdminEtablissement.objects.filter(id=admin.id).exists())


class ClasseViewSetTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.niveau = create_niveau()
        self.etablissement = create_etablissement()
        self.classe = create_classe(
            nom="6ème A",
            niveau=self.niveau,
            etablissement=self.etablissement
        )
        self.url = '/api/classes/'

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_list_requires_auth(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_as_authenticated(self):
        self._auth(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        ids = [c['id'] for c in response.data['results']]
        self.assertIn(self.classe.id, ids)

    def test_filter_by_etablissement(self):
        self._auth(self.user)
        response = self.client.get(f'{self.url}?etablissement={self.etablissement.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in response.data['results']]
        self.assertIn(self.classe.id, ids)

    def test_filter_by_niveau(self):
        self._auth(self.user)
        response = self.client.get(f'{self.url}?niveau={self.niveau.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in response.data['results']]
        self.assertIn(self.classe.id, ids)

    def test_retrieve_classe(self):
        self._auth(self.user)
        url = f'{self.url}{self.classe.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.classe.id)
        self.assertEqual(response.data['nom'], '6ème A')

    def test_classe_str(self):
        expected = f"{self.classe.nom} - {self.classe.etablissement.nom}"
        self.assertEqual(str(self.classe), expected)
