from modeltranslation.translator import register, TranslationOptions
from .models.pedagogie import NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia
from .models.examens import Examen, QuestionExamen
from .models.boutique import RessourceBoutique
from .models.communications import Actualite, Notification
from .models.etablissements import Etablissement, AdminEtablissement
from .models.visioconference import SessionVisio
from .models.utilisateurs import Enseignant

@register(NiveauScolaire)
class NiveauScolaireTranslationOptions(TranslationOptions):
    fields = ('nom', 'description')

@register(Matiere)
class MatiereTranslationOptions(TranslationOptions):
    fields = ('nom', 'description')

@register(Chapitre)
class ChapitreTranslationOptions(TranslationOptions):
    fields = ('titre', 'description')

@register(Lecon)
class LeconTranslationOptions(TranslationOptions):
    fields = ('titre', 'contenue_texte', 'objectifs')

@register(FichierMultimedia)
class FichierMultimediaTranslationOptions(TranslationOptions):
    fields = ('titre',)

@register(Examen)
class ExamenTranslationOptions(TranslationOptions):
    fields = ('titre',)

@register(QuestionExamen)
class QuestionExamenTranslationOptions(TranslationOptions):
    fields = ('texte', 'reponse_correcte')

@register(RessourceBoutique)
class RessourceBoutiqueTranslationOptions(TranslationOptions):
    fields = ('titre', 'description')

@register(Actualite)
class ActualiteTranslationOptions(TranslationOptions):
    fields = ('titre', 'contenu')

@register(Notification)
class NotificationTranslationOptions(TranslationOptions):
    fields = ('titre', 'message')

@register(Etablissement)
class EtablissementTranslationOptions(TranslationOptions):
    fields = ('nom', 'adresse')

@register(AdminEtablissement)
class AdminEtablissementTranslationOptions(TranslationOptions):
    fields = ('fonction',)

@register(SessionVisio)
class SessionVisioTranslationOptions(TranslationOptions):
    fields = ('titre',)

@register(Enseignant)
class EnseignantTranslationOptions(TranslationOptions):
    fields = ('specialite',)
