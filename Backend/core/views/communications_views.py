from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from core.models import Actualite, Notification
from core.serializers.communications_serializers import (
    ActualiteSerializer, NotificationSerializer
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ActualiteViewSet(viewsets.ModelViewSet):
    """API pour gérer les actualités"""
    queryset = Actualite.objects.all()
    serializer_class = ActualiteSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'contenu']
    ordering_fields = ['date_creation', 'date_expiration']
    ordering = ['-date_creation']


class NotificationViewSet(viewsets.ModelViewSet):
    """API pour gérer les notifications"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']
