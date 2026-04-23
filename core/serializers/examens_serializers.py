from rest_framework import serializers
from core.models import (
    Examen, QuestionExamen, CopieExamen, ReponseExamen, LogSurveillace
)


class QuestionExamenSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionExamen
        fields = [
            'id', 'examen', 'texte', 'type_question', 'points',
            'ordre', 'options', 'reponse_correcte'
        ]
        read_only_fields = ['id']


class ExamenSerializer(serializers.ModelSerializer):
    questions = QuestionExamenSerializer(many=True, read_only=True)

    class Meta:
        model = Examen
        fields = [
            'id', 'titre', 'enseignant', 'matiere', 'niveau',
            'duree_minutes', 'date_debut', 'date_fin', 'est_publie',
            'coefficient', 'questions', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']


class LogSurveillanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogSurveillace
        fields = ['id', 'copie', 'evenement', 'details', 'date_evenement']
        read_only_fields = ['id', 'date_evenement']


class ReponseExamenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReponseExamen
        fields = [
            'id', 'copie', 'question', 'reponse_etudiant',
            'est_correct', 'points_obtenus'
        ]
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
