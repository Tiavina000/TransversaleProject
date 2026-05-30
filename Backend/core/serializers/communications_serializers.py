from rest_framework import serializers
from core.models import Actualite, Notification, Partenaire, Renovation


class ActualiteSerializer(serializers.ModelSerializer):
    # Champs d'alias pour compatibilité frontend existant
    title = serializers.ReadOnlyField(source='titre')
    date = serializers.DateTimeField(source='date_creation', read_only=True)
    content = serializers.ReadOnlyField(source='contenu')
    category = serializers.ReadOnlyField(source='categorie')
    important = serializers.ReadOnlyField(source='est_important')

    # URL absolue de l'image si uploadée
    image_url = serializers.SerializerMethodField()
    auteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = Actualite
        fields = [
            'id', 'titre', 'title', 'contenu', 'content',
            'categorie', 'category', 'est_important', 'important',
            'image', 'image_url', 'video_url', 'lien_externe', 'lien_label',
            'auteur', 'auteur_nom',
            'date_expiration', 'est_publie', 'public_ciblie',
            'etablissement_cible', 'date_creation', 'date', 'date_modification',
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification', 'auteur']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_auteur_nom(self, obj):
        if obj.auteur:
            return obj.auteur.get_full_name() or obj.auteur.username
        return None

    def create(self, validated_data):
        # Attache automatiquement l'utilisateur connecté comme auteur
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['auteur'] = request.user
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    # Alias pour compatibilité frontend
    title = serializers.ReadOnlyField(source='titre')
    read = serializers.ReadOnlyField(source='est_lue')
    created_at = serializers.DateTimeField(source='date_creation', read_only=True)
    type = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'utilisateur', 'titre', 'title', 'message',
            'est_lue', 'read', 'date_lecture', 'url_lien',
            'date_creation', 'created_at', 'type'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']

    def get_type(self, obj):
        titre = obj.titre.lower()
        if 'examen' in titre or 'évaluation' in titre or 'devoir' in titre:
            return 'exam'
        if 'direct' in titre or 'visio' in titre or 'live' in titre or 'cours en' in titre:
            return 'live'
        if 'annulation' in titre or 'report' in titre or 'annul' in titre:
            return 'cancel'
        if 'rappel' in titre or 'rappel' in titre or 'n\'oublie' in titre:
            return 'reminder'
        if 'note' in titre or 'résultat' in titre or 'correction' in titre:
            return 'grade'
        if 'nouveau' in titre or 'disponible' in titre or 'ajout' in titre:
            return 'news'
        return 'info'


class PartenaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partenaire
        fields = '__all__'


class RenovationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Renovation
        fields = '__all__'
