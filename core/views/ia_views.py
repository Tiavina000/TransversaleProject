from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from core.models import RequestIA, Recommandation
from core.serializers.ia_serializers import RequestIASerializer, RecommandationSerializer


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class RequestIAViewSet(viewsets.ModelViewSet):
    """API pour gérer les requêtes IA"""
    queryset = RequestIA.objects.all()
    serializer_class = RequestIASerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['type_requete']
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']


class RecommandationViewSet(viewsets.ModelViewSet):
    """API pour gérer les recommandations"""
    queryset = Recommandation.objects.all()
    serializer_class = RecommandationSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['score_pertinence', 'date_creation']
    ordering = ['-score_pertinence', '-date_creation']
