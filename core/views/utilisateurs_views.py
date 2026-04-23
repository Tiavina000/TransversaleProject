from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from core.models import Utilisateur, Etudiant, Enseignant, AdminPlateforme
from core.serializers.base_serializers import UtilisateurSerializer, UtilisateurDetailSerializer
from core.serializers.utilisateurs_serializers import (
    EtudiantSerializer, EnseignantSerializer, AdminPlateformeSerializer
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UtilisateurViewSet(viewsets.ModelViewSet):
    """API pour gérer les utilisateurs"""
    queryset = Utilisateur.objects.all()
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'prenom']
    ordering_fields = ['date_creation', 'username']
    ordering = ['-date_creation']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UtilisateurDetailSerializer
        return UtilisateurSerializer

    @action(detail=False, methods=['get'])
    def actifs(self, request):
        """Retourner les utilisateurs actifs uniquement"""
        utilisateurs = self.queryset.filter(est_actif=True)
        page = self.paginate_queryset(utilisateurs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(utilisateurs, many=True)
        return Response(serializer.data)


class EtudiantViewSet(viewsets.ModelViewSet):
    """API pour gérer les étudiants"""
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_inscription', 'points_global']
    ordering = ['-date_inscription']

    @action(detail=False, methods=['get'])
    def top_points(self, request):
        """Retourner les étudiants avec le plus de points"""
        limit = request.query_params.get('limit', 10)
        etudiants = self.queryset.order_by('-points_global')[:int(limit)]
        serializer = self.get_serializer(etudiants, many=True)
        return Response(serializer.data)


class EnseignantViewSet(viewsets.ModelViewSet):
    """API pour gérer les enseignants"""
    queryset = Enseignant.objects.all()
    serializer_class = EnseignantSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['utilisateur__username', 'specialite']


class AdminPlateformeViewSet(viewsets.ModelViewSet):
    """API pour gérer les administrateurs"""
    queryset = AdminPlateforme.objects.all()
    serializer_class = AdminPlateformeSerializer
    pagination_class = StandardPagination
