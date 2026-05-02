<<<<<<< HEAD
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from core.models import SessionVisio, ParticipationVisio, QuestionVisio
from core.serializers.visioconference_serializers import (
    SessionVisioSerializer, ParticipationVisioSerializer, QuestionVisioSerializer
)
from core.services.livekit_service import generate_livekit_token, get_livekit_url
=======
from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from core.models import SessionVisio, ParticipationVisio
from core.serializers.visioconference_serializers import (
    SessionVisioSerializer, ParticipationVisioSerializer
)
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))


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

<<<<<<< HEAD
    def _get_etudiant(self, user):
        if user.is_authenticated and user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            return user.etudiant_profile
        return None

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        session = self.get_object()
        etudiant = self._get_etudiant(request.user)
        if not etudiant:
            return Response({'detail': 'Accès étudiant requis'}, status=403)
        part, created = ParticipationVisio.objects.get_or_create(
            etudiant=etudiant, session=session
        )
        serializer = ParticipationVisioSerializer(part)
        return Response(serializer.data, status=201 if created else 200)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        session = self.get_object()
        etudiant = self._get_etudiant(request.user)
        if not etudiant:
            return Response({'detail': 'Accès étudiant requis'}, status=403)
        part = get_object_or_404(ParticipationVisio, etudiant=etudiant, session=session)
        part.date_quitter = timezone.now()
        if part.date_joindre:
            delta = (part.date_quitter - part.date_joindre).total_seconds()
            part.duree_participation = int(delta)
        part.save()
        return Response({'status': 'left'})

    @action(detail=True, methods=['post'], url_path='raise-hand')
    def raise_hand(self, request, pk=None):
        session = self.get_object()
        etudiant = self._get_etudiant(request.user)
        if not etudiant:
            return Response({'detail': 'Accès étudiant requis'}, status=403)
        part, _ = ParticipationVisio.objects.get_or_create(etudiant=etudiant, session=session)
        events = part.evenements_inactive
        if not any(e.get('type') == 'hand_raised' for e in events):
            events.append({'type': 'hand_raised', 'time': timezone.now().isoformat()})
            part.evenements_inactive = events
            part.save()
        return Response({'status': 'hand_raised'})

    @action(detail=True, methods=['post'], url_path='lower-hand')
    def lower_hand(self, request, pk=None):
        session = self.get_object()
        etudiant = self._get_etudiant(request.user)
        if not etudiant:
            return Response({'detail': 'Accès étudiant requis'}, status=403)
        part, _ = ParticipationVisio.objects.get_or_create(etudiant=etudiant, session=session)
        events = [e for e in part.evenements_inactive if e.get('type') != 'hand_raised']
        part.evenements_inactive = events
        part.save()
        return Response({'status': 'hand_lowered'})

    @action(detail=True, methods=['get', 'post'])
    def questions(self, request, pk=None):
        session = self.get_object()
        if request.method == 'POST':
            etudiant = self._get_etudiant(request.user)
            if not etudiant:
                return Response({'detail': 'Accès étudiant requis'}, status=403)
            q = QuestionVisio.objects.create(
                session=session, etudiant=etudiant,
                contenu=request.data.get('content', '')
            )
            return Response(QuestionVisioSerializer(q).data, status=201)
        questions = session.questions.all()
        page = self.paginate_queryset(questions)
        if page is not None:
            serializer = QuestionVisioSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(QuestionVisioSerializer(questions, many=True).data)

    @action(detail=True, methods=['patch'], url_path='questions/(?P<qid>[^/.]+)/answered')
    def mark_answered(self, request, pk=None, qid=None):
        session = self.get_object()
        question = get_object_or_404(QuestionVisio, id=qid, session=session)
        question.est_answered = True
        question.save()
        return Response(QuestionVisioSerializer(question).data)

    @action(detail=True, methods=['get'])
    def livekit_token(self, request, pk=None):
        session = self.get_object()
        user = request.user
        is_publisher = user == session.enseignant.utilisateur if session.enseignant else False
        identity = f"{user.id}-{user.username}"
        room = f"session-{session.id}"
        token = generate_livekit_token(identity, room, is_publisher)
        return Response({
            'token': token,
            'url': get_livekit_url(),
            'room': room,
            'identity': identity,
        })

    @action(detail=True, methods=['post'])
    def ban(self, request, pk=None):
        session = self.get_object()
        user_id = request.data.get('user_id')
        duration = request.data.get('duration_hours', 1)
        if not user_id:
            return Response({'detail': 'user_id requis'}, status=400)
        from core.models import Utilisateur
        try:
            target_user = Utilisateur.objects.get(id=user_id)
        except Utilisateur.DoesNotExist:
            return Response({'detail': 'Utilisateur introuvable'}, status=404)
        if target_user.type_utilisateur == 'ETUDIANT' and hasattr(target_user, 'etudiant_profile'):
            etudiant = target_user.etudiant_profile
            part, _ = ParticipationVisio.objects.get_or_create(etudiant=etudiant, session=session)
            events = part.evenements_inactive
            events.append({
                'type': 'banned', 'duration_hours': duration,
                'time': timezone.now().isoformat()
            })
            part.evenements_inactive = events
            part.save()
        return Response({'status': 'banned', 'user_id': user_id})

=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))

class ParticipationVisioViewSet(viewsets.ModelViewSet):
    """API pour gérer les participations aux visioconférences"""
    queryset = ParticipationVisio.objects.all()
    serializer_class = ParticipationVisioSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_joindre', 'duree_participation']
    ordering = ['-date_joindre']
