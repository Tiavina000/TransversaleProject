from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from core.models import SessionVisio, ParticipationVisio
from core.serializers.visioconference_serializers import (
    SessionVisioSerializer, ParticipationVisioSerializer
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class SessionVisioViewSet(viewsets.ModelViewSet):
    """API pour gérer les sessions de visioconférence"""
    queryset = SessionVisio.objects.all()
    serializer_class = SessionVisioSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'enseignant__utilisateur__username']
    ordering_fields = ['date_debut', 'titre']
    ordering = ['-date_debut']


class ParticipationVisioViewSet(viewsets.ModelViewSet):
    """API pour gérer les participations aux visioconférences"""
    queryset = ParticipationVisio.objects.all()
    serializer_class = ParticipationVisioSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_joindre', 'duree_participation']
    ordering = ['-date_joindre']
