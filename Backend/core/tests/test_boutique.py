from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.tests.factories import (
    create_user, create_etudiant, create_niveau, create_matiere
)
from core.models import RessourceBoutique, Panier, PanierItem, Commande


class BaseBoutiqueTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.niveau = create_niveau()
        self.matiere = create_matiere(niveaux=[self.niveau])

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class RessourceBoutiqueModelTest(BaseBoutiqueTest):
    def test_create_ressource(self):
        ressource = RessourceBoutique.objects.create(
            titre='Cours Mathématiques',
            description='Description du cours',
            prix=15.00,
            type_contenu='COURS',
            stock=10,
            niveau=self.niveau,
            matiere=self.matiere,
        )
        self.assertEqual(ressource.titre, 'Cours Mathématiques')
        self.assertEqual(ressource.prix, 15.00)
        self.assertEqual(ressource.type_contenu, 'COURS')
        self.assertTrue(ressource.est_disponible)
        self.assertEqual(ressource.stock, 10)

    def test_str_representation(self):
        ressource = RessourceBoutique.objects.create(
            titre='Ressource Test',
            description='Desc',
            prix=10.00,
            type_contenu='LIVRE',
            stock=5,
        )
        self.assertIsInstance(str(ressource), str)


class RessourceBoutiqueAPITest(BaseBoutiqueTest):
    def setUp(self):
        super().setUp()
        self.url = '/api/boutique/'
        self.ressource = RessourceBoutique.objects.create(
            titre='Livre Maths',
            description='Livre de maths avancé',
            prix=25.00,
            type_contenu='LIVRE',
            stock=5,
            niveau=self.niveau,
            matiere=self.matiere,
        )

    def test_list_ressources_requires_auth(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_ressources_as_authenticated(self):
        user = create_user()
        self._auth(user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        ids = [r['id'] for r in response.data['results']]
        self.assertIn(self.ressource.id, ids)

    def test_retrieve_ressource(self):
        user = create_user()
        self._auth(user)
        url = f'{self.url}{self.ressource.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.ressource.id)

    def test_create_ressource_as_authenticated(self):
        user = create_user()
        self._auth(user)
        data = {
            'titre': 'Nouvelle Ressource',
            'description': 'Description',
            'prix': '12.50',
            'type_contenu': 'EXERCICES',
            'stock': 3,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['titre'], 'Nouvelle Ressource')

    def test_create_ressource_sans_auth(self):
        data = {
            'titre': 'Nouvelle Ressource',
            'description': 'Description',
            'prix': '12.50',
            'type_contenu': 'EXERCICES',
            'stock': 3,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PanierTest(BaseBoutiqueTest):
    def setUp(self):
        super().setUp()
        self.etudiant_user = create_user(
            username="etudiantboutique",
            email="etudiantboutique@test.com",
            type_utilisateur="ETUDIANT"
        )
        self.etudiant = create_etudiant(utilisateur=self.etudiant_user)
        self.ressource = RessourceBoutique.objects.create(
            titre='Livre Maths',
            description='Livre de maths',
            prix=25.00,
            type_contenu='LIVRE',
            stock=5,
        )

    def test_add_to_cart(self):
        self._auth(self.etudiant_user)
        response = self.client.post('/api/panier/add/', {'ressource_id': self.ressource.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('items', response.data)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantite'], 1)

    def test_add_to_cart_twice_increments_quantity(self):
        self._auth(self.etudiant_user)
        self.client.post('/api/panier/add/', {'ressource_id': self.ressource.id}, format='json')
        response = self.client.post('/api/panier/add/', {'ressource_id': self.ressource.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantite'], 2)

    def test_add_to_cart_non_etudiant_rejected(self):
        user = create_user()
        self._auth(user)
        response = self.client.post('/api/panier/add/', {'ressource_id': self.ressource.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_add_to_cart_missing_ressource_id(self):
        self._auth(self.etudiant_user)
        response = self.client.post('/api/panier/add/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_to_cart_invalid_ressource(self):
        self._auth(self.etudiant_user)
        response = self.client.post('/api/panier/add/', {'ressource_id': 99999}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_view_cart(self):
        self._auth(self.etudiant_user)
        self.client.post('/api/panier/add/', {'ressource_id': self.ressource.id}, format='json')
        response = self.client.get('/api/panier/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertGreaterEqual(len(response.data['results']), 1)
        panier_data = response.data['results'][0]
        self.assertIn('items', panier_data)


class CommandeTest(BaseBoutiqueTest):
    def setUp(self):
        super().setUp()
        self.etudiant_user = create_user(
            username="etudiantcmd",
            email="etudiantcmd@test.com",
            type_utilisateur="ETUDIANT"
        )
        self.etudiant = create_etudiant(utilisateur=self.etudiant_user)
        self.url = '/api/commandes/'

    def test_create_commande(self):
        self._auth(self.etudiant_user)
        data = {
            'etudiant': self.etudiant.id,
            'montant_total': '50.00',
            'reference_paiement': 'REF-UNIQUE-001',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['montant_total'], '50.00')
        self.assertEqual(response.data['statut_paiement'], 'EN_ATTENTE')

    def test_create_commande_sans_auth(self):
        data = {
            'etudiant': self.etudiant.id,
            'montant_total': '50.00',
            'reference_paiement': 'REF-UNIQUE-002',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_commandes(self):
        self._auth(self.etudiant_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
