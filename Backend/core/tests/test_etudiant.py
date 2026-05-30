import datetime
from django.test import TestCase
from django.db import IntegrityError
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.tests.factories import (
    create_user, create_etudiant, create_enseignant, create_etablissement,
    create_niveau, create_matiere, create_chapitre, create_lecon,
    create_examen, create_classe
)
from core.models import Etudiant, Chapitre, Lecon, Examen, CopieExamen, QuestionExamen, ReponseExamen, SessionEtude
from core.serializers.utilisateurs_serializers import EtudiantSerializer


class EtudiantModelTest(TestCase):
    def setUp(self):
        self.etudiant = create_etudiant()

    def test_create_etudiant(self):
        self.assertIsInstance(self.etudiant, Etudiant)
        self.assertTrue(self.etudiant.numero_etudiant.startswith("ETU"))
        self.assertEqual(self.etudiant.points_global, 0)

    def test_string_representation(self):
        expected = f"Etudiant: {self.etudiant.utilisateur.username}"
        self.assertEqual(str(self.etudiant), expected)

    def test_one_to_one_with_utilisateur(self):
        self.assertEqual(
            self.etudiant.utilisateur.etudiant_profile,
            self.etudiant
        )

    def test_one_to_one_unique_constraint(self):
        with self.assertRaises(IntegrityError):
            Etudiant.objects.create(
                utilisateur=self.etudiant.utilisateur,
                etablissement=self.etudiant.etablissement,
                numero_etudiant="ETU002",
            )

    def test_foreign_key_to_etablissement(self):
        etab = create_etablissement(nom="Another School", code="TST099")
        self.etudiant.etablissement = etab
        self.etudiant.save()
        self.assertEqual(self.etudiant.etablissement.nom, "Another School")

    def test_etablissement_can_be_null(self):
        self.etudiant.etablissement = None
        self.etudiant.save()
        self.assertIsNone(self.etudiant.etablissement)

    def test_foreign_key_to_niveau(self):
        niveau = create_niveau(nom="Terminale", ordre=13)
        self.etudiant.niveau = niveau
        self.etudiant.save()
        self.assertEqual(self.etudiant.niveau.nom, "Terminale")

    def test_niveau_can_be_null(self):
        self.etudiant.niveau = None
        self.etudiant.save()
        self.assertIsNone(self.etudiant.niveau)

    def test_ordering(self):
        etab = create_etablissement(code="TST098")
        e1 = create_etudiant(
            utilisateur=create_user(
                username="studentA", email="stA@test.com",
                type_utilisateur="ETUDIANT"
            ),
            etablissement=etab,
        )
        e2 = create_etudiant(
            utilisateur=create_user(
                username="studentB", email="stB@test.com",
                type_utilisateur="ETUDIANT"
            ),
            etablissement=etab,
        )
        qs = Etudiant.objects.all()
        self.assertEqual(qs.first(), e2)
        self.assertEqual(qs[1], e1)

    def test_date_inscription_auto_set(self):
        self.assertIsNotNone(self.etudiant.date_inscription)

    def test_points_global_default_zero(self):
        self.assertEqual(self.etudiant.points_global, 0)

    def test_related_name_from_utilisateur(self):
        self.assertTrue(hasattr(self.etudiant.utilisateur, 'etudiant_profile'))

    def test_foreign_key_to_classe(self):
        niveau = create_niveau()
        etab = create_etablissement()
        classe = create_classe(niveau=niveau, etablissement=etab)
        self.etudiant.classe = classe
        self.etudiant.save()
        self.assertEqual(self.etudiant.classe.nom, classe.nom)

    def test_classe_can_be_null(self):
        self.etudiant.classe = None
        self.etudiant.save()
        self.assertIsNone(self.etudiant.classe)


class EtudiantSerializerTest(TestCase):
    def setUp(self):
        self.etudiant = create_etudiant()

    def test_serialize_contains_expected_fields(self):
        serializer = EtudiantSerializer(self.etudiant)
        expected = {
            'id', 'utilisateur', 'numero_etudiant', 'points_global',
            'date_inscription', 'niveau', 'niveau_nom',
            'etablissement', 'etablissement_nom'
        }
        self.assertEqual(set(serializer.data.keys()), expected)

    def test_serialized_utilisateur_is_nested(self):
        serializer = EtudiantSerializer(self.etudiant)
        self.assertIn('id', serializer.data['utilisateur'])
        self.assertIn('username', serializer.data['utilisateur'])
        self.assertIn('email', serializer.data['utilisateur'])
        self.assertIn('prenom', serializer.data['utilisateur'])

    def test_serialized_etablissement_nom_is_readonly(self):
        serializer = EtudiantSerializer(self.etudiant)
        self.assertEqual(
            serializer.data['etablissement_nom'],
            self.etudiant.etablissement.nom
        )

    def test_serialized_niveau_nom_is_readonly(self):
        serializer = EtudiantSerializer(self.etudiant)
        self.assertEqual(
            serializer.data['niveau_nom'],
            self.etudiant.niveau.nom
        )

    def test_serialized_date_inscription_is_readonly(self):
        data = {
            'utilisateur_id': self.etudiant.utilisateur.id,
            'numero_etudiant': 'NEW001',
        }
        serializer = EtudiantSerializer(self.etudiant, data=data)
        self.assertTrue(serializer.is_valid())
        self.assertIsNone(serializer.validated_data.get('date_inscription'))

    def test_deserialize_valid_data(self):
        user = create_user(
            username="newstudent", email="ns@test.com",
            type_utilisateur="ETUDIANT"
        )
        niveau = create_niveau(nom="5ème", ordre=5)
        data = {
            'utilisateur_id': user.id,
            'numero_etudiant': 'ETU999',
            'niveau': niveau.id,
        }
        serializer = EtudiantSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)

    def test_deserialize_missing_utilisateur_id(self):
        data = {'numero_etudiant': 'ETU888'}
        serializer = EtudiantSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('utilisateur_id', serializer.errors)

    def test_utilisateur_id_is_write_only(self):
        serializer = EtudiantSerializer(self.etudiant)
        self.assertNotIn('utilisateur_id', serializer.data)

    def test_update_points_global(self):
        data = {'points_global': 100}
        serializer = EtudiantSerializer(
            self.etudiant, data=data, partial=True
        )
        self.assertTrue(serializer.is_valid())
        updated = serializer.save()
        self.assertEqual(updated.points_global, 100)


class BaseEtudiantAPITest(APITestCase):
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
        self.chapitre = create_chapitre(
            matiere=self.matiere, niveau=self.niveau,
            createur=self.teacher
        )

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )


class EtudiantViewSetTest(BaseEtudiantAPITest):
    def setUp(self):
        super().setUp()
        self.list_url = '/api/etudiants/'

    def test_list_etudiants_authenticated(self):
        self.authenticate(self.student_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_list_etudiants_unauthenticated(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_etudiant(self):
        self.authenticate(self.student_user)
        url = f'{self.list_url}{self.etudiant.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.etudiant.id)
        self.assertIn('utilisateur', response.data)
        self.assertIn('niveau_nom', response.data)
        self.assertIn('etablissement_nom', response.data)

    def test_create_etudiant(self):
        self.authenticate(self.admin_user)
        new_user = create_user(
            username="newstudent2", email="ns2@test.com",
            type_utilisateur="ETUDIANT"
        )
        data = {
            'utilisateur_id': new_user.id,
            'numero_etudiant': 'ETU555',
            'niveau': self.niveau.id,
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Etudiant.objects.count(), 2)

    def test_create_etudiant_unauthenticated(self):
        data = {
            'utilisateur_id': 999,
            'numero_etudiant': 'ETU999',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_etudiant(self):
        self.authenticate(self.admin_user)
        url = f'{self.list_url}{self.etudiant.id}/'
        data = {'points_global': 50}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.etudiant.refresh_from_db()
        self.assertEqual(self.etudiant.points_global, 50)

    def test_delete_etudiant(self):
        self.authenticate(self.admin_user)
        url = f'{self.list_url}{self.etudiant.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Etudiant.objects.count(), 0)

    def test_pagination_default_page_size(self):
        self.authenticate(self.student_user)
        etab = create_etablissement(code="TST097")
        for i in range(15):
            u = create_user(
                username=f"batchstudent{i}", email=f"bs{i}@test.com",
                type_utilisateur="ETUDIANT"
            )
            create_etudiant(
                utilisateur=u, etablissement=etab,
                niveau=self.niveau,
            )
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)
        self.assertIsNotNone(response.data['next'])

    def test_top_points_action(self):
        self.authenticate(self.student_user)
        etab = create_etablissement(code="TST096")
        for i in range(5):
            u = create_user(
                username=f"topstudent{i}", email=f"ts{i}@test.com",
                type_utilisateur="ETUDIANT"
            )
            e = create_etudiant(
                utilisateur=u, etablissement=etab,
                niveau=self.niveau,
            )
            e.points_global = (5 - i) * 10
            e.save()
        response = self.client.get(f'{self.list_url}top-points/?limit=3')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertGreaterEqual(
            response.data[0]['points_global'],
            response.data[1]['points_global']
        )

    def test_top_points_default_limit(self):
        self.authenticate(self.student_user)
        response = self.client.get(f'{self.list_url}top-points/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class StudentChapitreViewSetTest(BaseEtudiantAPITest):
    def test_student_sees_chapitres_with_published_lecons(self):
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
        draft_chap = create_chapitre(
            matiere=self.matiere, niveau=self.niveau,
            createur=self.teacher, titre="Draft Chap"
        )
        create_lecon(
            chapitre=draft_chap, createur=self.teacher,
            est_publie=False
        )
        self.authenticate(self.student_user)
        response = self.client.get('/api/chapitres/')
        ids = [c['id'] for c in response.data['results']]
        self.assertNotIn(draft_chap.id, ids)

    def test_teacher_sees_all_own_chapitres(self):
        create_lecon(
            chapitre=self.chapitre, createur=self.teacher,
            est_publie=False
        )
        self.authenticate(self.teacher_user)
        response = self.client.get('/api/teacher/chapitres/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in response.data['results']]
        self.assertIn(self.chapitre.id, ids)

    def test_student_sees_only_chapitres_from_own_etablissement(self):
        other_etab = create_etablissement(nom="Other School", code="OTH01")
        other_teacher = create_enseignant(
            utilisateur=create_user(
                username="otherteacher", email="othert@test.com",
            ),
            etablissement=other_etab,
            niveau=self.niveau,
        )
        other_chap = create_chapitre(
            matiere=self.matiere, niveau=self.niveau,
            createur=other_teacher, titre="Other School Chap"
        )
        create_lecon(
            chapitre=other_chap, createur=other_teacher,
            est_publie=True
        )
        self.authenticate(self.student_user)
        response = self.client.get('/api/chapitres/')
        ids = [c['id'] for c in response.data['results']]
        self.assertNotIn(other_chap.id, ids)


class StudentLeconViewSetTest(BaseEtudiantAPITest):
    def setUp(self):
        super().setUp()
        self.published_lecon = create_lecon(
            chapitre=self.chapitre, createur=self.teacher,
            est_publie=True, titre="Published Lecon"
        )
        self.draft_lecon = create_lecon(
            chapitre=self.chapitre, createur=self.teacher,
            est_publie=False, titre="Draft Lecon"
        )

    def test_student_sees_only_published_lecons(self):
        self.authenticate(self.student_user)
        response = self.client.get('/api/lecons/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [l['id'] for l in response.data['results']]
        self.assertIn(self.published_lecon.id, ids)

    def test_student_does_not_see_draft_lecons(self):
        self.authenticate(self.student_user)
        response = self.client.get('/api/lecons/')
        ids = [l['id'] for l in response.data['results']]
        self.assertNotIn(self.draft_lecon.id, ids)

    def test_student_sees_lecons_from_own_etablissement_only(self):
        other_etab = create_etablissement(nom="Other Etab", code="OTH02")
        other_teacher = create_enseignant(
            utilisateur=create_user(
                username="otherteacher2", email="othert2@test.com",
            ),
            etablissement=other_etab,
            niveau=self.niveau,
        )
        other_chap = create_chapitre(
            matiere=self.matiere, niveau=self.niveau,
            createur=other_teacher, titre="Other Chap"
        )
        other_lecon = create_lecon(
            chapitre=other_chap, createur=other_teacher,
            est_publie=True, titre="Other Teacher Lecon"
        )
        self.authenticate(self.student_user)
        response = self.client.get('/api/lecons/')
        ids = [l['id'] for l in response.data['results']]
        self.assertIn(self.published_lecon.id, ids)
        self.assertNotIn(other_lecon.id, ids)


class StudentExamFlowTest(BaseEtudiantAPITest):
    def setUp(self):
        super().setUp()
        self.published_examen = create_examen(
            enseignant=self.teacher, matiere=self.matiere,
            niveau=self.niveau, est_publie=True, titre="Published Exam"
        )
        self.draft_examen = create_examen(
            enseignant=self.teacher, matiere=self.matiere,
            niveau=self.niveau, est_publie=False, titre="Draft Exam"
        )
        self.question = QuestionExamen.objects.create(
            examen=self.published_examen,
            texte="Question 1",
            type_question="QCM",
            points=5,
            ordre=1,
            options=["A", "B", "C"],
            reponse_correcte="A",
        )

    def test_student_sees_only_published_exams(self):
        self.authenticate(self.student_user)
        response = self.client.get('/api/examens/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [e['id'] for e in response.data['results']]
        self.assertIn(self.published_examen.id, ids)
        self.assertNotIn(self.draft_examen.id, ids)

    def test_student_can_start_exam(self):
        self.authenticate(self.student_user)
        url = f'/api/examens/{self.published_examen.id}/start/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            CopieExamen.objects.filter(
                examen=self.published_examen,
                etudiant=self.etudiant,
            ).exists()
        )

    def test_student_cannot_start_exam_twice(self):
        self.authenticate(self.student_user)
        url = f'/api/examens/{self.published_examen.id}/start/'
        self.client.post(url)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_student_cannot_start_exam_if_already_submitted(self):
        CopieExamen.objects.create(
            examen=self.published_examen,
            etudiant=self.etudiant,
            est_termine=True,
        )
        self.authenticate(self.student_user)
        url = f'/api/examens/{self.published_examen.id}/start/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_can_submit_exam(self):
        self.authenticate(self.student_user)
        start_url = f'/api/examens/{self.published_examen.id}/start/'
        self.client.post(start_url)
        submit_url = f'/api/examens/{self.published_examen.id}/submit/'
        response = self.client.post(submit_url, {
            'reponses': [
                {'question_id': self.question.id, 'reponse': 'A'}
            ]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        copie = CopieExamen.objects.get(
            examen=self.published_examen, etudiant=self.etudiant
        )
        self.assertTrue(copie.est_termine)

    def test_student_cannot_submit_twice(self):
        self.authenticate(self.student_user)
        start_url = f'/api/examens/{self.published_examen.id}/start/'
        self.client.post(start_url)
        submit_url = f'/api/examens/{self.published_examen.id}/submit/'
        self.client.post(submit_url, {
            'reponses': [
                {'question_id': self.question.id, 'reponse': 'A'}
            ]
        }, format='json')
        response = self.client.post(submit_url, {
            'reponses': [
                {'question_id': self.question.id, 'reponse': 'A'}
            ]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_can_get_timer(self):
        self.authenticate(self.student_user)
        url = f'/api/examens/{self.published_examen.id}/timer/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_seconds', response.data)
        self.assertIn('remaining_seconds', response.data)
        self.assertIn('duree_minutes', response.data)
        self.assertEqual(
            response.data['duree_minutes'],
            self.published_examen.duree_minutes
        )

    def test_student_cannot_access_corrigeables(self):
        self.authenticate(self.student_user)
        response = self.client.get('/api/examens/corrigeables/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_submit_auto_grades_qcm(self):
        self.authenticate(self.student_user)
        start_url = f'/api/examens/{self.published_examen.id}/start/'
        self.client.post(start_url)
        submit_url = f'/api/examens/{self.published_examen.id}/submit/'
        response = self.client.post(submit_url, {
            'reponses': [
                {'question_id': self.question.id, 'reponse': 'A'}
            ]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        reponse = ReponseExamen.objects.get(
            copie__examen=self.published_examen,
            copie__etudiant=self.etudiant,
            question=self.question,
        )
        self.assertTrue(reponse.est_correct)
        self.assertEqual(reponse.points_obtenus, 5.0)


class StudentProgressionTest(BaseEtudiantAPITest):
    def test_start_session(self):
        self.authenticate(self.student_user)
        url = f'/api/courses/{self.chapitre.id}/session/start/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('id', response.data)
        self.assertTrue(
            SessionEtude.objects.filter(
                etudiant=self.etudiant,
                chapitre=self.chapitre,
                statut='EN_COURS'
            ).exists()
        )

    def test_end_session(self):
        self.authenticate(self.student_user)
        start_url = f'/api/courses/{self.chapitre.id}/session/start/'
        start_resp = self.client.post(start_url)
        session_id = start_resp.data['id']
        end_url = f'/api/sessions/{session_id}/end/'
        response = self.client.post(end_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'ended')
        session = SessionEtude.objects.get(id=session_id)
        self.assertEqual(session.statut, 'TERMINE')
        self.assertIsNotNone(session.date_fin)

    def test_pause_session(self):
        self.authenticate(self.student_user)
        start_url = f'/api/courses/{self.chapitre.id}/session/start/'
        start_resp = self.client.post(start_url)
        session_id = start_resp.data['id']
        pause_url = f'/api/sessions/{session_id}/pause/'
        response = self.client.post(pause_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'paused')
        session = SessionEtude.objects.get(id=session_id)
        self.assertEqual(session.statut, 'PAUSE')

    def test_resume_session(self):
        self.authenticate(self.student_user)
        start_url = f'/api/courses/{self.chapitre.id}/session/start/'
        start_resp = self.client.post(start_url)
        session_id = start_resp.data['id']
        pause_url = f'/api/sessions/{session_id}/pause/'
        self.client.post(pause_url)
        resume_url = f'/api/sessions/{session_id}/resume/'
        response = self.client.post(resume_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'resumed')
        session = SessionEtude.objects.get(id=session_id)
        self.assertEqual(session.statut, 'EN_COURS')

    def test_heartbeat(self):
        self.authenticate(self.student_user)
        start_url = f'/api/courses/{self.chapitre.id}/session/start/'
        start_resp = self.client.post(start_url)
        session_id = start_resp.data['id']
        hb_url = f'/api/sessions/{session_id}/heartbeat/'
        response = self.client.post(hb_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('seconds', response.data)
        session = SessionEtude.objects.get(id=session_id)
        self.assertGreater(session.temps_cumule_secondes, 0)


class StudentBulletinTest(BaseEtudiantAPITest):
    def test_mes_notes_returns_student_notes(self):
        self.authenticate(self.student_user)
        examen = create_examen(
            enseignant=self.teacher, matiere=self.matiere,
            niveau=self.niveau, est_publie=True,
        )
        CopieExamen.objects.create(
            examen=examen, etudiant=self.etudiant,
            est_termine=True, note_obtenue=15.0,
            date_soumission=timezone.now(),
        )
        response = self.client.get('/api/mes-notes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['note_obtenue'], 15.0)
        self.assertEqual(
            response.data[0]['examen_titre'], examen.titre
        )

    def test_mes_notes_empty_when_no_notes(self):
        self.authenticate(self.student_user)
        response = self.client.get('/api/mes-notes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_teacher_cannot_access_mes_notes(self):
        self.authenticate(self.teacher_user)
        response = self.client.get('/api/mes-notes/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mes_notes_excludes_unsubmitted_copies(self):
        self.authenticate(self.student_user)
        examen = create_examen(
            enseignant=self.teacher, matiere=self.matiere,
            niveau=self.niveau, est_publie=True,
        )
        CopieExamen.objects.create(
            examen=examen, etudiant=self.etudiant,
            est_termine=False,
        )
        response = self.client.get('/api/mes-notes/')
        self.assertEqual(len(response.data), 0)
