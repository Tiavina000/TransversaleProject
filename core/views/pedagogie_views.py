from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from core.models import (
    NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia
)
from core.serializers.pedagogie_serializers import (
    NiveauScolaireSerializer, MatiereSerializer, ChapitreSerializer,
    LeconSerializer, FichierMultimediaSerializer, ChapitreDetailSerializer
)
from core.permissions import IsEnseignantOrReadOnly, IsAdminOrReadOnly


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class NiveauScolaireViewSet(viewsets.ModelViewSet):
    """API pour gérer les niveaux scolaires"""
    queryset = NiveauScolaire.objects.all()
    serializer_class = NiveauScolaireSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = StandardPagination
    ordering_fields = ['ordre']
    ordering = ['ordre']


class MatiereViewSet(viewsets.ModelViewSet):
    """API pour gérer les matières"""
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'code']
    ordering_fields = ['ordre', 'nom']
    ordering = ['ordre']

    @action(detail=True, methods=['get'])
    def chapitres(self, request, pk=None):
        """Retourner tous les chapitres d'une matière"""
        matiere = self.get_object()
        chapitres = matiere.chapitres.all()
        serializer = ChapitreDetailSerializer(chapitres, many=True)
        return Response(serializer.data)


class ChapitreViewSet(viewsets.ModelViewSet):
    """API pour gérer les chapitres"""
    queryset = Chapitre.objects.all()
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order']
    ordering = ['order']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChapitreDetailSerializer
        return ChapitreSerializer


class LeconViewSet(viewsets.ModelViewSet):
    """API pour gérer les leçons"""
    queryset = Lecon.objects.all()
    serializer_class = LeconSerializer
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order']
    ordering = ['order']


class FichierMultimediaViewSet(viewsets.ModelViewSet):
    """API pour gérer les fichiers multimédia"""
    queryset = FichierMultimedia.objects.all()
    serializer_class = FichierMultimediaSerializer
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['titre', 'type_fichier']
