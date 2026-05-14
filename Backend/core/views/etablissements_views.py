from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from core.models import Etablissement, AdminEtablissement
from core.serializers.etablissements_serializers import (
    EtablissementSerializer, AdminEtablissementSerializer
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


from rest_framework.permissions import AllowAny

class EtablissementViewSet(viewsets.ModelViewSet):
    """API pour gérer les établissements"""
    queryset = Etablissement.objects.all()
    serializer_class = EtablissementSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'code_etablissement', 'email']
    ordering_fields = ['nom', 'date_creation']

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return super().get_permissions()


class AdminEtablissementViewSet(viewsets.ModelViewSet):
    """API pour gérer les administrateurs d'établissements"""
    queryset = AdminEtablissement.objects.all()
    serializer_class = AdminEtablissementSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['etablissement', 'fonction']
