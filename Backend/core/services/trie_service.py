class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.data = []  # Pour stocker les identifiants/métadonnées (ex: {'type': 'lecon', 'id': 1})

class NavigationTrie:
    """
    Assistant de Navigation - Algorithme de recherche par préfixe ultra-rapide.
    Implémentation d'un arbre Trie (Prefix Tree).
    Idéal pour l'autocomplétion et la recherche instantanée de leçons.
    """
    _instance = None

    def __new__(cls):
        # Implémentation Singleton pour garder l'arbre en mémoire vive
        if cls._instance is None:
            cls._instance = super(NavigationTrie, cls).__new__(cls)
            cls._instance.root = TrieNode()
            cls._instance._is_initialized = False
        return cls._instance

    def initialize_from_db(self):
        """Construit l'arbre à partir de la base de données"""
        if self._is_initialized:
            return

        from core.models import Lecon, Chapitre, Matiere
        
        # Indexer les matières
        for matiere in Matiere.objects.all():
            self.insert(matiere.nom, {'type': 'matiere', 'id': matiere.id, 'nom': matiere.nom})
            
        # Indexer les chapitres
        for chapitre in Chapitre.objects.all():
            self.insert(chapitre.titre, {'type': 'chapitre', 'id': chapitre.id, 'titre': chapitre.titre})
            
        # Indexer les leçons
        for lecon in Lecon.objects.all():
            self.insert(lecon.titre, {'type': 'lecon', 'id': lecon.id, 'titre': lecon.titre})
            
        self._is_initialized = True

    def insert(self, word, metadata):
        """Insère un mot dans l'arbre avec ses métadonnées"""
        if not word:
            return
            
        node = self.root
        word = word.lower()
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        
        node.is_end_of_word = True
        node.data.append(metadata)

    def search_prefix(self, prefix):
        """Retourne toutes les métadonnées pour les mots commençant par ce préfixe"""
        if not prefix:
            return []
            
        node = self.root
        prefix = prefix.lower()
        
        # Descendre dans l'arbre jusqu'à la fin du préfixe
        for char in prefix:
            if char not in node.children:
                return []  # Aucun résultat
            node = node.children[char]
            
        # Récolter tous les mots à partir de ce noeud
        results = []
        self._dfs_collect(node, results)
        return results

    def _dfs_collect(self, node, results):
        """Parcours en profondeur (DFS) pour récolter toutes les données des feuilles"""
        if node.is_end_of_word:
            results.extend(node.data)
            
        for child_node in node.children.values():
            self._dfs_collect(child_node, results)
