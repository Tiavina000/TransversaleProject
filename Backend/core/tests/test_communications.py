from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.tests.factories import (
    create_user, create_etablissement, create_etudiant
)
from core.models import (
    Actualite, Notification, Partenaire, Renovation, Utilisateur, Etablissement
)


class BaseCommTest(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')


class ActualiteModelTest(BaseCommTest):
    def test_create_actualite(self):
        user = create_user()
        actualite = Actualite.objects.create(
            titre='Actualité Test',
            contenu='Contenu de test',
            categorie='Annonces',
            auteur=user,
        )
        self.assertEqual(actualite.titre, 'Actualité Test')
        self.assertEqual(actualite.categorie, 'Annonces')
        self.assertTrue(actualite.est_publie)

    def test_str_representation(self):
        actualite = Actualite.objects.create(
            titre='Actualité Test',
            contenu='Contenu',
        )
        self.assertIsInstance(str(actualite), str)

    def test_create_with_all_fields(self):
        etablissement = create_etablissement()
        user = create_user()
        actualite = Actualite.objects.create(
            titre='Urgent',
            contenu='Contenu important',
            categorie='Examens',
            est_important=True,
            auteur=user,
            est_publie=True,
            public_ciblie='ETUDIANTS',
            etablissement_cible=etablissement,
        )
        self.assertEqual(actualite.categorie, 'Examens')
        self.assertTrue(actualite.est_important)
        self.assertEqual(actualite.public_ciblie, 'ETUDIANTS')
        self.assertEqual(actualite.etablissement_cible, etablissement)


class ActualiteViewSetTest(BaseCommTest):
    def setUp(self):
        super().setUp()
        self.admin_user = create_user(
            username="admincom", email="admincom@test.com",
            type_utilisateur="ADMINISTRATEUR"
        )
        self.normal_user = create_user(
            username="normalcom", email="normalcom@test.com",
        )
        self.actualite = Actualite.objects.create(
            titre='Actualité Publique',
            contenu='Contenu public',
            auteur=self.admin_user,
        )
        Actualite.objects.create(
            titre='Brouillon',
            contenu='Non publié',
            auteur=self.admin_user,
            est_publie=False,
        )
        self.url = '/api/actualites/'

    def test_list_public_no_auth(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        titres = [a['titre'] for a in response.data['results']]
        self.assertIn('Actualité Publique', titres)
        self.assertNotIn('Brouillon', titres)

    def test_retrieve_public(self):
        url = f'{self.url}{self.actualite.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['titre'], 'Actualité Publique')

    def test_create_requires_auth(self):
        data = {'titre': 'Nouvelle', 'contenu': 'Contenu'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_as_admin(self):
        self._auth(self.admin_user)
        data = {
            'titre': 'Actualité Admin',
            'contenu': 'Créée par admin',
            'categorie': 'Annonces',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['titre'], 'Actualité Admin')
        actualite = Actualite.objects.get(id=response.data['id'])
        self.assertEqual(actualite.auteur, self.admin_user)

    def test_create_as_non_admin(self):
        self._auth(self.normal_user)
        data = {'titre': 'Normal', 'contenu': 'Par user normal'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_as_admin(self):
        self._auth(self.admin_user)
        url = f'{self.url}{self.actualite.id}/'
        response = self.client.patch(url, {'titre': 'Modifié'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.actualite.refresh_from_db()
        self.assertEqual(self.actualite.titre, 'Modifié')

    def test_delete_as_admin(self):
        self._auth(self.admin_user)
        url = f'{self.url}{self.actualite.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_filter_by_categorie(self):
        Actualite.objects.create(
            titre='Sportif',
            contenu='News sport',
            categorie='Sport',
            auteur=self.admin_user,
        )
        response = self.client.get(f'{self.url}?categorie=Sport')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titres = [a['titre'] for a in response.data['results']]
        self.assertIn('Sportif', titres)

    def test_infinite_endpoint(self):
        response = self.client.get('/api/actualites/infinite/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titres = [a['titre'] for a in response.data]
        self.assertIn('Actualité Publique', titres)


class NotificationViewSetTest(BaseCommTest):
    def setUp(self):
        super().setUp()
        self.user = create_user()
        self.notification = Notification.objects.create(
            utilisateur=self.user,
            titre='Notification Test',
            message='Message de test',
        )
        Notification.objects.create(
            utilisateur=self.user,
            titre='Déjà lue',
            message='Message lu',
            est_lue=True,
        )
        self.url = '/api/notifications/'

    def test_list_notifications(self):
        self._auth(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        titres = [n['titre'] for n in response.data['results']]
        self.assertIn('Notification Test', titres)

    def test_list_notifications_other_user(self):
        other = create_user(username="othernotif", email="othernotif@test.com")
        self._auth(other)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titres = [n['titre'] for n in response.data['results']]
        self.assertNotIn('Notification Test', titres)

    def test_list_unread_filter(self):
        self._auth(self.user)
        response = self.client.get(f'{self.url}?non_lues=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titres = [n['titre'] for n in response.data['results']]
        self.assertIn('Notification Test', titres)
        self.assertNotIn('Déjà lue', titres)

    def test_mark_one_as_read(self):
        self._auth(self.user)
        url = f'/api/notifications/lire/{self.notification.id}/'
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.est_lue)
        self.assertIsNotNone(self.notification.date_lecture)

    def test_mark_all_as_read(self):
        self._auth(self.user)
        response = self.client.post('/api/notifications/tout-lire/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'all_read')
        unread = Notification.objects.filter(utilisateur=self.user, est_lue=False).count()
        self.assertEqual(unread, 0)

    def test_count_unread(self):
        self._auth(self.user)
        response = self.client.get('/api/notifications/compte/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['non_lues'], 1)

    def test_count_unread_sans_auth(self):
        response = self.client.get('/api/notifications/compte/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_requires_auth(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PartenaireViewSetTest(BaseCommTest):
    def setUp(self):
        super().setUp()
        self.partenaire = Partenaire.objects.create(
            nom='Partenaire Test',
            logo='/logos/test.png',
            url='https://example.com',
            ordre=1,
        )
        self.url = '/api/partenaires/'

    def test_list_public(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nom'], 'Partenaire Test')

    def test_str_representation(self):
        self.assertEqual(str(self.partenaire), 'Partenaire Test')

    def test_create_not_supported(self):
        data = {'nom': 'Nouveau', 'logo': '/logos/new.png'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class RenovationViewSetTest(BaseCommTest):
    def setUp(self):
        super().setUp()
        self.renovation = Renovation.objects.create(
            annee='2024',
            titre='Rénovation École',
            description='Description de la rénovation',
            ordre=1,
        )
        self.url = '/api/renovations/'

    def test_list_public(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titre'], 'Rénovation École')

    def test_str_representation(self):
        expected = f"{self.renovation.annee} - {self.renovation.titre}"
        self.assertEqual(str(self.renovation), expected)


class PublicEndpointsTest(BaseCommTest):
    def setUp(self):
        super().setUp()
        Partenaire.objects.create(nom='Partenaire Public', logo='/logos/pub.png')
        Renovation.objects.create(
            annee='2024', titre='Rénovation Publique',
            description='Desc'
        )
        create_etablissement(nom="École Publique")

    def test_public_partners(self):
        response = self.client.get('/api/public/partners/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nom'], 'Partenaire Public')

    def test_public_renovations(self):
        response = self.client.get('/api/public/renovations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['titre'], 'Rénovation Publique')

    def test_public_stats(self):
        response = self.client.get('/api/public/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('total_students', response.data)
        self.assertIn('total_schools', response.data)
        self.assertIn('total_lessons', response.data)

    def test_public_search(self):
        response = self.client.get('/api/public/search/?q=École')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        types_presents = [r['type'] for r in response.data]
        self.assertIn('Établissement', types_presents)

    def test_public_search_empty_query(self):
        response = self.client.get('/api/public/search/?q=')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_public_search_no_results(self):
        response = self.client.get('/api/public/search/?q=xyznonexistent')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
