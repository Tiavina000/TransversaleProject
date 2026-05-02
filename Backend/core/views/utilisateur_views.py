from rest_framework import views
from .models import utilisateur
from .serializers.utilisateur_serializers import UtilisateurSerializer, EtudiantSerializer, Enseignant

class UtilisateurViewSet(Viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializzer_class = UtilisateurSerializer