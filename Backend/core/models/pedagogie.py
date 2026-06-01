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
    createur = models.ForeignKey('core.Enseignant', on_delete=models.SET_NULL, null=True, blank=True, related_name='chapitres_crees')
    
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
    contenue_texte = models.TextField(blank=True, help_text="Contenu en HTML (rich text)")
    video_url = models.URLField(blank=True, help_text="URL vidéo externe (YouTube, Vimeo, etc.)")
    duree_estimee = models.PositiveIntegerField(help_text="Durée estimée en minutes")
    objectifs  = models.TextField(blank=True)
    est_publie = models.BooleanField(default=False, help_text="La leçon est visible par les étudiants")
    createur = models.ForeignKey('core.Enseignant', on_delete=models.SET_NULL, null=True, blank=True, related_name='lecons_crees')
    
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
    est_telechargeable = models.BooleanField(default=True, help_text="Si faux, le fichier est uniquement lisible sur la plateforme.")
    metadata = models.JSONField(default=dict , blank=True)
    
    class Meta :
        verbose_name = "Fichier Multimédia"
        verbose_name_plural = "Fichiers Multimédia"
        ordering = ['-id']

class ProgressionChapitre(models.Model):
    etudiant = models.ForeignKey('core.Etudiant', on_delete=models.CASCADE, related_name='progressions')
    chapitre = models.ForeignKey(Chapitre, on_delete=models.CASCADE, related_name='progressions')
    temps_passe_secondes = models.PositiveIntegerField(default=0)
    est_valide = models.BooleanField(default=False)
    date_derniere_session = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'core'
        unique_together = ['etudiant', 'chapitre']
        verbose_name = "Progression Chapitre"
        verbose_name_plural = "Progressions Chapitres"
        ordering = ['-id']


class SessionEtude(models.Model):
    STATUS_CHOICES = [
        ('EN_COURS', 'En cours'),
        ('PAUSE', 'En pause'),
        ('TERMINE', 'Terminé'),
        ('ABANDONNE', 'Abandonné'),
    ]
    etudiant = models.ForeignKey('core.Etudiant', on_delete=models.CASCADE, related_name='sessions_etude')
    chapitre = models.ForeignKey(Chapitre, on_delete=models.CASCADE, related_name='sessions_etude')
    date_debut = models.DateTimeField(auto_now_add=True)
    date_fin = models.DateTimeField(null=True, blank=True)
    derniere_activite = models.DateTimeField(auto_now=True)
    temps_cumule_secondes = models.PositiveIntegerField(default=0)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='EN_COURS')

    class Meta:
        app_label = 'core'
        verbose_name = "Session d'Étude"
        verbose_name_plural = "Sessions d'Étude"
        ordering = ['-derniere_activite']

    def __str__(self):
        return f"Session {self.etudiant} - {self.chapitre} ({self.statut})"
