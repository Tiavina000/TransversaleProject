from rest_framework import serializers
from core.models import RessourceBoutique, Panier, PanierItem, Commande


class RessourceBoutiqueSerializer(serializers.ModelSerializer):
<<<<<<< HEAD
    title = serializers.ReadOnlyField(source='titre')
    desc = serializers.ReadOnlyField(source='description')
    type = serializers.ReadOnlyField(source='type_contenu')
    points = serializers.ReadOnlyField(source='prix')
    isPurchased = serializers.SerializerMethodField()

    class Meta:
        model = RessourceBoutique
        fields = [
            'id', 'titre', 'title', 'description', 'desc', 'prix', 'points', 'type_contenu', 'type',
            'fichier', 'niveau', 'matiere', 'est_disponible', 'stock',
            'date_creation', 'date_modification', 'isPurchased'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']

    def get_isPurchased(self, obj):
        return False

=======
    class Meta:
        model = RessourceBoutique
        fields = [
            'id', 'titre', 'description', 'prix', 'type_contenu',
            'fichier', 'niveau', 'matiere', 'est_disponible', 'stock',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']

>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))

class PanierItemSerializer(serializers.ModelSerializer):
    ressources = RessourceBoutiqueSerializer(read_only=True)
    ressources_id = serializers.IntegerField(write_only=True, source='ressources')

    class Meta:
        model = PanierItem
        fields = ['id', 'panier', 'ressources', 'ressources_id', 'quantite', 'date_ajout']
        read_only_fields = ['id', 'date_ajout']


class PanierSerializer(serializers.ModelSerializer):
    items = PanierItemSerializer(many=True, read_only=True)

    class Meta:
        model = Panier
        fields = ['id', 'etudiant', 'items', 'date_derniere_modif']
        read_only_fields = ['id', 'date_derniere_modif']


class CommandeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commande
        fields = [
            'id', 'etudiant', 'montant_total', 'statut_paiement',
            'reference_paiement', 'date_paiement', 'date_creation',
            'date_modification'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']
