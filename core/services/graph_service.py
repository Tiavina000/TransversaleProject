from core.models import Matiere, Chapitre, Lecon

class CurriculumGraph:
    """
    Calcul de Trajectoire - Modélisation par Graphes orientés.
    Permet de trouver le chemin logique entre les leçons d'une matière.
    """

    def __init__(self, matiere_id):
        self.matiere_id = matiere_id
        self.graph = {}  # Liste d'adjacence : {lecon_id: [next_lecon_id_1, ...]}
        self.lecons_metadata = {} # Pour stocker les infos de chaque noeud
        self._build_graph()

    def _build_graph(self):
        """
        Construit le graphe orienté en se basant sur l'ordre linéaire 
        des chapitres et des leçons au sein de la matière.
        """
        chapitres = Chapitre.objects.filter(matiere_id=self.matiere_id).order_by('order')
        
        lecons_lineaires = []
        
        # Aplatir toutes les leçons dans l'ordre logique
        for chapitre in chapitres:
            lecons = Lecon.objects.filter(chapitre=chapitre).order_by('order')
            for lecon in lecons:
                lecons_lineaires.append(lecon)
                self.lecons_metadata[lecon.id] = {
                    'titre': lecon.titre,
                    'chapitre_id': chapitre.id,
                    'chapitre_titre': chapitre.titre
                }

        # Construire les arêtes (Edges) du graphe
        # Dans ce modèle simple, chaque leçon pointe vers la suivante
        for i in range(len(lecons_lineaires)):
            current_id = lecons_lineaires[i].id
            self.graph[current_id] = []
            
            if i + 1 < len(lecons_lineaires):
                next_id = lecons_lineaires[i+1].id
                self.graph[current_id].append(next_id)

    def find_next_step(self, current_lecon_id):
        """
        Trouve la prochaine leçon optimale à étudier.
        Algorithme de parcours simple (BFS sur le premier voisin).
        """
        if current_lecon_id not in self.graph:
            return None
            
        voisins = self.graph[current_lecon_id]
        if not voisins:
            return None # Fin du parcours
            
        next_id = voisins[0]
        return {
            'id': next_id,
            'metadata': self.lecons_metadata.get(next_id)
        }

    def get_full_path(self, start_lecon_id):
        """
        Génère la trajectoire complète restante à partir d'un point de départ.
        """
        path = []
        current = start_lecon_id
        
        # Éviter les boucles infinies (sécurité)
        visited = set()
        
        while current and current not in visited:
            visited.add(current)
            if current in self.lecons_metadata:
                path.append({
                    'id': current,
                    'metadata': self.lecons_metadata[current]
                })
                
            voisins = self.graph.get(current, [])
            current = voisins[0] if voisins else None
            
        return path
