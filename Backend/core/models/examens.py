from django.db import models
from django.core.validators import MinValueValidator , MaxValueValidator 
from .base import TimeStampedModel
from .utilisateurs import Enseignant , Etudiant
from .pedagogie import Matiere , NiveauScolaire 

class Examen (TimeStampedModel):
<<<<<<< HEAD
    TYPE_EXAMEN_CHOICES = [
        ('QCM', 'QCM'),
        ('TEXTE', 'Question/Réponse'),
        ('REDACTION', 'Rédaction'),
        ('MIXTE', 'Mixte'),
    ]
    SESSION_CHOICES = [
        ('CC', 'Contrôle Continue'),
        ('EF', 'Examen Final'),
    ]
=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    titre = models.CharField(max_length=200)
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE , related_name='examens')
    matiere = models.ForeignKey(Matiere , on_delete=models.CASCADE , related_name='examens')
    niveau = models.ForeignKey(NiveauScolaire  , on_delete=models.CASCADE , related_name='examens')
    duree_minutes = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    est_publie = models.BooleanField(default=False)
    coefficient = models.FloatField(default=1.0 , validators=[MinValueValidator(0)])
<<<<<<< HEAD
    type_examen = models.CharField(max_length=20, choices=TYPE_EXAMEN_CHOICES, default='MIXTE')
    lecture_automatique = models.BooleanField(default=False, help_text="Lecture automatique des sujets")
    session = models.CharField(max_length=2, choices=SESSION_CHOICES, default='EF')
=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    
    class Meta : 
        app_label = 'core'
        verbose_name = "Examen"
        verbose_name_plural = "Examens"
        ordering = ['-date_debut']
        
    def __str__(self):
        return self.titre
    
    
class QuestionExamen(models.Model):
    TYPE_CHOICES=[
        ('QCM' , 'Question à choix multiples '),
        ('TEXTE' , 'Réponse texte'),
        ('NUMERIQUE' , 'Réponse numérique'),
        ('VRAI_FAUX' , 'Vrai/Faux'),
<<<<<<< HEAD
        ('REDACTION' , 'Rédaction'),
=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    ]
    
    examen = models.ForeignKey(Examen , on_delete=models.CASCADE , related_name='questions')
    texte = models.TextField()
    type_question = models.CharField(max_length=10,choices=TYPE_CHOICES)
    points = models.FloatField(validators=[MinValueValidator(0)])
    ordre = models.PositiveIntegerField()
    options = models.JSONField(default=list , blank=True)
<<<<<<< HEAD
    reponse_correcte = models.TextField(blank=True, default='')
    mot_min = models.PositiveIntegerField(null=True, blank=True, help_text="Nombre minimum de mots pour les questions de rédaction")
    mot_max = models.PositiveIntegerField(null=True, blank=True, help_text="Nombre maximum de mots pour les questions de rédaction")
    criteres_correction = models.JSONField(default=dict, blank=True, help_text="Critères de correction (orthographe, nb mots, idées)")
    obligatoire = models.BooleanField(default=True, help_text="Question obligatoire")
=======
    reponse_correcte = models.TextField()
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    
    class Meta :
        app_label = 'core'
        verbose_name = "Question Examen"
        verbose_name_plural = "Questions d'examen"
        unique_together = ['examen' , 'ordre']
        ordering = ['ordre']
        
        
class CopieExamen(models.Model):
    examen = models.ForeignKey(Examen , on_delete=models.CASCADE , related_name='copies')
    etudiant = models.ForeignKey(Etudiant , on_delete=models.CASCADE , related_name='copies_examens')
    date_debut = models.DateTimeField(auto_now_add=True)
    date_soumission = models.DateTimeField(null=True , blank=True)
    note_obtenue = models.FloatField(null=True , blank=True , validators=[MinValueValidator(0) , MaxValueValidator(20)])
    est_termine = models.BooleanField(default=False)
<<<<<<< HEAD
    note_validee = models.BooleanField(default=False)
    date_validation = models.DateTimeField(null=True, blank=True)
=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    
    class Meta:
        app_label = 'core'
        verbose_name = "Copie d'examen"
        verbose_name_plural = "Copies d'examen"
        unique_together = ['examen' , 'etudiant']
<<<<<<< HEAD
        ordering = ['-id']
        

class LogSurveillance(models.Model):
=======
        

class LogSurveillace(models.Model):
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    copie = models.ForeignKey(CopieExamen , on_delete=models.CASCADE , related_name='logs')
    evenement = models.CharField(max_length=200)
    details = models.JSONField(default=dict)
    date_evenement = models.DateTimeField(auto_now_add=True)
    
    class Meta : 
        verbose_name = "Log de surveillance "
        verbose_name_plural = "Logs de surveillance "
        ordering = ['-date_evenement']

class ReponseExamen(models.Model):
    copie = models.ForeignKey(CopieExamen, on_delete=models.CASCADE, related_name='reponses')
    question = models.ForeignKey(QuestionExamen, on_delete=models.CASCADE)
    reponse_etudiant = models.TextField()
    est_correct = models.BooleanField(default=False)
    points_obtenus = models.FloatField(default=0)
<<<<<<< HEAD
    nb_mots = models.PositiveIntegerField(null=True, blank=True)
    fautes_orthographe = models.JSONField(default=list, blank=True)
    correction_commentaire = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['copie', 'question']
        ordering = ['-id']
=======
    
    class Meta:
        unique_together = ['copie', 'question']
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))

        