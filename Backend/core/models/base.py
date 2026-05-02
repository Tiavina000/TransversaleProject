from django.db import models


class TimeStampedModel(models.Model):
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class SoftDeleteModel(models.Model):
    est_actif = models.BooleanField(default=True)
    date_suppression = models.DateTimeField(null=True , blank=True)
    
    class Meta:
        abstract = True