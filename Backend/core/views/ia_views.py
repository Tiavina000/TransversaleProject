from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from core.models import RequestIA, Recommandation, Etudiant, Matiere
from core.serializers.ia_serializers import RequestIASerializer, RecommandationSerializer
from core.services import NavigationTrie, ScoringService, CurriculumGraph, VoiceCommandProcessor

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

    @action(detail=False, methods=['get'])
    def recherche_rapide(self, request):
        """Assistant de Navigation : Recherche par algorithme Trie"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({"detail": "Paramètre 'q' requis."}, status=status.HTTP_400_BAD_REQUEST)
            
        trie = NavigationTrie()
        trie.initialize_from_db() # Charge en mémoire si pas déjà fait
        
        results = trie.search_prefix(query)
        
        # Log la requête IA
        if request.user.is_authenticated and hasattr(request.user, 'etudiant_profile'):
            RequestIA.objects.create(
                etudiant=request.user.etudiant_profile,
                request=query,
                reponse=f"{len(results)} résultats trouvés",
                type_requete='NAVIGATION'
            )
            
        return Response({"query": query, "results": results})

    @action(detail=False, methods=['get'])
    def trajectoire(self, request):
        """Calcul de Trajectoire : Suggère le parcours optimal"""
        matiere_id = request.query_params.get('matiere_id')
        lecon_id = request.query_params.get('lecon_id')
        
        if not matiere_id or not lecon_id:
            return Response({"detail": "Paramètres 'matiere_id' et 'lecon_id' requis."}, status=status.HTTP_400_BAD_REQUEST)
            
        graph = CurriculumGraph(int(matiere_id))
        next_step = graph.find_next_step(int(lecon_id))
        full_path = graph.get_full_path(int(lecon_id))
        
        return Response({
            "current_lecon_id": int(lecon_id),
            "next_step": next_step,
            "full_remaining_path": full_path
        })

    @action(detail=False, methods=['post'])
    def commande_vocale(self, request):
        """Moteur NLP : Traite une commande vocale (texte) et renvoie une action"""
        texte_dicte = request.data.get('texte_dicte', '')
        
        if not texte_dicte:
            return Response({"detail": "Le champ 'texte_dicte' est requis."}, status=status.HTTP_400_BAD_REQUEST)
            
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
            return Response({"detail": "Action réservée aux étudiants."}, status=status.HTTP_403_FORBIDDEN)
            
        matiere_id = request.data.get('matiere_id')
        if not matiere_id:
            return Response({"detail": "Paramètre 'matiere_id' requis dans le body."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            matiere = Matiere.objects.get(id=matiere_id)
        except Matiere.DoesNotExist:
            return Response({"detail": "Matière non trouvée."}, status=status.HTTP_404_NOT_FOUND)
            
        etudiant = request.user.etudiant_profile
        reco = ScoringService.analyser_et_recommander(etudiant, matiere)
        
        if reco:
            serializer = self.get_serializer(reco)
            return Response({"status": "Recommandation générée", "data": serializer.data})
        else:
            return Response({"status": "Aucune recommandation nécessaire, bons résultats !"})
