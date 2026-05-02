from django.utils import timezone
from core.models import CopieExamen, Recommandation, Lecon, Chapitre

class ScoringService:
    """
    Moteur de Recommandation - Algorithme de scoring basé sur les performances.
    Analyse les résultats des examens et génère des recommandations personnalisées.
    """

    @staticmethod
    def analyser_et_recommander(etudiant, matiere):
        """
        Analyse les copies d'un étudiant pour une matière donnée.
        Si la moyenne est en dessous du seuil, génère une recommandation.
        """
        # Récupérer les copies terminées pour cette matière
        copies = CopieExamen.objects.filter(
            etudiant=etudiant,
            examen__matiere=matiere,
            est_termine=True,
            note_obtenue__isnull=False
        ).order_by('-date_soumission')[:5]  # Analyser les 5 dernières

        if not copies.exists():
            return None

        # Calcul de la moyenne
        somme_notes = sum(copie.note_obtenue for copie in copies)
        moyenne = somme_notes / len(copies)
        
        # Algorithme de scoring basique : Si la moyenne est inférieure à 10/20
        SEUIL_REUSSITE = 10.0
        
        if moyenne < SEUIL_REUSSITE:
            return ScoringService._generer_recommandation(etudiant, matiere, moyenne)
            
        return None

    @staticmethod
    def _generer_recommandation(etudiant, matiere, moyenne):
        """
        Logique de génération: 
        Recommander la première leçon du premier chapitre de la matière 
        comme point de renforcement.
        """
        # Trouver la leçon fondamentale de cette matière (Chapitre 1, Leçon 1)
        premier_chapitre = Chapitre.objects.filter(matiere=matiere).order_by('order').first()
        if not premier_chapitre:
            return None
            
        premiere_lecon = Lecon.objects.filter(chapitre=premier_chapitre).order_by('order').first()
        if not premiere_lecon:
            return None

        # Calculer le score de pertinence (plus la note est basse, plus c'est pertinent)
        # Score de 0 à 1
        score_pertinence = max(0.1, 1.0 - (moyenne / 20.0))

        explication = (
            f"Votre moyenne récente en {matiere.nom} est de {moyenne:.1f}/20. "
            f"Nous vous suggérons de revoir les bases avec cette leçon fondamentale."
        )

        # Créer ou mettre à jour la recommandation
        reco, created = Recommandation.objects.get_or_create(
            etudiant=etudiant,
            lecon=premiere_lecon,
            defaults={
                'score_pertinence': score_pertinence,
                'explication': explication,
                'est_consultee': False
            }
        )
        
        if not created:
            reco.score_pertinence = score_pertinence
            reco.explication = explication
            reco.est_consultee = False
            reco.save()
            
        return reco
