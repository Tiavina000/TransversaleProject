# 🏗️ Architecture des APIs REST ENENI

## 📦 Structure globale du projet

```
ENENI-main/
├── ENENI/                          # Configuration Django
│   ├── settings.py                 # ✅ rest_framework déjà installé
│   ├── urls.py                     # ✅ core.urls inclus
│   └── ...
│
├── core/                           # Application principale
│   ├── models/                     # 📌 Modèles (définition des données)
│   │   ├── base.py                 # TimeStampedModel, SoftDeleteModel
│   │   ├── utilisateurs.py         # Utilisateur, Étudiant, Enseignant, Admin
│   │   ├── etablissements.py       # Établissement, AdminEtablissement
│   │   ├── pedagogie.py            # Niveaux, Matières, Chapitres, Leçons
│   │   ├── examens.py              # Examen, Questions, Copies
│   │   ├── visioconference.py      # Sessions vidéo, Participations
│   │   ├── boutique.py             # Ressources, Paniers, Commandes
│   │   ├── communications.py       # Actualités, Notifications
│   │   └── intelligence_artificielle.py # IA, Recommandations
│   │
│   ├── serializers/                # 📄 Serializers (Conversion Model ↔️ JSON)
│   │   ├── __init__.py
│   │   ├── base_serializers.py           # ⭐ Utilisateur
│   │   ├── utilisateurs_serializers.py   # ⭐ Étudiant, Enseignant, Admin
│   │   ├── etablissements_serializers.py # ⭐ Établissements
│   │   ├── pedagogie_serializers.py      # ⭐ Pédagogie
│   │   ├── examens_serializers.py        # ⭐ Examens
│   │   ├── visioconference_serializers.py # ⭐ Visio
│   │   ├── boutique_serializers.py       # ⭐ Boutique
│   │   ├── communications_serializers.py # ⭐ Communications
│   │   └── ia_serializers.py             # ⭐ IA
│   │
│   ├── views/                      # 🔌 ViewSets (Endpoints API REST)
│   │   ├── __init__.py
│   │   ├── utilisateurs_views.py         # ⭐ ViewSets utilisateurs
│   │   ├── etablissements_views.py       # ⭐ ViewSets établissements
│   │   ├── pedagogie_views.py            # ⭐ ViewSets pédagogie
│   │   ├── examens_views.py              # ⭐ ViewSets examens
│   │   ├── visioconference_views.py      # ⭐ ViewSets visio
│   │   ├── boutique_views.py             # ⭐ ViewSets boutique
│   │   ├── communications_views.py       # ⭐ ViewSets communications
│   │   └── ia_views.py                   # ⭐ ViewSets IA
│   │
│   ├── urls.py                     # 🔗 Router configuration
│   ├── admin.py
│   ├── apps.py
│   └── ...
│
├── 📖 Documentation API
│   ├── API_REST_DOCUMENTATION.md   # Doc complète de tous les endpoints
│   ├── GUIDE_IMPLEMENTATION.md     # Guide détaillé d'implémentation
│   ├── EXEMPLES_REQUETES.md        # Exemples concrets de requêtes
│   ├── README_API_REST.md          # Résumé et prochaines étapes
│   ├── CHECKLIST.md                # Checklist de configuration
│   ├── REST_FRAMEWORK_CONFIG.py    # Configuration optionnelle
│   └── test_apis.py                # Script de test des APIs
│
├── manage.py
<<<<<<< HEAD
└── (PostgreSQL)
=======
└── db.sqlite3
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
```

---

## 🔄 Flux de données (Request → Response)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Navigateur/App)                        │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Requête HTTP
                                    │ (GET, POST, PATCH, DELETE)
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│                        Django URL Router                              │
│                     core/urls.py (Router)                            │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Mappe les URLs aux ViewSets appropriés                        │  │
│  │  /api/utilisateurs/        → UtilisateurViewSet              │  │
│  │  /api/etudiants/           → EtudiantViewSet                 │  │
│  │  /api/examens/             → ExamenViewSet                   │  │
│  │  etc...                                                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│                        ViewSet (core/views/)                         │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  class UtilisateurViewSet(viewsets.ModelViewSet):             │  │
│  │    - list()      → GET /utilisateurs/                         │  │
│  │    - create()    → POST /utilisateurs/                        │  │
│  │    - retrieve()  → GET /utilisateurs/{id}/                   │  │
│  │    - update()    → PUT /utilisateurs/{id}/                   │  │
│  │    - destroy()   → DELETE /utilisateurs/{id}/                │  │
│  │    - actifs()    → GET /utilisateurs/actifs/ (Custom Action) │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│                        Model (core/models/)                          │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  class Utilisateur(AbstractUser, TimeStampedModel, ...):       │  │
│  │    - Accès à la base de données                              │  │
│  │    - Requêtes ORM                                            │  │
│  │    - Validations                                             │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
<<<<<<< HEAD
│                    Base de données (PostgreSQL)                       │
=======
│                    Base de données (db.sqlite3)                      │
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Tables SQL:                                                  │  │
│  │  - auth_user / core_utilisateur                              │  │
│  │  - core_etudiant, core_enseignant, core_adminplateforme      │  │
│  │  - core_examen, core_questionexamen, etc.                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Requête SQL
                                    ↓
                             [Données]
                                    │
                                    ↑
┌──────────────────────────────────────────────────────────────────────┐
│                        Serializer                                     │
│                  (core/serializers/)                                  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  class UtilisateurSerializer(ModelSerializer):                │  │
│  │    - Convertit Model Instance → Dict (JSON)                   │  │
│  │    - Valide les données entrantes                             │  │
│  │    - Ajoute les read_only fields                              │  │
│  │    - Traite les relations (FK, M2M)                           │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Serialized Data (Dict)
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│                        Renderer                                       │
│               (rest_framework.renderers)                              │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  JSONRenderer:                                                 │  │
│  │    {                                                           │  │
│  │      "id": 5,                                                 │  │
│  │      "username": "alice",                                     │  │
│  │      "email": "alice@example.com",                            │  │
│  │      ...                                                       │  │
│  │    }                                                           │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Réponse HTTP (JSON)
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Navigateur/App)                        │
│                      Affiche les données                              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Diagramme des entités

```
                           ┌─────────────────┐
                           │  Utilisateur    │
                           │  (AbstractUser) │
                           └────────┬────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ↓                  ↓                  ↓
        ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐
        │  Étudiant    │  │ Enseignant   │  │ AdminPlateforme │
        │(OneToOne)    │  │ (OneToOne)   │  │  (OneToOne)     │
        └──────────────┘  └──────────────┘  └─────────────────┘


                      ┌──────────────────┐
                      │ Établissement    │
                      └─────────┬────────┘
                                │
                                ↓
                     ┌──────────────────────┐
                     │ AdminEtablissement   │
                     │  (FK to Utilisateur) │
                     └──────────────────────┘


        ┌──────────────────┐     ┌─────────────────┐
        │ NiveauScolaire   │     │    Matière      │
        └────────┬─────────┘     └────────┬────────┘
                 │ Many-to-Many           │ OneToOne
                 └────────────┬───────────┘
                              │
                              ↓
                       ┌────────────────┐
                       │   Chapitre     │
                       └────────┬───────┘
                                │
                                ↓
                       ┌────────────────┐
                       │    Leçon       │
                       └────────┬───────┘
                                │
                                ↓
                ┌───────────────────────────────┐
                │   FichierMultimédia           │
                │  (VIDEO, AUDIO, PDF)          │
                └───────────────────────────────┘


        ┌─────────────────────────────┐
        │      Examen                 │
        │ (FK: Enseignant, Matière)   │
        └───────────────┬─────────────┘
                        │
            ┌───────────┼───────────┐
            │                       │
            ↓                       ↓
    ┌──────────────┐        ┌──────────────────┐
    │ Question     │        │  CopieExamen     │
    │ Examen       │        │(FK: Étudiant)    │
    └──────────────┘        └────────┬─────────┘
                                     │
                         ┌───────────┼───────────┐
                         │                       │
                         ↓                       ↓
                ┌────────────────┐    ┌──────────────────┐
                │ Réponse        │    │ Log Surveillance │
                │ Examen         │    │                  │
                └────────────────┘    └──────────────────┘
```

---

## 🔌 API Endpoints Tree

```
/api/
├── 👥 UTILISATEURS
│   ├── /utilisateurs/
│   │   ├── GET      → Liste paginée
│   │   ├── POST     → Créer utilisateur
│   │   ├── {id}/
│   │   │   ├── GET    → Détail
│   │   │   ├── PUT    → Remplacer
│   │   │   ├── PATCH  → Mettre à jour
│   │   │   └── DELETE → Supprimer
│   │   └── /actifs/
│   │       └── GET    → Utilisateurs actifs (Action)
│   ├── /etudiants/
│   │   ├── GET       → Liste
│   │   ├── POST      → Créer
│   │   ├── {id}/     → CRUD complet
│   │   └── /top_points/
│   │       └── GET   → Top étudiants (Action)
│   ├── /enseignants/
│   │   ├── GET       → Liste
│   │   ├── {id}/     → CRUD complet
│   └── /admins-plateforme/
│       ├── GET       → Liste
│       └── {id}/     → CRUD complet
│
├── 🏫 ÉTABLISSEMENTS
│   ├── /etablissements/
│   │   ├── GET       → Liste
│   │   ├── {id}/     → CRUD complet
│   └── /admin-etablissements/
│       ├── GET       → Liste
│       └── {id}/     → CRUD complet
│
├── 📚 PÉDAGOGIE
│   ├── /niveaux-scolaires/
│   │   ├── GET       → Liste
│   │   └── {id}/     → CRUD complet
│   ├── /matieres/
│   │   ├── GET       → Liste
│   │   ├── {id}/     → CRUD complet
│   │   └── /{id}/chapitres/
│   │       └── GET   → Chapitres d'une matière (Action)
│   ├── /chapitres/
│   │   ├── GET       → Liste
│   │   └── {id}/     → CRUD complet
│   ├── /lecons/
│   │   ├── GET       → Liste
│   │   └── {id}/     → CRUD complet
│   └── /fichiers-multimedia/
│       ├── GET       → Liste
│       └── {id}/     → CRUD complet
│
├── ✏️ EXAMENS
│   ├── /examens/
│   │   ├── GET       → Liste
│   │   ├── {id}/     → CRUD complet
│   │   └── /publies/
│   │       └── GET   → Examens publiés (Action)
│   ├── /questions-examen/
│   │   ├── GET       → Liste
│   │   └── {id}/     → CRUD complet
│   ├── /copies-examen/
│   │   ├── GET       → Liste
│   │   ├── {id}/     → CRUD complet
│   │   └── /{id}/soumettre/
│   │       └── POST  → Soumettre une copie (Action)
│   ├── /reponses-examen/
│   │   ├── GET       → Liste
│   │   └── {id}/     → CRUD complet
│   └── /logs-surveillance/
│       ├── GET       → Liste
│       └── {id}/     → CRUD complet
│
├── 📹 VISIOCONFÉRENCE
│   ├── /sessions-visio/
│   │   ├── GET       → Liste
│   │   └── {id}/     → CRUD complet
│   └── /participations-visio/
│       ├── GET       → Liste
│       └── {id}/     → CRUD complet
│
├── 🛍️ BOUTIQUE
│   ├── /ressources-boutique/
│   │   ├── GET       → Liste
│   │   ├── {id}/     → CRUD complet
│   │   └── /disponibles/
│   │       └── GET   → Ressources disponibles (Action)
│   ├── /paniers/
│   │   ├── GET       → Liste
│   │   └── {id}/     → CRUD complet
│   ├── /panier-items/
│   │   ├── GET       → Liste
│   │   └── {id}/     → CRUD complet
│   └── /commandes/
│       ├── GET       → Liste
│       └── {id}/     → CRUD complet
│
├── 📰 COMMUNICATIONS
│   ├── /actualites/
│   │   ├── GET       → Liste
│   │   └── {id}/     → CRUD complet
│   └── /notifications/
│       ├── GET       → Liste
│       └── {id}/     → CRUD complet
│
└── 🤖 INTELLIGENCE ARTIFICIELLE
    ├── /requetes-ia/
    │   ├── GET       → Liste
    │   └── {id}/     → CRUD complet
    └── /recommandations/
        ├── GET       → Liste
        └── {id}/     → CRUD complet
```

---

## 🎯 Stack technologique

```
┌────────────────────────────────────────────────────────┐
│                  CLIENT SIDE                           │
│  (Frontend: React/Vue/Angular - À implémenter)        │
│  Fetch API / Axios pour les requêtes HTTP             │
└────────────────────────────┬───────────────────────────┘
                             │
                 HTTP Requests (JSON)
                             │
┌────────────────────────────┴───────────────────────────┐
│                  REST API (Django + DRF)              │
├────────────────────────────────────────────────────────┤
│  Component         │ Framework     │ Status            │
├────────────────────┼───────────────┼───────────────────┤
│ Web Framework      │ Django 6.0.3  │ ✅ Installé       │
│ REST API          │ DRF 3.x       │ ✅ Configuré      │
│ Serializers       │ DRF           │ ✅ 9 fichiers     │
│ ViewSets          │ DRF           │ ✅ 24 ViewSets    │
│ Authentication    │ DRF Token/JWT │ ⏳ À implémenter  │
│ Permissions       │ Custom        │ ⏳ À implémenter  │
│ Pagination        │ DRF Built-in  │ ✅ Configuré      │
│ Filtering         │ DRF Built-in  │ ✅ Configuré      │
└────────────────────┴───────────────┴───────────────────┘
                             │
                    ORM Queries
                             │
┌────────────────────────────┴───────────────────────────┐
│                DATABASE LAYER                         │
├────────────────────────────────────────────────────────┤
│  ORM              │ Django ORM    │ ✅ Utilisé        │
<<<<<<< HEAD
│  Database         │ PostgreSQL    │ ✅ Utilisé        │
=======
│  Database         │ SQLite 3      │ ✅ Par défaut     │
│  (Production)     │ PostgreSQL    │ ⏳ Recommandé     │
>>>>>>> 3240025 (Refonte architecture: Déplacement dans Backend/, sécurisation API et ajout des services IA (Trie, NLP, Graphes))
└────────────────────────────────────────────────────────┘
```

---

## 📈 Complexité des Serializers

```
┌─────────────────────────────────────────────┐
│   Niveau de complexité des Serializers      │
├─────────────────────────────────────────────┤
│ Basique                                     │
│  ├─ UtilisateurSerializer (champs simples) │
│  └─ NiveauScolaireSerializer                │
├─────────────────────────────────────────────┤
│ Moyen (Relations)                           │
│  ├─ EtudiantSerializer (FK Utilisateur)    │
│  ├─ ExamenSerializer (FK Enseignant)       │
│  └─ CommandeSerializer(FK Etudiant)        │
├─────────────────────────────────────────────┤
│ Avancé (Imbrication)                        │
│  ├─ ChapitreSerializer (contient Leçons)   │
│  ├─ CopieExamenSerializer (Réponses + Logs)│
│  ├─ PanierSerializer (Items imbriqués)     │
│  └─ SessionVisioSerializer (Participations)│
└─────────────────────────────────────────────┘
```

---

## ✨ Hiérarchie des ViewSets

```
┌─────────────────────────────────────────────────────┐
│            ViewSet Hierarchy                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  viewsets.ModelViewSet (Complet: CRUD)            │
│  ├─ UtilisateurViewSet          (24 actions)     │
│  ├─ EtudiantViewSet             (25 actions)     │
│  ├─ ExamenViewSet               (25 actions)     │
│  └─ ...                                           │
│                                                     │
│  Méthodes automatiques:                           │
│    • list()      → GET /resource/                │
│    • create()    → POST /resource/               │
│    • retrieve()  → GET /resource/{id}/           │
│    • update()    → PUT /resource/{id}/           │
│    • partial_update() → PATCH /resource/{id}/   │
│    • destroy()   → DELETE /resource/{id}/        │
│                                                     │
│  Méthodes custom (@action):                      │
│    • @action(detail=False) → Action sur liste   │
│    • @action(detail=True) → Action sur élément  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

**Architecture créée le 14 avril 2026** ✨
**Statut: ✅ Complète et fonctionnelle**
