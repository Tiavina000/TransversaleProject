# 🚀 Guide d'implémentation des APIs REST ENENI

## Procédure complète

### ✅ Étape 1: Configuration de Django REST Framework

Votre `settings.py` est déjà configuré. Voici ce qui a été fait:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # ✅ Déjà installé
    'core'
]
```

---

### ✅ Étape 2: Organiser les Serializers

Les serializers convertissent les modèles Django en JSON.

**Structure créée:**
```
core/serializers/
├── __init__.py
├── base_serializers.py           # Utilisateurs
├── utilisateurs_serializers.py   # Étudiant, Enseignant, Admin
├── etablissements_serializers.py
├── pedagogie_serializers.py
├── examens_serializers.py
├── visioconference_serializers.py
├── boutique_serializers.py
├── communications_serializers.py
└── ia_serializers.py
```

**Points clés des serializers:**
- `read_only_fields`: Champs non modifiables (id, dates)
- `write_only=True`: Champs qui n'apparaissent qu'en création
- Imbrication possible: Un serializer peut contenir d'autres

---

### ✅ Étape 3: Créer les ViewSets

Les ViewSets fournissent les opérations CRUD (Create, Read, Update, Delete).

**Structure créée:**
```
core/views/
├── __init__.py
├── utilisateurs_views.py
├── etablissements_views.py
├── pedagogie_views.py
├── examens_views.py
├── visioconference_views.py
├── boutique_views.py
├── communications_views.py
└── ia_views.py
```

**Chaque ViewSet inclut:**
```python
class MonViewSet(viewsets.ModelViewSet):
    queryset = MockModel.objects.all()
    serializer_class = MonSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['champ1', 'champ2']
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']
    
    @action(detail=False, methods=['get'])
    def action_personnalisee(self, request):
        # Actions personnalisées
        return Response(data)
```

---

### ✅ Étape 4: Configurer les URLs avec Routers

Les routers automatisent la génération des URLs pour les ViewSets.

**Fichier `core/urls.py` configuré:**
```python
router = DefaultRouter()
router.register(r'utilisateurs', UtilisateurViewSet)
router.register(r'etudiants', EtudiantViewSet)
# ... etc

urlpatterns = [
    path('api/', include(router.urls)),
]
```

**URLs générées automatiquement:**
```
/api/utilisateurs/              → Liste
/api/utilisateurs/1/            → Détail
/api/utilisateurs/actifs/       → Action personnalisée
/api/etudiants/                 → Crud complet
```

---

## 📊 Différents types de ViewSets

### 1. **ModelViewSet** (Complet)

```python
from rest_framework import viewsets

class CompletViewSet(viewsets.ModelViewSet):
    # Fournit: GET, POST, PUT, PATCH, DELETE
    queryset = MyModel.objects.all()
    serializer_class = MySerializer
```

**Endpoints créés:**
- `GET /api/resource/` - Liste
- `POST /api/resource/` - Créer
- `GET /api/resource/1/` - Détail
- `PUT /api/resource/1/` - Remplacer complet
- `PATCH /api/resource/1/` - Détail partiel
- `DELETE /api/resource/1/` - Supprimer

### 2. **ReadOnlyModelViewSet** (Lecture seule)

```python
class LectureSeuleViewSet(viewsets.ReadOnlyModelViewSet):
    # Fournit: GET uniquement
    queryset = MyModel.objects.all()
    serializer_class = MySerializer
```

### 3. **ViewSet personnalisé**

```python
from rest_framework.viewsets import ViewSet

class PersonnaliseViewSet(ViewSet):
    def list(self, request):
        # Implémentation custom
        pass
    
    def create(self, request):
        pass
```

---

## 🔍 Actions personnalisées

L'un de vos ViewSets inclut des actions personnalisées:

```python
@action(detail=False, methods=['get'])  # S'applique à la liste
def actifs(self, request):
    utilisateurs = self.queryset.filter(est_actif=True)
    page = self.paginate_queryset(utilisateurs)
    if page is not None:
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
```

**URL générée:** `GET /api/utilisateurs/actifs/`

### Types d'actions:

```python
# Sur la liste (detail=False)
@action(detail=False, methods=['get', 'post'])
def mon_action(self, request):
    pass

# Sur un élément (detail=True)
@action(detail=True, methods=['post'])
def soumettre(self, request, pk=None):
    obj = self.get_object()
    # ...
```

---

## 🔐 Ajouter l'authentification

### Option 1: Token Authentication

```python
# settings.py
INSTALLED_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    # ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### Option 2: JWT (Recommandé)

```bash
pip install djangorestframework-simplejwt
```

```python
# settings.py
INSTALLED_APPS = [
    'rest_framework_simplejwt',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
```

---

## 📋 Filtrage avancé

### Filtrer par type:

```python
# Utiliser django-filter (recommandé)
pip install django-filter

# settings.py
INSTALLED_APPS = ['django_filters']
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ]
}

# views.py
from django_filters import rest_framework as filters

class MonViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['statut', 'categorie']
```

**URL:** `GET /api/commandes/?statut=PAYEE&categorie=LIVRE`

---

## 🧪 Tests des APIs

### Test simple avec curl:

```bash
# Lister
curl http://localhost:8000/api/utilisateurs/

# Créer
curl -X POST http://localhost:8000/api/utilisateurs/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com"}'

# Détail
curl http://localhost:8000/api/utilisateurs/1/

# Mettre à jour
curl -X PATCH http://localhost:8000/api/utilisateurs/1/ \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Jonathan"}'

# Supprimer
curl -X DELETE http://localhost:8000/api/utilisateurs/1/
```

### Avec Python requests:

```python
import requests

# GET
response = requests.get('http://localhost:8000/api/utilisateurs/')
print(response.json())

# POST
data = {
    'username': 'john',
    'email': 'john@example.com',
    'prenom': 'John'
}
response = requests.post('http://localhost:8000/api/utilisateurs/', json=data)
print(response.json())
```

---

## 🛠️ Configuration supplémentaire recommandée

### 1. Pagination par défaut

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}
```

### 2. FORMAT des réponses d'erreur

```python
# settings.py
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
}
```

### 3. CORS (pour le frontend)

```bash
pip install django-cors-headers
```

```python
# settings.py
INSTALLED_APPS = [
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
]
```

---

## 📚 Structure des données imbriquées

### Récupérer les données imbriquées:

```bash
# Simplement une clé étrangère
GET /api/chapitres/1/
{
  "id": 1,
  "titre": "Chapter 1",
  "matiere": 5,  # ← Seulement l'ID
  "ordre": 1
}

# Avec imbrication (dans le DetailSerializer)
GET /api/chapitres/1/
{
  "id": 1,
  "titre": "Chapter 1",  
  "matiere": {  # ← Objet complet
    "id": 5,
    "nom": "Mathématiques",
    "code": "MATH101"
  },
  "ordre": 1
}
```

---

## 🎯 Cas d'usage courants

### 1. Créer un examen avec questions

```python
# 1. Créer l'examen
POST /api/examens/
{
  "titre": "Examen Math",
  "enseignant": 1,
  "matiere": 5,
  "niveau": 10,
  "duree_minutes": 120,
  "date_debut": "2024-04-01T10:00:00Z",
  "date_fin": "2024-04-01T12:00:00Z"
}

# 2. Créer les questions
POST /api/questions-examen/
{
  "examen": 1,
  "texte": "Quel est le résultat de 2+2?",
  "type_question": "QCM",
  "points": 1,
  "ordre": 1,
  "options": ["3", "4", "5"],
  "reponse_correcte": "4"
}
```

### 2. Gérer le panier d'un utilisateur

```bash
# Ajouter au panier
POST /api/panier-items/
{
  "panier": 1,
  "ressources": 5,
  "quantite": 2
}

# Lister le panier
GET /api/paniers/1/

# Créer une commande
POST /api/commandes/
{
  "etudiant": 1,
  "montant_total": "100.00",
  "statut_paiement": "EN_ATTENTE"
}
```

---

## 🐛 Dépannage courant

| Problème | Cause | Solution |
|----------|-------|----------|
| 404 Not Found | URL incorrecte | Vérifier le routing dans `urls.py` |
| 400 Bad Request | Données invalides | Vérifier le format JSON et les champs requis |
| 403 Forbidden | Authentification manquante | Ajouter le token d'authentification |
| 500 Server Error | Erreur au serveur | Vérifier les logs Django |

---

## 📖 Ressources utiles

- [Django REST Framework Docs](https://www.django-rest-framework.org/)
- [Django Official docs](https://docs.djangoproject.com/)
- [Postman](https://www.postman.com/) pour tester les APIs
- [Swagger UI](https://swagger.io/) pour la documentation auto

---

**Votre API REST ENENI est prête! 🎉**

Pour démarrer le serveur:
```bash
python manage.py runserver
```

Accédez à: `http://localhost:8000/api/`
