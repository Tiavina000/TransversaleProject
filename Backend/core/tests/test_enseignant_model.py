import datetime
from django.test import TestCase
from django.db import IntegrityError
from core.models import Enseignant, Utilisateur
from core.tests.factories import (
    create_enseignant, create_user, create_etablissement, create_niveau
)


class EnseignantModelTest(TestCase):
    def setUp(self):
        self.enseignant = create_enseignant()

    def test_create_enseignant(self):
        self.assertIsInstance(self.enseignant, Enseignant)
        self.assertEqual(self.enseignant.specialite, "Mathématiques")
        self.assertEqual(self.enseignant.date_embauche, datetime.date(2020, 1, 15))

    def test_string_representation(self):
        expected = f"Enseignant: {self.enseignant.utilisateur.username}"
        self.assertEqual(str(self.enseignant), expected)

    def test_one_to_one_with_utilisateur(self):
        self.assertEqual(
            self.enseignant.utilisateur.enseignant_profile,
            self.enseignant
        )

    def test_one_to_one_unique_constraint(self):
        with self.assertRaises(IntegrityError):
            Enseignant.objects.create(
                utilisateur=self.enseignant.utilisateur,
                etablissement=self.enseignant.etablissement,
                specialite="Physique",
                date_embauche=datetime.date(2021, 1, 15),
            )

    def test_foreign_key_to_etablissement(self):
        etab = create_etablissement(nom="Another School", code="TST002")
        self.enseignant.etablissement = etab
        self.enseignant.save()
        self.assertEqual(self.enseignant.etablissement.nom, "Another School")

    def test_foreign_key_to_niveau(self):
        niveau = create_niveau(nom="Terminale", ordre=13)
        self.enseignant.niveau = niveau
        self.enseignant.save()
        self.assertEqual(self.enseignant.niveau.nom, "Terminale")

    def test_niveau_can_be_null(self):
        self.enseignant.niveau = None
        self.enseignant.save()
        self.assertIsNone(self.enseignant.niveau)

    def test_etablissement_can_be_null(self):
        self.enseignant.etablissement = None
        self.enseignant.save()
        self.assertIsNone(self.enseignant.etablissement)

    def test_ordering(self):
        from core.tests.factories import create_enseignant, create_etablissement
        etab = create_etablissement(code="TST003")
        e1 = create_enseignant(
            utilisateur=create_user(username="teacherA", email="tA@test.com"),
            date_embauche=datetime.date(2020, 1, 1),
            etablissement=etab,
        )
        e2 = create_enseignant(
            utilisateur=create_user(username="teacherB", email="tB@test.com"),
            date_embauche=datetime.date(2021, 1, 1),
            etablissement=etab,
        )
        qs = Enseignant.objects.all()
        self.assertEqual(qs.first(), e2)
        self.assertEqual(qs[1], e1)
        self.assertEqual(qs.last(), self.enseignant)

    def test_related_name_from_utilisateur(self):
        self.assertTrue(
            hasattr(self.enseignant.utilisateur, 'enseignant_profile')
        )

    def test_related_name_chapitres_crees(self):
        self.assertTrue(hasattr(self.enseignant, 'chapitres_crees'))

    def test_related_name_lecons_crees(self):
        self.assertTrue(hasattr(self.enseignant, 'lecons_crees'))

    def test_related_name_examens(self):
        self.assertTrue(hasattr(self.enseignant, 'examens'))

    def test_type_utilisateur_on_related_user(self):
        self.assertEqual(
            self.enseignant.utilisateur.type_utilisateur, "ENSEIGNANT"
        )
