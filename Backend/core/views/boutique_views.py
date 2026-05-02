<<<<<<< HEAD
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
=======
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
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

<<<<<<< HEAD
    @action(detail=False, methods=['post'])
    def add(self, request):
        """Ajouter un article au panier de l'étudiant connecté"""
        user = request.user
        if not user.is_authenticated or user.type_utilisateur != 'ETUDIANT' or not hasattr(user, 'etudiant_profile'):
            return Response({'detail': 'Accès étudiant requis'}, status=status.HTTP_403_FORBIDDEN)

        ressource_id = request.data.get('ressource_id')
        if not ressource_id:
            return Response({'detail': 'ressource_id requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ressource = RessourceBoutique.objects.get(id=ressource_id)
        except RessourceBoutique.DoesNotExist:
            return Response({'detail': 'Ressource non trouvée'}, status=status.HTTP_404_NOT_FOUND)

        etudiant = user.etudiant_profile
        panier, _ = Panier.objects.get_or_create(etudiant=etudiant)

        item, created = PanierItem.objects.get_or_create(
            panier=panier,
            ressources=ressource,
            defaults={'quantite': 1}
        )
        if not created:
            item.quantite += 1
            item.save()

        serializer = PanierSerializer(panier)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))

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
