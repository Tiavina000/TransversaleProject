from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from core.models import RequestIA, Recommandation, Etudiant, Matiere
from core.serializers.ia_serializers import RequestIASerializer, RecommandationSerializer
from core.services import NavigationTrie, ScoringService, CurriculumGraph, VoiceCommandProcessor
<<<<<<< HEAD
from django.utils.translation import gettext as _
=======
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))

class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class RequestIAViewSet(viewsets.ModelViewSet):
    """API pour gérer les requêtes IA"""
    queryset = RequestIA.objects.all()
    serializer_class = RequestIASerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['type_requete']
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']

<<<<<<< HEAD
    @action(detail=False, methods=['get'], url_path='recherche-rapide')
=======
    @action(detail=False, methods=['get'])
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    def recherche_rapide(self, request):
        """Assistant de Navigation : Recherche par algorithme Trie"""
        query = request.query_params.get('q', '')
        if not query:
<<<<<<< HEAD
            return Response({"detail": _("Paramètre 'q' requis.")}, status=status.HTTP_400_BAD_REQUEST)
=======
            return Response({"detail": "Paramètre 'q' requis."}, status=status.HTTP_400_BAD_REQUEST)
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
            
        trie = NavigationTrie()
        trie.initialize_from_db() # Charge en mémoire si pas déjà fait
        
        results = trie.search_prefix(query)
        
        # Log la requête IA
        if request.user.is_authenticated and hasattr(request.user, 'etudiant_profile'):
            RequestIA.objects.create(
                etudiant=request.user.etudiant_profile,
                request=query,
<<<<<<< HEAD
                reponse=f"{len(results)} " + _("résultats trouvés"),
=======
                reponse=f"{len(results)} résultats trouvés",
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
                type_requete='NAVIGATION'
            )
            
        return Response({"query": query, "results": results})

    @action(detail=False, methods=['get'])
    def trajectoire(self, request):
        """Calcul de Trajectoire : Suggère le parcours optimal"""
        matiere_id = request.query_params.get('matiere_id')
        lecon_id = request.query_params.get('lecon_id')
        
        if not matiere_id or not lecon_id:
<<<<<<< HEAD
            return Response({"detail": _("Paramètres 'matiere_id' et 'lecon_id' requis.")}, status=status.HTTP_400_BAD_REQUEST)
=======
            return Response({"detail": "Paramètres 'matiere_id' et 'lecon_id' requis."}, status=status.HTTP_400_BAD_REQUEST)
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
            
        graph = CurriculumGraph(int(matiere_id))
        next_step = graph.find_next_step(int(lecon_id))
        full_path = graph.get_full_path(int(lecon_id))
        
        return Response({
            "current_lecon_id": int(lecon_id),
            "next_step": next_step,
            "full_remaining_path": full_path
        })

<<<<<<< HEAD
    @action(detail=False, methods=['post'], url_path='commande-vocale')
=======
    @action(detail=False, methods=['post'])
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
    def commande_vocale(self, request):
        """Moteur NLP : Traite une commande vocale (texte) et renvoie une action"""
        texte_dicte = request.data.get('texte_dicte', '')
        
        if not texte_dicte:
<<<<<<< HEAD
            return Response({"detail": _("Le champ 'texte_dicte' est requis.")}, status=status.HTTP_400_BAD_REQUEST)
=======
            return Response({"detail": "Le champ 'texte_dicte' est requis."}, status=status.HTTP_400_BAD_REQUEST)
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
            
        # Traitement par le service NLP
        resultat = VoiceCommandProcessor.process(texte_dicte)
        
        # Enregistrement dans les logs IA pour apprentissage futur
        if request.user.is_authenticated and hasattr(request.user, 'etudiant_profile'):
            RequestIA.objects.create(
                etudiant=request.user.etudiant_profile,
                request=texte_dicte,
                reponse=str(resultat),
                type_requete='NAVIGATION' # On classe ça dans navigation
            )
            
        return Response(resultat)


class RecommandationViewSet(viewsets.ModelViewSet):
    """API pour gérer les recommandations"""
    queryset = Recommandation.objects.all()
    serializer_class = RecommandationSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['score_pertinence', 'date_creation']
    ordering = ['-score_pertinence', '-date_creation']

    @action(detail=False, methods=['post'])
    def generer(self, request):
        """Moteur de Recommandation : Algorithme de Scoring"""
        if not request.user.is_authenticated or not hasattr(request.user, 'etudiant_profile'):
<<<<<<< HEAD
            return Response({"detail": _("Action réservée aux étudiants.")}, status=status.HTTP_403_FORBIDDEN)
            
        matiere_id = request.data.get('matiere_id')
        if not matiere_id:
            return Response({"detail": _("Paramètre 'matiere_id' requis dans le body.")}, status=status.HTTP_400_BAD_REQUEST)
=======
            return Response({"detail": "Action réservée aux étudiants."}, status=status.HTTP_403_FORBIDDEN)
            
        matiere_id = request.data.get('matiere_id')
        if not matiere_id:
            return Response({"detail": "Paramètre 'matiere_id' requis dans le body."}, status=status.HTTP_400_BAD_REQUEST)
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
            
        try:
            matiere = Matiere.objects.get(id=matiere_id)
        except Matiere.DoesNotExist:
<<<<<<< HEAD
            return Response({"detail": _("Matière non trouvée.")}, status=status.HTTP_404_NOT_FOUND)
=======
            return Response({"detail": "Matière non trouvée."}, status=status.HTTP_404_NOT_FOUND)
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
            
        etudiant = request.user.etudiant_profile
        reco = ScoringService.analyser_et_recommander(etudiant, matiere)
        
        if reco:
            serializer = self.get_serializer(reco)
<<<<<<< HEAD
            return Response({"status": _("Recommandation générée"), "data": serializer.data})
        else:
            return Response({"status": _("Aucune recommandation nécessaire, bons résultats !")})
=======
            return Response({"status": "Recommandation générée", "data": serializer.data})
        else:
            return Response({"status": "Aucune recommandation nécessaire, bons résultats !"})
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
