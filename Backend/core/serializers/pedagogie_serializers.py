from rest_framework import serializers
from core.models import (
    NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia, SessionEtude
)


class SessionEtudeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionEtude
        fields = '__all__'


class NiveauScolaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = NiveauScolaire
        fields = ['id', 'nom', 'ordre', 'description']
        read_only_fields = ['id']


class MatiereSerializer(serializers.ModelSerializer):
    niveaux = NiveauScolaireSerializer(many=True, read_only=True)
    niveaux_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, 
        queryset=NiveauScolaire.objects.all(),
        source='niveaux'
    )

    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'code', 'description', 'niveaux', 'niveaux_ids', 'ordre']
        read_only_fields = ['id']


class FichierMultimediaSerializer(serializers.ModelSerializer):
    nom = serializers.ReadOnlyField(source='titre')
    taille = serializers.SerializerMethodField()
    type = serializers.ReadOnlyField(source='format')
    isDownloadable = serializers.ReadOnlyField(source='est_telechargeable')
    url = serializers.ReadOnlyField(source='url_fichier')

    class Meta:
        model = FichierMultimedia
        fields = [
            'id', 'type_fichier', 'titre', 'url_fichier', 'taille_no',
            'lecon', 'format', 'metadata', 'nom', 'taille', 'type', 'isDownloadable', 'url'
        ]
        read_only_fields = ['id']

    def get_taille(self, obj):
        return f"{obj.taille_no} MB"


class LeconSerializer(serializers.ModelSerializer):
    fichiers = FichierMultimediaSerializer(many=True, read_only=True)
    matiere = serializers.ReadOnlyField(source='chapitre.matiere.nom')
    niveau = serializers.ReadOnlyField(source='chapitre.niveau.nom')
    content_html = serializers.ReadOnlyField(source='contenue_texte')
    description = serializers.ReadOnlyField(source='objectifs')
    enseignant = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = Lecon
        fields = [
            'id', 'titre', 'order', 'chapitre', 'matiere', 'niveau',
            'description', 'enseignant', 'video_url',
            'contenue_texte', 'content_html', 'duree_estimee', 'objectifs', 'fichiers'
        ]
        read_only_fields = ['id']

    def get_enseignant(self, obj):
        # Mock teacher for demo
        return {
            'nom': 'Prof. Rakoto',
            'photo': None,
            'specialite': obj.chapitre.matiere.nom
        }

    def get_video_url(self, obj):
        video = obj.fichiers.filter(type_fichier='VIDEO').first()
        return video.url_fichier if video else None


class ChapitreSerializer(serializers.ModelSerializer):
    lecons = LeconSerializer(many=True, read_only=True)

    class Meta:
        model = Chapitre
        fields = [
            'id', 'titre', 'order', 'matiere', 'niveau',
            'description', 'lecons'
        ]
        read_only_fields = ['id']


class ChapitreDetailSerializer(serializers.ModelSerializer):
    """Serializer complet avec les leçons imbriquées"""
    matiere = MatiereSerializer(read_only=True)
    niveau = NiveauScolaireSerializer(read_only=True)
    lecons = LeconSerializer(many=True, read_only=True)

    class Meta:
        model = Chapitre
        fields = [
            'id', 'titre', 'order', 'matiere', 'niveau',
            'description', 'lecons'
        ]
