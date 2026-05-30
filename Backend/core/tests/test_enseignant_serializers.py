from django.test import TestCase
from rest_framework.exceptions import ErrorDetail
from core.serializers.utilisateurs_serializers import EnseignantSerializer
from core.tests.factories import create_enseignant, create_user, create_niveau


class EnseignantSerializerTest(TestCase):
    def setUp(self):
        self.enseignant = create_enseignant()

    def test_serialize_contains_expected_fields(self):
        serializer = EnseignantSerializer(self.enseignant)
        expected = {'id', 'utilisateur',
                    'specialite', 'date_embauche', 'niveau', 'niveau_nom'}
        self.assertEqual(set(serializer.data.keys()), expected)

    def test_serialized_utilisateur_is_nested(self):
        serializer = EnseignantSerializer(self.enseignant)
        self.assertIn('id', serializer.data['utilisateur'])
        self.assertIn('username', serializer.data['utilisateur'])
        self.assertIn('email', serializer.data['utilisateur'])

    def test_serialized_niveau_nom_is_readonly(self):
        serializer = EnseignantSerializer(self.enseignant)
        self.assertEqual(
            serializer.data['niveau_nom'],
            self.enseignant.niveau.nom
        )

    def test_serialized_id_is_readonly(self):
        data = {
            'utilisateur_id': self.enseignant.utilisateur.id,
            'specialite': 'Physique',
            'date_embauche': '2021-01-15',
        }
        serializer = EnseignantSerializer(self.enseignant, data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data.get('id'), None)

    def test_deserialize_valid_data(self):
        user = create_user(username="newteacher", email="new@test.com")
        niveau = create_niveau(nom="5ème", ordre=5)
        data = {
            'utilisateur_id': user.id,
            'specialite': 'Physique',
            'date_embauche': '2021-01-15',
            'niveau': niveau.id,
        }
        serializer = EnseignantSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)

    def test_deserialize_missing_date_embauche(self):
        user = create_user(username="badteacher", email="bad@test.com")
        data = {
            'utilisateur_id': user.id,
            'specialite': 'Physique',
        }
        serializer = EnseignantSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('date_embauche', serializer.errors)

    def test_deserialize_missing_utilisateur_id(self):
        data = {
            'specialite': 'Physique',
            'date_embauche': '2021-01-15',
        }
        serializer = EnseignantSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('utilisateur_id', serializer.errors)

    def test_update_specialite(self):
        data = {'specialite': 'Physique-Chimie'}
        serializer = EnseignantSerializer(
            self.enseignant, data=data, partial=True
        )
        self.assertTrue(serializer.is_valid())
        updated = serializer.save()
        self.assertEqual(updated.specialite, 'Physique-Chimie')
