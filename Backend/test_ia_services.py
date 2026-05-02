import os
import django
import json

# Configuration de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ENENI.settings')
django.setup()

from core.models import NiveauScolaire, Matiere, Chapitre, Lecon, Utilisateur, Etudiant, CopieExamen
from core.services import NavigationTrie, ScoringService, CurriculumGraph
from django.utils import timezone

def run_tests():
    print("\n" + "="*50)
    print("🚀 TESTS DES SERVICES D'INTELLIGENCE ARTIFICIELLE")
    print("="*50)

    # ---------------------------------------------------------
    # 1. Test de l'Assistant de Navigation (Trie)
    # ---------------------------------------------------------
    print("\n🔍 1. Test de l'Assistant de Navigation (Algorithme Trie)")
    print("-" * 40)
    try:
        trie = NavigationTrie()
        trie.initialize_from_db()
        # Test de recherche
        mot_cle = "Math"
        resultats = trie.search_prefix(mot_cle)
        print(f"Recherche pour '{mot_cle}' : {len(resultats)} résultats trouvés.")
        if resultats:
            for r in resultats[:3]: # Afficher max 3
                print(f"   -> Type: {r['type'].upper()} | Nom: {r.get('nom', r.get('titre'))}")
        else:
            print("   -> (Vérifiez si des matières ou leçons contenant 'Math' existent dans la base)")
    except Exception as e:
        print(f"❌ Erreur Trie : {e}")

    # ---------------------------------------------------------
    # 2. Test du Calcul de Trajectoire (Graphes)
    # ---------------------------------------------------------
    print("\n🗺️  2. Test du Calcul de Trajectoire (Graphes)")
    print("-" * 40)
    try:
        # Prendre la première matière existante
        matiere = Matiere.objects.first()
        if matiere:
            print(f"Analyse du graphe pour la matière : {matiere.nom}")
            graph = CurriculumGraph(matiere.id)
            
            # Prendre une leçon au hasard dans ce graphe
            if graph.lecons_metadata:
                premiere_lecon_id = list(graph.lecons_metadata.keys())[0]
                print(f"Leçon de départ : {graph.lecons_metadata[premiere_lecon_id]['titre']}")
                
                next_step = graph.find_next_step(premiere_lecon_id)
                if next_step:
                    print(f"Prochaine étape optimale : {next_step['metadata']['titre']}")
                else:
                    print("C'est la dernière leçon de la matière.")
            else:
                print("   -> Aucune leçon trouvée pour cette matière.")
        else:
            print("   -> Aucune matière existante en base de données.")
    except Exception as e:
        print(f"❌ Erreur Graphe : {e}")

    # ---------------------------------------------------------
    # 3. Test du Moteur de Recommandation (Scoring)
    # ---------------------------------------------------------
    print("\n🎯 3. Test du Moteur de Recommandation (Scoring)")
    print("-" * 40)
    try:
        etudiant = Etudiant.objects.first()
        matiere = Matiere.objects.first()
        
        if etudiant and matiere:
            print(f"Analyse pour l'étudiant {etudiant.utilisateur.username} en {matiere.nom}...")
            
            # On vérifie s'il y a des copies
            copies = CopieExamen.objects.filter(etudiant=etudiant, examen__matiere=matiere, est_termine=True)
            if not copies.exists():
                print("   -> Pas de copies d'examen existantes. Le moteur ne peut pas analyser sans données.")
            else:
                reco = ScoringService.analyser_et_recommander(etudiant, matiere)
                if reco:
                    print(f"⚠️ Recommandation générée (Score de pertinence: {reco.score_pertinence:.2f})")
                    print(f"   -> Suggestion : Revoir la leçon '{reco.lecon.titre}'")
                    print(f"   -> Motif : {reco.explication}")
                else:
                    print("✅ L'étudiant a de bons résultats. Aucune recommandation de rattrapage nécessaire.")
        else:
            print("   -> (Manque un étudiant ou une matière en base pour tester)")
    except Exception as e:
        print(f"❌ Erreur Scoring : {e}")
        
    # ---------------------------------------------------------
    # 4. Test du Moteur de Commande Vocale (NLP)
    # ---------------------------------------------------------
    print("\n🎤 4. Test du Moteur de Commande Vocale (NLP)")
    print("-" * 40)
    from core.services import VoiceCommandProcessor
    
    phrases_test = [
        "Je voudrais ouvrir la leçon sur les mathématiques",
        "Emmène-moi passer mon examen de physique",
        "Retourner au tableau de bord",
        "Je veux acheter un cours dans la boutique",
        "Fais moi un café"
    ]
    
    for phrase in phrases_test:
        print(f"\n🗣️ Utilisateur dit : \"{phrase}\"")
        resultat = VoiceCommandProcessor.process(phrase)
        print(f"🤖 Action générée : {json.dumps(resultat, ensure_ascii=False)}")
        
    print("\n" + "="*50)

if __name__ == '__main__':
    run_tests()
