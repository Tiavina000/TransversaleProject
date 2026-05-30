from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from core.models import Etablissement, AdminEtablissement
from core.serializers.etablissements_serializers import (
    EtablissementSerializer, AdminEtablissementSerializer
)


class NoPagination(PageNumberPagination):
    page_size = 200
    page_size_query_param = 'page_size'
    max_page_size = 500

class EtablissementViewSet(viewsets.ModelViewSet):
    """API pour gérer les établissements"""
    queryset = Etablissement.objects.all()
    serializer_class = EtablissementSerializer
    pagination_class = NoPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'code_etablissement', 'email']
    ordering_fields = ['nom', 'id']

    def get_queryset(self):
        qs = Etablissement.objects.all()
        type_filter = self.request.query_params.get('type')
        if type_filter in dict(Etablissement.TYPE_CHOICES):
            qs = qs.filter(type=type_filter)
        return qs

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return super().get_permissions()


class AdminEtablissementViewSet(viewsets.ModelViewSet):
    """API pour gérer les administrateurs d'établissements"""
    queryset = AdminEtablissement.objects.all()
    serializer_class = AdminEtablissementSerializer
    pagination_class = NoPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['etablissement', 'fonction']
