from django.db import models
from django.core.validators import MinValueValidator
from .base import TimeStampedModel
from .utilisateurs import Etudiant 
from .pedagogie import FichierMultimedia , NiveauScolaire , Matiere 

class RessourceBoutique(TimeStampedModel):
    TYPE_CHOICES = [
        ('LIVRE' , 'Livre numérique'),
        ('EXERCICES' , 'Exercices'),
        ('COURS' , 'Cours premium'),
        ('VIDEO' , 'Vidéo'),
    ]
    
    titre = models.CharField(max_length=200)
    description = models.TextField()
    prix = models.DecimalField(max_digits=10 , decimal_places=2 , validators=[MinValueValidator(0)])
    type_contenu = models.CharField(max_length=10 , choices=TYPE_CHOICES)
    fichier = models.ForeignKey(FichierMultimedia  , on_delete=models.SET_NULL , null=True)
    niveau = models.ForeignKey(NiveauScolaire , on_delete=models.SET_NULL , null=True)
    matiere = models.ForeignKey(Matiere , on_delete=models.SET_NULL , null=True)
    est_disponible = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = "Ressource boutique"
        verbose_name_plural = "Ressources boutique"
        ordering = ['-id']
        
        
class Panier(models.Model):
    """Panier d'achat pour un étudiant"""
    etudiant = models.OneToOneField(Etudiant, on_delete=models.CASCADE, related_name='panier')
    date_derniere_modif = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Panier"
        verbose_name_plural = "Paniers"
        ordering = ['-id']
    
    
class PanierItem(models.Model):
    panier = models.ForeignKey(Panier , on_delete=models.CASCADE , related_name='items')
    ressources = models.ForeignKey(RessourceBoutique , on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField(default=1 , validators=[MinValueValidator(1)])
    date_ajout = models.DateTimeField(auto_now_add=True)
    
    class Meta :
        verbose_name = "Element du panier "
        verbose_name_plural = "Elements du panier "
        unique_together = ['panier' , 'ressources']
        ordering = ['-id']
        

class Commande(TimeStampedModel):
    STATUT_CHOICES = [
        ('EN_ATTENTE' , 'En attente'),
        ('PAYEE' , 'Payée'),
        ('LIVREE' , 'Livrée'),
        ('ANNULEE' , 'Annulée'),
    ]
    
    etudiant = models.ForeignKey(Etudiant , on_delete=models.CASCADE , related_name='commandes')
    montant_total = models.DecimalField(max_digits=10 , decimal_places=2)
    statut_paiement = models.CharField(max_length=20 , choices=STATUT_CHOICES , default='EN_ATTENTE')
    reference_paiement = models.CharField(max_length=100 , unique=True , blank=True)
    date_paiement = models.DateTimeField(null=True , blank=True)
    
    class Meta :
        verbose_name = "Commande"
        verbose_name_plural = "Commandes"
        ordering = ['-date_creation']