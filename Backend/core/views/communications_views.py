from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from core.models import Actualite, Notification, Partenaire, Renovation
from core.serializers.communications_serializers import (
    ActualiteSerializer, NotificationSerializer, PartenaireSerializer, RenovationSerializer
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ActualiteViewSet(viewsets.ModelViewSet):
    """API pour gérer les actualités"""
    queryset = Actualite.objects.filter(est_publie=True)
    serializer_class = ActualiteSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'contenu', 'categorie']
    ordering_fields = ['date_creation', 'date_expiration']
    ordering = ['-date_creation']
    # Support upload d'images
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        """
        Lecture publique, mais création/modification réservées aux admins.
        """
        if self.action in ['list', 'retrieve', 'infinite']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Actualite.objects.filter(est_publie=True)
        # Filtre par établissement si demandé
        etab_id = self.request.query_params.get('etablissement')
        if etab_id:
            qs = qs.filter(etablissement_cible_id=etab_id)
        # Filtre par catégorie
        categorie = self.request.query_params.get('categorie')
        if categorie and categorie != 'Tout':
            qs = qs.filter(categorie=categorie)
        # Les admins voient aussi leurs brouillons (est_publie=False)
        user = self.request.user
        if user.is_authenticated and user.type_utilisateur == 'ADMINISTRATEUR':
            qs = Actualite.objects.all()
            if etab_id:
                qs = qs.filter(etablissement_cible_id=etab_id)
            if categorie and categorie != 'Tout':
                qs = qs.filter(categorie=categorie)
        return qs.order_by('-date_creation')

    def perform_create(self, serializer):
        """Attache l'auteur automatiquement à la création."""
        serializer.save(auteur=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def infinite(self, request):
        """
        Retourne toutes les actualités sans pagination pour le fil infini.
        Utilise une liste circulaire côté frontend.
        """
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    """API pour gérer les notifications"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']


class PartenaireViewSet(viewsets.ReadOnlyModelViewSet):
    """API publique pour les partenaires"""
    queryset = Partenaire.objects.all()
    serializer_class = PartenaireSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Pas de pagination pour le carrousel


class RenovationViewSet(viewsets.ReadOnlyModelViewSet):
    """API publique pour les rénovations"""
    queryset = Renovation.objects.all()
    serializer_class = RenovationSerializer
    permission_classes = [AllowAny]
    pagination_class = None
