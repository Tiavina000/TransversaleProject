from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from core.models import (
    Examen, QuestionExamen, CopieExamen, ReponseExamen, LogSurveillace
)
from core.serializers.examens_serializers import (
    ExamenSerializer, QuestionExamenSerializer, CopieExamenSerializer,
    ReponseExamenSerializer, LogSurveillanceSerializer
)
from core.permissions import IsEnseignantOrReadOnly


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ExamenViewSet(viewsets.ModelViewSet):
    """API pour gérer les examens"""
    queryset = Examen.objects.all()
    serializer_class = ExamenSerializer
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'matiere__nom', 'enseignant__utilisateur__username']
    ordering_fields = ['date_debut', 'titre']
    ordering = ['-date_debut']

    @action(detail=False, methods=['get'])
    def publies(self, request):
        """Retourner les examens publiés uniquement"""
        examens = self.queryset.filter(est_publie=True)
        page = self.paginate_queryset(examens)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(examens, many=True)
        return Response(serializer.data)


class QuestionExamenViewSet(viewsets.ModelViewSet):
    """API pour gérer les questions d'examen"""
    queryset = QuestionExamen.objects.all()
    serializer_class = QuestionExamenSerializer
    permission_classes = [IsEnseignantOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['ordre']
    ordering = ['ordre']


class CopieExamenViewSet(viewsets.ModelViewSet):
    """API pour gérer les copies d'examen"""
    queryset = CopieExamen.objects.all()
    serializer_class = CopieExamenSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_debut', 'note_obtenue']
    ordering = ['-date_debut']

    @action(detail=True, methods=['post'])
    def soumettre(self, request, pk=None):
        """Soumettre une copie d'examen"""
        copie = self.get_object()
        if copie.est_termine:
            return Response(
                {'detail': 'Cette copie a déjà été soumise'},
                status=400
            )
        copie.est_termine = True
        copie.save()
        serializer = self.get_serializer(copie)
        return Response(serializer.data)


class ReponseExamenViewSet(viewsets.ModelViewSet):
    """API pour gérer les réponses d'examen"""
    queryset = ReponseExamen.objects.all()
    serializer_class = ReponseExamenSerializer
    pagination_class = StandardPagination


class LogSurveillanceViewSet(viewsets.ModelViewSet):
    """API pour gérer les logs de surveillance"""
    queryset = LogSurveillace.objects.all()
    serializer_class = LogSurveillanceSerializer
    pagination_class = StandardPagination
    ordering = ['-date_evenement']
