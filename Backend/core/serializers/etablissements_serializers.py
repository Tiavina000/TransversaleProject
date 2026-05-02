from rest_framework import serializers
from core.models import Etablissement, AdminEtablissement
from .base_serializers import UtilisateurSerializer


class EtablissementSerializer(serializers.ModelSerializer):
<<<<<<< HEAD
    type_label = serializers.SerializerMethodField()

    class Meta:
        model = Etablissement
        fields = ['id', 'nom', 'adresse', 'telephone', 'email', 'code_etablissement', 'type', 'type_label']
        read_only_fields = ['id', 'type_label']

    def get_type_label(self, obj):
        return obj.get_type_display()
=======
    class Meta:
        model = Etablissement
        fields = ['id', 'nom', 'adresse', 'telephone', 'email', 'code_etablissement']
        read_only_fields = ['id']
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))


class AdminEtablissementSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)
    utilisateur_id = serializers.IntegerField(write_only=True)
    etablissement = EtablissementSerializer(read_only=True)
    etablissement_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AdminEtablissement
        fields = [
            'id', 'utilisateur', 'utilisateur_id', 'etablissement',
            'etablissement_id', 'fonction'
        ]
        read_only_fields = ['id']
