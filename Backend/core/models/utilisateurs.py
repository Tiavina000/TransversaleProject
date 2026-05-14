from django.db import models 
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator

from .base import TimeStampedModel , SoftDeleteModel

class Utilisateur(AbstractUser , TimeStampedModel , SoftDeleteModel):
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    
    LANGUE_CHOICES = [
        ('MG','Malagasy'),
        ('FR','Français'),
        ('EN','Anglais'),
    ]
    langue_preferee = models.CharField(max_length=2 , choices=LANGUE_CHOICES , default='MG')
    options_accessibilite = models.JSONField(default=dict , blank=True)
    photo_profil = models.ImageField(upload_to='profiles/', null=True, blank=True)
    
    TYPE_UTILISATEUR_CHOICES = [
        ('ETUDIANT', 'Étudiant'),
        ('ENSEIGNANT', 'Enseignant'),
        ('ADMINISTRATEUR', 'Administrateur'),
    ]
    type_utilisateur = models.CharField(max_length=25,choices=TYPE_UTILISATEUR_CHOICES , default='ETUDIANT')

    class Meta:
        app_label = 'core'
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-date_creation']
    def __str__(self):
        return f"{self.prenom} {self.username}"

class Etudiant(models.Model):
    utilisateur = models.OneToOneField(Utilisateur , on_delete=models.CASCADE , related_name='etudiant_profile')
    etablissement = models.ForeignKey('core.Etablissement', on_delete=models.CASCADE, related_name='etudiants', null=True)
    numero_etudiant = models.CharField(max_length=20, unique=True, null=True, blank=True)
    niveau = models.ForeignKey('core.NiveauScolaire', on_delete=models.SET_NULL, null=True, blank=True, related_name='etudiants')
    points_global = models.IntegerField(default=0 , validators=[MinValueValidator(0)])
    date_inscription = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Etudiant"
        verbose_name_plural = "Etudiants"
    
    def __str__(self):
        return f"Etudiant: {self.utilisateur.username}"

class Enseignant(models.Model):
    utilisateur = models.OneToOneField(Utilisateur , on_delete=models.CASCADE , related_name='enseignant_profile')
    etablissement = models.ForeignKey('core.Etablissement', on_delete=models.CASCADE, related_name='enseignants', null=True)
    specialite = models.CharField(max_length=100 , blank=True)
    date_embauche = models.DateField()
    
    class Meta:
        verbose_name = "Enseignant"
        verbose_name_plural = "Enseignants"
        
    def __str__(self):
        return f"Enseignant: {self.utilisateur.username}"
    
class AdminPlateforme(models.Model):
    utilisateur = models.OneToOneField(Utilisateur , on_delete=models.CASCADE , related_name='admin_profile')
    niveau_acces = models.CharField(max_length=50 , default='super_admin')
    
    class Meta:
        verbose_name = "Administrateur"
        verbose_name_plural = "Administrateurs"
        
    def __str__(self):
        return f"Administrateur : {self.utilisateur.username}"
    
