import re
from core.models import Lecon, Examen, Matiere, Chapitre

class VoiceCommandProcessor:
    """
    Moteur NLP basique pour l'analyse des commandes vocales.
    Transforme une phrase en texte libre (Speech-to-Text) en une intention et une action concrète.
    """

    # Définition des intentions (Intents) et de leurs mots-clés (Regex/Tokens)
    INTENTS = {
        'OUVRIR_LECON': [r'ouvrir.*leçon', r'lire.*cours', r'aller.*leçon', r'voir.*chapitre'],
        'PASSER_EXAMEN': [r'passer.*examen', r'faire.*test', r'aller.*examen', r'épreuve'],
        'NAVIGATION_GLOBALE': [r'aller.*accueil', r'retour.*menu', r'tableau.*bord', r'mon.*profil'],
        'BOUTIQUE': [r'aller.*boutique', r'acheter', r'voir.*panier', r'ressources']
    }

    @staticmethod
    def process(text):
        """
        Traite le texte brut et retourne une structure d'action JSON-friendly.
        """
        if not text:
            return {"action": "UNKNOWN", "feedback": "Je n'ai pas compris la commande."}

        text_lower = text.lower()
        intent = VoiceCommandProcessor._identify_intent(text_lower)
        
        if intent == 'OUVRIR_LECON':
            return VoiceCommandProcessor._handle_ouvrir_lecon(text_lower)
        elif intent == 'PASSER_EXAMEN':
            return VoiceCommandProcessor._handle_passer_examen(text_lower)
        elif intent == 'NAVIGATION_GLOBALE':
            if 'profil' in text_lower:
                return {"action": "NAVIGATE", "target": "/profil", "feedback": "Ouverture de votre profil."}
            return {"action": "NAVIGATE", "target": "/dashboard", "feedback": "Retour au tableau de bord."}
        elif intent == 'BOUTIQUE':
            return {"action": "NAVIGATE", "target": "/boutique", "feedback": "Ouverture de la boutique."}
            
        return {"action": "UNKNOWN", "feedback": "Commande non reconnue. Essayez 'Ouvrir la leçon de maths'."}

    @staticmethod
    def _identify_intent(text):
        """Identifie l'intention principale de la phrase via expressions régulières."""
        for intent_name, patterns in VoiceCommandProcessor.INTENTS.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    return intent_name
        return 'UNKNOWN'

    @staticmethod
    def _handle_ouvrir_lecon(text):
        """Logique spécifique pour trouver la bonne leçon à partir du texte."""
        # 1. Extraction d'entités (chercher des mots clés dans la base de données)
        # Idéalement, on utiliserait le Trie_service ici, ou une recherche Full-Text.
        # Pour cet exemple robuste, on fait une recherche basique sur les titres.
        lecons = Lecon.objects.all()
        for lecon in lecons:
            # Si le mot clé (ex: "maths" pour "Mathématiques") est dans la phrase
            # On normalise un peu (miniscules)
            if lecon.titre.lower() in text or any(word in text for word in lecon.titre.lower().split() if len(word) > 3):
                return {
                    "action": "NAVIGATE_LECON", 
                    "target_id": lecon.id, 
                    "target_url": f"/lecons/{lecon.id}",
                    "feedback": f"Ouverture de la leçon : {lecon.titre}"
                }
        
        # Si on n'a pas trouvé de leçon spécifique, on renvoie vers la liste
        return {
            "action": "NAVIGATE", 
            "target": "/lecons", 
            "feedback": "Ouverture de la liste des leçons. Quelle leçon cherchez-vous exactement ?"
        }

    @staticmethod
    def _handle_passer_examen(text):
        """Logique spécifique pour lancer un examen."""
        examens = Examen.objects.filter(est_publie=True)
        for examen in examens:
            if examen.titre.lower() in text or examen.matiere.nom.lower() in text:
                return {
                    "action": "START_EXAM", 
                    "target_id": examen.id, 
                    "target_url": f"/examens/{examen.id}/passer",
                    "feedback": f"Préparation de l'examen : {examen.titre}"
                }
                
        return {
            "action": "NAVIGATE", 
            "target": "/examens", 
            "feedback": "Ouverture de la liste des examens disponibles."
        }
