from django.db import models
from django.core.validators import MinValueValidator


class NiveauScolaire(models.Model):
    NIVEAU_CHOICES = [
        ('Maternelle', 'Maternelle'),
        ('CP', 'CP'), ('CE1', 'CE1'), ('CE2', 'CE2'),
        ('CM1', 'CM1'), ('CM2', 'CM2'),
        ('6ème', '6ème'), ('5ème', '5ème'), ('4ème', '4ème'), ('3ème', '3ème'),
        ('2nde', '2nde'), ('1ère', '1ère'), ('Terminale', 'Terminale')
    ]
    
    nom = models.CharField(max_length=20 , choices=NIVEAU_CHOICES , unique=True)
    ordre = models.IntegerField(unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        app_label = 'core'
        verbose_name = "Niveau Scolaire"
        verbose_name_plural = "Niveaux Scolaires"
        ordering = ['ordre']
        
    def __str__(self):
        return self.nom
    
    
class Matiere(models.Model):
    """Matière scolaire"""
    nom = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    niveaux = models.ManyToManyField(NiveauScolaire, related_name='matieres')
    ordre = models.IntegerField(default=0)
    
    class Meta:
        app_label = 'core'
        verbose_name = "Matière"
        verbose_name_plural = "Matières"
        ordering = ['ordre', 'nom']
    
    def __str__(self):
        return self.nom
    

class Chapitre(models.Model):
    titre = models.CharField(max_length=200)
    order = models.PositiveIntegerField()
    matiere = models.ForeignKey(Matiere , on_delete=models.CASCADE , related_name='chapitres')
    niveau = models.ForeignKey(NiveauScolaire , on_delete=models.CASCADE , related_name='chapitres')
    description = models.TextField(blank=True)
    
    class Meta:
        app_label = 'core'
        verbose_name = "Chapitre"
        verbose_name_plural = "Chapitres"
        unique_together = ['matiere', 'niveau' , 'order']
        ordering = ['order']
        
    def __str__(self):
        return f"{self.matiere} - {self.titre}"

class Lecon(models.Model):
    titre = models.CharField(max_length=200)
    order = models.PositiveIntegerField()
    chapitre = models.ForeignKey(Chapitre , on_delete=models.CASCADE , related_name='lecons')
    contenue_texte = models.TextField(blank=True)
    duree_estimee = models.PositiveIntegerField(help_text="Durée estimée en minutes")
    objectifs  = models.TextField(blank=True)
    
    class Meta:
        app_label = 'core'
        verbose_name = "Leçon"
        verbose_name_plural = "Leçons"
        unique_together = ['chapitre' , 'order']
        ordering = ['order']
        
    def __str__(self):
        return self.titre
    

class FichierMultimedia(models.Model):
    TYPE_CHOICES = [
        ('VIDEO', 'Vidéo'),
        ('AUDIO', 'Audio'),
        ('PDF', 'Document PDF'),
    ]
    type_fichier = models.CharField(max_length=20 , choices=TYPE_CHOICES)
    titre = models.CharField(max_length=200)
    url_fichier = models.URLField()
    taille_no = models.FloatField(validators=[MinValueValidator(0)])
    lecon = models.ForeignKey(Lecon , on_delete=models.CASCADE , related_name='fichiers')
    format = models.CharField(max_length=10)
    metadata = models.JSONField(default=dict , blank=True)
    
    class Meta :
        verbose_name = "Fichier Multimédia"
        verbose_name_plural = "Fichiers Multimédia"
        