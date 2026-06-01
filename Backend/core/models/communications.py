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

    CATEGORY_CHOICES = [
        ('Examens', 'Examens'),
        ('Cours', 'Cours'),
        ('Événements', 'Événements'),
        ('Annonces', 'Annonces'),
        ('Sport', 'Sport'),
        ('Culture', 'Culture'),
    ]
    
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    categorie = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='Annonces')
    est_important = models.BooleanField(default=False)
    image = models.ImageField(upload_to='actualites/', null=True, blank=True)
    video_url = models.URLField(null=True, blank=True, help_text="Lien YouTube ou autre vidéo externe")
    lien_externe = models.URLField(null=True, blank=True, help_text="Lien vers une page externe")
    lien_label = models.CharField(max_length=100, blank=True, help_text="Texte du lien externe")
    auteur = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, blank=True, related_name='actualites_publiees')
    date_expiration = models.DateTimeField(null=True , blank=True)
    est_publie  = models.BooleanField(default=True)
    public_ciblie = models.CharField(max_length=20 , choices=PUBLIC_CHOICES , default='TOUS')
    etablissement_cible = models.ForeignKey(Etablissement , on_delete=models.SET_NULL , null=True , blank=True, related_name='actualites')
    
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

class Partenaire(models.Model):
    nom = models.CharField(max_length=100)
    logo = models.CharField(max_length=255) # Chemin ou URL
    url = models.URLField(blank=True)
    ordre = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Partenaire"
        verbose_name_plural = "Partenaires"
        ordering = ['ordre', 'nom']

    def __str__(self):
        return self.nom

class Renovation(models.Model):
    annee = models.CharField(max_length=4)
    titre = models.CharField(max_length=200)
    description = models.TextField()
    ordre = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Rénovation"
        verbose_name_plural = "Rénovations"
        ordering = ['-annee', 'ordre']

    def __str__(self):
        return f"{self.annee} - {self.titre}"
