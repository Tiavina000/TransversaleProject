<<<<<<< HEAD
from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models.pedagogie import NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia
from .models.examens import Examen, QuestionExamen
from .models.boutique import RessourceBoutique
from .models.communications import Actualite, Notification
from .models.etablissements import Etablissement, AdminEtablissement
from .models.visioconference import SessionVisio
from .models.utilisateurs import Enseignant

@admin.register(NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia, 
                Examen, QuestionExamen, RessourceBoutique, Actualite, Notification,
                Etablissement, AdminEtablissement, SessionVisio, Enseignant)
class TranslatedModelAdmin(TranslationAdmin):
    pass
=======
# Register your models here.

# Register your models here.
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
