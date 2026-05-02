from rest_framework import serializers
from core.models import (
<<<<<<< HEAD
    Examen, QuestionExamen, CopieExamen, ReponseExamen, LogSurveillance,
    NiveauScolaire
=======
    Examen, QuestionExamen, CopieExamen, ReponseExamen, LogSurveillace
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
)


class QuestionExamenSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionExamen
        fields = [
            'id', 'examen', 'texte', 'type_question', 'points',
<<<<<<< HEAD
            'ordre', 'options', 'reponse_correcte',
            'mot_min', 'mot_max', 'criteres_correction', 'obligatoire'
        ]
        read_only_fields = ['id', 'examen']
=======
            'ordre', 'options', 'reponse_correcte'
        ]
        read_only_fields = ['id']
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))


class ExamenSerializer(serializers.ModelSerializer):
    questions = QuestionExamenSerializer(many=True, read_only=True)
<<<<<<< HEAD
    niveau = serializers.PrimaryKeyRelatedField(
        queryset=NiveauScolaire.objects.all(), required=False, allow_null=True
    )
    date_debut = serializers.DateTimeField(required=False, allow_null=True)
    date_fin = serializers.DateTimeField(required=False, allow_null=True)
    soumis = serializers.SerializerMethodField()
=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))

    class Meta:
        model = Examen
        fields = [
            'id', 'titre', 'enseignant', 'matiere', 'niveau',
            'duree_minutes', 'date_debut', 'date_fin', 'est_publie',
<<<<<<< HEAD
            'coefficient', 'type_examen', 'lecture_automatique',
            'session',
            'questions', 'date_creation', 'date_modification', 'soumis'
        ]
        read_only_fields = ['id', 'enseignant', 'date_creation', 'date_modification']

    def get_soumis(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.type_utilisateur == 'ETUDIANT' and hasattr(request.user, 'etudiant_profile'):
            from core.models import CopieExamen
            return CopieExamen.objects.filter(examen=obj, etudiant=request.user.etudiant_profile, est_termine=True).exists()
        return False
=======
            'coefficient', 'questions', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))


class LogSurveillanceSerializer(serializers.ModelSerializer):
    class Meta:
<<<<<<< HEAD
        model = LogSurveillance
=======
        model = LogSurveillace
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
        fields = ['id', 'copie', 'evenement', 'details', 'date_evenement']
        read_only_fields = ['id', 'date_evenement']


class ReponseExamenSerializer(serializers.ModelSerializer):
<<<<<<< HEAD
    question_texte = serializers.ReadOnlyField(source='question.texte')
    question_type = serializers.ReadOnlyField(source='question.type_question')
    question_points = serializers.FloatField(source='question.points', read_only=True)
    question_options = serializers.JSONField(source='question.options', read_only=True)
    question_reponse_correcte = serializers.ReadOnlyField(source='question.reponse_correcte')

=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    class Meta:
        model = ReponseExamen
        fields = [
            'id', 'copie', 'question', 'reponse_etudiant',
<<<<<<< HEAD
            'est_correct', 'points_obtenus',
            'nb_mots', 'fautes_orthographe', 'correction_commentaire',
            'question_texte', 'question_type', 'question_points',
            'question_options', 'question_reponse_correcte',
        ]
        read_only_fields = ['id', 'copie', 'question']
=======
            'est_correct', 'points_obtenus'
        ]
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
        read_only_fields = ['id']


class CopieExamenSerializer(serializers.ModelSerializer):
    reponses = ReponseExamenSerializer(many=True, read_only=True)
    logs = LogSurveillanceSerializer(many=True, read_only=True)

    class Meta:
        model = CopieExamen
        fields = [
            'id', 'examen', 'etudiant', 'date_debut', 'date_soumission',
            'note_obtenue', 'est_termine', 'reponses', 'logs'
        ]
        read_only_fields = ['id', 'date_debut']
<<<<<<< HEAD


class CopieCorrectionSerializer(serializers.ModelSerializer):
    statut = serializers.SerializerMethodField()
    note = serializers.FloatField(source='note_obtenue', read_only=True)
    eleve = serializers.SerializerMethodField()
    nom_eleve = serializers.SerializerMethodField()
    matiere = serializers.SerializerMethodField()
    matiere_nom = serializers.SerializerMethodField()
    contenu = serializers.SerializerMethodField()
    texte = serializers.SerializerMethodField()

    class Meta:
        model = CopieExamen
        fields = [
            'id', 'statut', 'note', 'note_obtenue', 'est_termine',
            'note_validee', 'date_validation',
            'date_debut', 'date_soumission', 'eleve', 'nom_eleve',
            'matiere', 'matiere_nom', 'contenu', 'texte',
        ]

    def get_statut(self, obj):
        if obj.note_validee:
            return 'valide'
        if obj.note_obtenue is not None:
            return 'corrige'
        return 'soumis'

    def get_eleve(self, obj):
        etu = obj.etudiant
        if not etu:
            return None
        return {
            'id': etu.id,
            'nom': etu.utilisateur.prenom or etu.utilisateur.username,
            'username': etu.utilisateur.username,
            'numero_etudiant': etu.numero_etudiant,
        }

    def get_nom_eleve(self, obj):
        etu = obj.etudiant
        if not etu:
            return ''
        return etu.utilisateur.prenom or etu.utilisateur.username

    def get_matiere(self, obj):
        m = obj.examen.matiere if obj.examen else None
        if not m:
            return None
        return {'id': m.id, 'nom': m.nom}

    def get_matiere_nom(self, obj):
        m = obj.examen.matiere if obj.examen else None
        return m.nom if m else ''

    def get_contenu(self, obj):
        rep = obj.reponses.first()
        return rep.reponse_etudiant if rep else ''

    def get_texte(self, obj):
        rep = obj.reponses.first()
        return rep.reponse_etudiant if rep else ''
=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
