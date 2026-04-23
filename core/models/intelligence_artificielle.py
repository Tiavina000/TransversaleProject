from django.db import models
from django.core.validators import MinValueValidator , MaxValueValidator
from .base import TimeStampedModel
from .utilisateurs import Etudiant
from .pedagogie import Lecon

class RequestIA(TimeStampedModel):
    TYPE_CHOICES = [
        ('NAVIGATION' , 'Navigation'),
        ('RECOMMANDATION' , 'Recommandation'),
        ('AIDE' , 'Aide'),
    ]
    
    etudiant = models.ForeignKey(Etudiant , on_delete=models.CASCADE , related_name='requetes_ia')
    request = models.TextField()
    reponse = models.TextField()
    type_requete = models.CharField(max_length=20 , choices=TYPE_CHOICES)
    
    class Meta :
        verbose_name = "Requete IA"
        verbose_name_plural = "Requetes IA "
        ordering = ['-date_creation']
        

class Recommandation (TimeStampedModel):
    etudiant =  models.ForeignKey(Etudiant  , on_delete=models.CASCADE , related_name='recommandations')
    lecon = models.ForeignKey(Lecon , on_delete=models.CASCADE , related_name = 'recommandation')
    score_pertinence = models.FloatField(validators=[MinValueValidator(0) , MaxValueValidator(1)])
    explication = models.TextField()
    est_consultee = models.BooleanField(default=False)
    
    class Meta : 
        verbose_name = "Recommandation"
        verbose_name_plural = "Recommandations"
        ordering = ['-score_pertinence' , '-date_creation']
        