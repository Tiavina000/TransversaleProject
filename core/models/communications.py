from django.db import models 
from .base import TimeStampedModel
from .utilisateurs  import Utilisateur
from .etablissements import Etablissement 

class Actualite (TimeStampedModel):
    PUBLIC_CHOICES = [
        ('TOUS' , 'Tous'),
        ('ETUDIANTS' , 'Etudiants'),
        ('ENSEIGNANTS' , 'Enseignants'),
        ('ETABLISSEMENT' , 'Etablissements'),
    ]
    
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    date_expiration = models.DateTimeField(null=True , blank=True)
    est_publie  = models.BooleanField(default=True)
    public_ciblie = models.CharField(max_length=20 , choices=PUBLIC_CHOICES , default='TOUS')
    etablissement_cible = models.ForeignKey(Etablissement , on_delete=models.SET_NULL , null=True , blank=True)
    
    class Meta :
        verbose_name = "Actualité"
        verbose_name_plural = "Actualités"
        ordering = ['-date_creation']
        

class Notification(TimeStampedModel):
    utilisateur = models.ForeignKey(Utilisateur  , on_delete=models.CASCADE , related_name='notifications')
    titre = models.CharField(max_length=200)
    message = models.TextField()
    est_lue = models.BooleanField(default=False)
    date_lecture = models.DateTimeField(null=True , blank=True)
    url_lien = models.URLField(blank=True)
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-date_creation']