from django.db import models 
from django.core.validators import RegexValidator 


class Etablissement(models.Model):
    nom = models.CharField(max_length=255)
    adresse = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20 , validators=[RegexValidator(regex=r'^\+?[0-9]{8,15}$' )])
    email = models.EmailField()
    code_etablissement = models.CharField(max_length=20 , unique=True)
    
    class Meta:
        app_label = 'core'
        verbose_name = "Etablissement"
        verbose_name_plural = "Etablissements"
        ordering = ['-id']
    
    def __str__(self):
        return self.nom 
    
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