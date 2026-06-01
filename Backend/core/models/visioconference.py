from django.db import models
from .base import TimeStampedModel
from .utilisateurs import Enseignant , Etudiant
from .pedagogie import Lecon

class SessionVisio(TimeStampedModel):
    titre = models.CharField(max_length=200)
    enseignant = models.ForeignKey(Enseignant , on_delete=models.CASCADE , related_name='sessions_visio')
    lecon = models.ForeignKey(Lecon , on_delete=models.CASCADE , related_name='sessions_visio', null=True, blank=True)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    url_visio = models.URLField(blank=True, default='')
    est_active = models.BooleanField(default=False)
    
    class Meta :
        verbose_name ="Session de visioconférence"
        verbose_name_plural = "Sessions de visioconférence"
        ordering = ['-date_debut']
        
    def __str__(self):
        return f"{self.titre} - {self.date_debut}"
    
class ParticipationVisio(models.Model):
    etudiant = models.ForeignKey(Etudiant , on_delete=models.CASCADE )
    session = models.ForeignKey(SessionVisio , on_delete=models.CASCADE)
    date_joindre = models.DateTimeField(auto_now_add=True)
    date_quitter = models.DateTimeField(null=True , blank=True)
    duree_participation = models.PositiveIntegerField(default=0)
    evenements_inactive = models.JSONField(default=list)
    
    class Meta : 
        verbose_name = "Participation visioconférence"
        verbose_name_plural = "Participations visioconférence"
        unique_together = ['etudiant' , 'session']
        ordering = ['-id']

class QuestionVisio(models.Model):
    session = models.ForeignKey(SessionVisio, on_delete=models.CASCADE, related_name='questions')
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)
    est_answered = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Question visioconférence"
        verbose_name_plural = "Questions visioconférence"
        ordering = ['date_creation']
