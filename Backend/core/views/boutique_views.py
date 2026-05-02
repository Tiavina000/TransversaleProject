from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from core.models import RessourceBoutique, Panier, PanierItem, Commande
from core.serializers.boutique_serializers import (
    RessourceBoutiqueSerializer, PanierSerializer, PanierItemSerializer,
    CommandeSerializer
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class RessourceBoutiqueViewSet(viewsets.ModelViewSet):
    """API pour gérer les ressources de la boutique"""
    queryset = RessourceBoutique.objects.all()
    serializer_class = RessourceBoutiqueSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'description']
    ordering_fields = ['prix', 'date_creation']
    ordering = ['-date_creation']

    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Retourner les ressources disponibles uniquement"""
        ressources = self.queryset.filter(est_disponible=True)
        page = self.paginate_queryset(ressources)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(ressources, many=True)
        return Response(serializer.data)


class PanierViewSet(viewsets.ModelViewSet):
    """API pour gérer les paniers"""
    queryset = Panier.objects.all()
    serializer_class = PanierSerializer
    pagination_class = StandardPagination


class PanierItemViewSet(viewsets.ModelViewSet):
    """API pour gérer les articles du panier"""
    queryset = PanierItem.objects.all()
    serializer_class = PanierItemSerializer
    pagination_class = StandardPagination


class CommandeViewSet(viewsets.ModelViewSet):
    """API pour gérer les commandes"""
    queryset = Commande.objects.all()
    serializer_class = CommandeSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_creation', 'montant_total']
    ordering = ['-date_creation']
