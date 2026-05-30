from django.test import TestCase, RequestFactory
from rest_framework.request import Request
from django.contrib.auth.models import AnonymousUser

from core.permissions import IsEnseignantOrReadOnly, IsAdminOrReadOnly, IsEtudiant
from core.tests.factories import create_user


class IsEnseignantOrReadOnlyTest(TestCase):
    def setUp(self):
        self.permission = IsEnseignantOrReadOnly()
        self.factory = RequestFactory()

    def _make_request(self, method='GET', user=None):
        http_request = self.factory.generic(method, '/')
        drf_request = Request(http_request)
        drf_request.user = user or AnonymousUser()
        return drf_request

    def test_safe_methods_allowed_for_student(self):
        user = create_user(type_utilisateur='ETUDIANT')
        for method in ['GET', 'HEAD', 'OPTIONS']:
            request = self._make_request(method, user)
            self.assertTrue(
                self.permission.has_permission(request, None),
                f'{method} should be allowed for student'
            )

    def test_safe_methods_allowed_for_unauthenticated(self):
        request = self._make_request('GET', AnonymousUser())
        self.assertTrue(self.permission.has_permission(request, None))

    def test_post_allowed_for_enseignant(self):
        user = create_user(type_utilisateur='ENSEIGNANT')
        request = self._make_request('POST', user)
        self.assertTrue(self.permission.has_permission(request, None))

    def test_post_allowed_for_administrateur(self):
        user = create_user(type_utilisateur='ADMINISTRATEUR')
        request = self._make_request('POST', user)
        self.assertTrue(self.permission.has_permission(request, None))

    def test_post_denied_for_etudiant(self):
        user = create_user(type_utilisateur='ETUDIANT')
        request = self._make_request('POST', user)
        self.assertFalse(self.permission.has_permission(request, None))

    def test_post_denied_for_unauthenticated(self):
        request = self._make_request('POST', AnonymousUser())
        self.assertFalse(self.permission.has_permission(request, None))

    def test_put_denied_for_etudiant(self):
        user = create_user(type_utilisateur='ETUDIANT')
        request = self._make_request('PUT', user)
        self.assertFalse(self.permission.has_permission(request, None))

    def test_delete_denied_for_etudiant(self):
        user = create_user(type_utilisateur='ETUDIANT')
        request = self._make_request('DELETE', user)
        self.assertFalse(self.permission.has_permission(request, None))

    def test_patch_allowed_for_enseignant(self):
        user = create_user(type_utilisateur='ENSEIGNANT')
        request = self._make_request('PATCH', user)
        self.assertTrue(self.permission.has_permission(request, None))


class IsAdminOrReadOnlyTest(TestCase):
    def setUp(self):
        self.permission = IsAdminOrReadOnly()
        self.factory = RequestFactory()

    def _make_request(self, method='GET', user=None):
        http_request = self.factory.generic(method, '/')
        drf_request = Request(http_request)
        drf_request.user = user or AnonymousUser()
        return drf_request

    def test_get_allowed_for_student(self):
        user = create_user(type_utilisateur='ETUDIANT')
        request = self._make_request('GET', user)
        self.assertTrue(self.permission.has_permission(request, None))

    def test_post_denied_for_enseignant(self):
        user = create_user(type_utilisateur='ENSEIGNANT')
        request = self._make_request('POST', user)
        self.assertFalse(self.permission.has_permission(request, None))

    def test_post_allowed_for_administrateur(self):
        user = create_user(type_utilisateur='ADMINISTRATEUR')
        request = self._make_request('POST', user)
        self.assertTrue(self.permission.has_permission(request, None))


class IsEtudiantTest(TestCase):
    def setUp(self):
        self.permission = IsEtudiant()
        self.factory = RequestFactory()

    def _make_request(self, method='GET', user=None):
        http_request = self.factory.generic(method, '/')
        drf_request = Request(http_request)
        drf_request.user = user or AnonymousUser()
        return drf_request

    def test_allowed_for_etudiant(self):
        user = create_user(type_utilisateur='ETUDIANT')
        request = self._make_request('GET', user)
        self.assertTrue(self.permission.has_permission(request, None))

    def test_denied_for_enseignant(self):
        user = create_user(type_utilisateur='ENSEIGNANT')
        request = self._make_request('GET', user)
        self.assertFalse(self.permission.has_permission(request, None))

    def test_denied_for_unauthenticated(self):
        request = self._make_request('GET', AnonymousUser())
        self.assertFalse(self.permission.has_permission(request, None))
