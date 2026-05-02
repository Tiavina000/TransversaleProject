<<<<<<< HEAD
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from core.models import Actualite, Notification, Partenaire, Renovation
from core.serializers.communications_serializers import (
    ActualiteSerializer, NotificationSerializer, PartenaireSerializer, RenovationSerializer
=======
from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from core.models import Actualite, Notification
from core.serializers.communications_serializers import (
    ActualiteSerializer, NotificationSerializer
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ActualiteViewSet(viewsets.ModelViewSet):
    """API pour gérer les actualités"""
<<<<<<< HEAD
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
=======
    queryset = Actualite.objects.all()
    serializer_class = ActualiteSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'contenu']
    ordering_fields = ['date_creation', 'date_expiration']
    ordering = ['-date_creation']
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))


class NotificationViewSet(viewsets.ModelViewSet):
    """API pour gérer les notifications"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']
<<<<<<< HEAD

    def get_queryset(self):
        qs = Notification.objects.all()
        user = self.request.user
        if user.is_authenticated:
            qs = qs.filter(utilisateur=user)
        non_lues = self.request.query_params.get('non_lues')
        if non_lues and non_lues.lower() == 'true':
            qs = qs.filter(est_lue=False)
        return qs

    @action(detail=False, methods=['post'])
    def creer_visio(self, request):
        titre = request.data.get('titre', 'Visioconférence')
        message = request.data.get('message', '')
        date_debut = request.data.get('date_debut')
        from core.models.utilisateurs import Etudiant
        from django.utils import timezone
        from datetime import timedelta

        etablissement_id = request.data.get('etablissement_id')
        etudiants = Etudiant.objects.all()
        if etablissement_id:
            etudiants = etudiants.filter(etablissement_id=etablissement_id)

        for etudiant in etudiants:
            Notification.objects.create(
                utilisateur=etudiant.utilisateur,
                titre=f"Visioconférence: {titre}",
                message=message or f"Une séance de visioconférence est prévue le {date_debut}",
                url_lien=f"/live/{request.data.get('session_id', '')}"
            )
        return Response({"status": "notifications_created", "count": etudiants.count()})

    @action(detail=False, methods=['post'])
    def notifier_ban(self, request):
        utilisateur_id = request.data.get('utilisateur_id')
        raison = request.data.get('raison', 'Comportement inapproprié')
        duree = request.data.get('duree', 'Indéterminée')
        from core.models.utilisateurs import Utilisateur

        user = get_object_or_404(Utilisateur, id=utilisateur_id) if utilisateur_id else request.user
        Notification.objects.create(
            utilisateur=user,
            titre="Avertissement - Sanction",
            message=f"Vous avez été banni(e) du cours pour: {raison}. Durée: {duree}.",
            url_lien=""
        )
        return Response({"status": "ban_notified"})

    @action(detail=True, methods=['patch'])
    def lire(self, request, pk=None):
        notif = self.get_object()
        notif.est_lue = True
        notif.date_lecture = timezone.now()
        notif.save()
        return Response(NotificationSerializer(notif).data)

    @action(detail=False, methods=['post'])
    def tout_lire(self, request):
        user = request.user
        if user.is_authenticated:
            Notification.objects.filter(utilisateur=user, est_lue=False).update(
                est_lue=True,
                date_lecture=timezone.now()
            )
        return Response({"status": "all_read"})

    @action(detail=False, methods=['get'])
    def compte(self, request):
        user = request.user
        count = 0
        if user.is_authenticated:
            count = Notification.objects.filter(utilisateur=user, est_lue=False).count()
        return Response({"non_lues": count})

    @action(detail=False, methods=['post'])
    def signaler_retard(self, request):
        etudiant_id = request.data.get('etudiant_id')
        message = request.data.get('message', '')
        from core.models.utilisateurs import Etudiant as EtudiantModel

        etudiant = get_object_or_404(EtudiantModel, id=etudiant_id)
        Notification.objects.create(
            utilisateur=etudiant.utilisateur,
            titre="Rappel de cours en attente",
            message=message or f"{request.user.prenom} vous signale que vous avez encore des chapitres à valider. Veuillez les terminer rapidement.",
            url_lien="/cours"
        )
        return Response({"status": "notified", "etudiant": etudiant.utilisateur.prenom})


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
=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
