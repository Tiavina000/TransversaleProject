from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _ 


class Etablissement(models.Model):
    TYPE_CHOICES = [
        ('LYCEE', 'Lycée'),
        ('CEG', 'CEG'),
        ('EPP', 'EPP'),
        ('AUTRE', 'Autre'),
    ]
    nom = models.CharField(max_length=255)
    adresse = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20 , validators=[RegexValidator(regex=r'^\+?[0-9]{8,15}$' )])
    email = models.EmailField()
    code_etablissement = models.CharField(max_length=20 , unique=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='AUTRE')
    
    class Meta:
        app_label = 'core'
        verbose_name = "Etablissement"
        verbose_name_plural = "Etablissements"
        ordering = ['type', 'nom']
    
    def __str__(self):
        return f"[{self.get_type_display()}] {self.nom}" 
    
class AdminEtablissement(models.Model):
    utilisateur = models.OneToOneField('core.Utilisateur' , on_delete=models.CASCADE)
    etablissement =models.ForeignKey(Etablissement , on_delete=models.CASCADE , related_name='admins')
    fonction = models.CharField(max_length=100)
    
    class Meta:
        app_label = 'core'
        verbose_name = "Administrateur  d'Etablissement"
        verbose_name_plural = "Adminstrateurs d' Etablissement "
        ordering = ['-id']
    
    def __str__(self):
        return f"{self.utilisateur.username} - {self.etablissement.nom}"


class Classe(models.Model):
    nom = models.CharField(max_length=100)
    niveau = models.ForeignKey('core.NiveauScolaire', on_delete=models.CASCADE, related_name='classes')
    etablissement = models.ForeignKey(Etablissement, on_delete=models.CASCADE, related_name='classes')

    class Meta:
        app_label = 'core'
        verbose_name = "Classe"
        verbose_name_plural = "Classes"
        unique_together = ['nom', 'etablissement']
        ordering = ['niveau__ordre', 'nom']

    def __str__(self):
        return f"{self.nom} - {self.etablissement.nom}"