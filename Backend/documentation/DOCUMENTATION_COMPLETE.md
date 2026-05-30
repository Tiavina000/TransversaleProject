# Documentation Complète ENENI — Plateforme Éducative

## Sommaire

1. [Présentation du projet](#1-présentation-du-projet)
2. [Outils et technologies utilisés](#2-outils-et-technologies-utilisés)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Base de données](#4-base-de-données)
5. [Backend — Installation et codage](#5-backend--installation-et-codage)
6. [Frontend — Installation et codage](#6-frontend--installation-et-codage)
7. [Structure détaillée du code backend](#7-structure-détaillée-du-code-backend)
8. [Structure détaillée du code frontend](#8-structure-détaillée-du-code-frontend)
9. [Services intelligents (IA)](#9-services-intelligents-ia)
10. [Tests](#10-tests)
11. [Guide de déploiement](#11-guide-de-déploiement)

---

## 1. Présentation du projet

**ENENI** est une plateforme éducative digitale destinée aux établissements scolaires de Madagascar. Elle connecte **élèves**, **enseignants**, **administrateurs d'établissements**, et **administrateurs plateforme** dans un écosystème unifié.

### Fonctionnalités principales

| Module | Description |
|--------|-------------|
| **Pédagogie** | Cours structurés en matières → chapitres → leçons, avec progression |
| **Examens** | QCM, texte, rédaction, mixte — avec correction automatique et manuelle |
| **Visioconférence** | Cours en direct via LiveKit, avec levée de main, questions, bannissement |
| **Boutique** | Ressources pédagogiques payantes (livres, exercices, cours) |
| **Communications** | Actualités, notifications, partenaires, rénovations |
| **Intelligence Artificielle** | Navigation par Trie, recommandations par scoring, graphe de trajectoire, NLP vocal |
| **Statistiques** | Tableaux de bord personnalisés pour chaque rôle |
| **Internationalisation** | Français, Anglais, Malagasy |

### Profils utilisateurs

| Profil | Rôle | Accès principal |
|--------|------|-----------------|
| **Élève (ETUDIANT)** | Apprenant | Cours, examens, bulletin, boutique, visio |
| **Enseignant (ENSEIGNANT)** | Créateur de contenu | Gestion des cours, examens, corrections, stats |
| **Administrateur Plateforme (ADMINISTRATEUR)** | Super-admin | Gestion des établissements, actualités, paramètres |

---

## 2. Outils et technologies utilisés

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Python** | 3.12+ | Langage de programmation |
| **Django** | 6.0.3 | Framework web full-stack (modèle-vue-contrôleur) |
| **Django REST Framework** | 3.x | Construction d'API REST (ViewSets, Serializers, Routers) |
| **djangorestframework-simplejwt** | 5.x | Authentification par JWT (JSON Web Token) |
| **django-modeltranslation** | 0.19.12 | Traduction des contenus en base de données |
| **SQLite** | 3.x | Base de données par défaut (développement) |
| **LiveKit API** | 1.x | Génération de tokens pour visioconférence WebRTC |

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Node.js** | 18+ | Environnement d'exécution JavaScript |
| **React** | 19.2.5 | Bibliothèque UI (composants réactifs) |
| **Vite** | 8.0.10 | Bundler et serveur de développement (remplace Webpack) |
| **React Router** | 7.14.2 | Routage côté client (SPA) |
| **Axios** | 1.15.2 | Client HTTP pour les appels API |
| **Framer Motion** | 12.38.0 | Animations et transitions fluides |
| **Tailwind CSS** | 3.4.19 | Framework CSS utilitaire |
| **i18next** | 26.0.8 | Internationalisation (FR/EN/MG) |
| **LiveKit Components** | 2.9.20 | Composants React pour visioconférence |
| **Lucide React** | 1.14.0 | Icônes SVG |
| **PostCSS / Autoprefixer** | 8.x / 10.x | Traitement CSS post-compilation |

### Tests

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Playwright** | 1.60.0 | Tests E2E frontend (Chromium) |
| **Django TestCase** | — | Tests unitaires backend (APITestCase) |
| **unittest.mock** | — | Mocking pour isolation des tests |
| **coverage.py** | — | Couverture de code |

### Outils de développement

| Outil | Utilisation |
|-------|-------------|
| **VS Code** | IDE de développement |
| **ESLint** | Linting JavaScript |
| **Pytest** | Exécution des tests (via Django) |
| **Seed data** | Scripts `seed_schools.py`, `seed_all.py` |

---

## 3. Architecture du projet

### Arborescence complète

```
ENENI-main/
├── Backend/                        # API Django REST
│   ├── ENENI/                      # Configuration Django
│   │   ├── settings.py             # Configuration principale
│   │   ├── test_settings.py        # Configuration pour les tests
│   │   ├── urls.py                 # Routage racine
│   │   ├── asgi.py                 # Serveur ASGI
│   │   └── wsgi.py                 # Serveur WSGI
│   ├── core/                       # Application principale
│   │   ├── models/                 # 9 fichiers de modèles
│   │   ├── views/                  # 8 fichiers de vues API
│   │   ├── serializers/            # 8 fichiers de sérialiseurs
│   │   ├── services/               # 4 services intelligents
│   │   ├── tests/                  # Tests unitaires (222 tests)
│   │   ├── admin.py                # Interface d'administration
│   │   ├── urls.py                 # Routes API (60+ endpoints)
│   │   ├── permissions.py          # Permissions personnalisées
│   │   ├── auth_backends.py        # Authentification custom
│   │   └── translation.py          # Configuration modeltranslation
│   ├── documentation/              # Documentation existante
│   ├── manage.py                   # Point d'entrée Django
│   ├── locale/                     # Traductions (fr, en, mg)
│   └── media/                      # Fichiers uploadés
├── frontend/                       # Application React
│   ├── src/
│   │   ├── components/             # Composants réutilisables
│   │   ├── pages/                  # Pages de l'application
│   │   ├── services/               # Services API (Axios)
│   │   ├── context/                # Contextes React (Theme)
│   │   ├── hooks/                  # Hooks personnalisés
│   │   ├── locales/                # Traductions (fr, en, mg)
│   │   ├── App.jsx                 # Point d'entrée React + routage
│   │   ├── i18n.js                 # Configuration i18next
│   │   └── index.css               # Styles globaux + Tailwind
│   ├── tests/e2e/                  # Tests Playwright (15 tests)
│   ├── vite.config.js              # Configuration Vite
│   ├── tailwind.config.js          # Configuration Tailwind
│   └── package.json                # Dépendances frontend
```

### Flux de données

```
[Client React] ──Axios──▶ [API Django REST] ──ORM──▶ [SQLite/PostgreSQL]
     │                          │
     │  JWT (access+refresh)    │  JWT Authentication
     │◀─────────────────────────│
     │                          │
     │  LiveKit WebRTC          │  LiveKit Server
     │◀─────────────────────────│  (ws://localhost:7880)
```

### Principe de fonctionnement

1. L'utilisateur se connecte via `LoginPage.jsx` → envoie `POST /api/auth/login/` avec identifiant + mot de passe + rôle + établissement
2. Le backend valide via `CustomTokenObtainPairSerializer` et `EmailOrUsernameModelBackend` (authentification par username, email OU numéro étudiant)
3. Le frontend stocke les tokens JWT dans `sessionStorage` (`eneni_token`, `eneni_refresh`)
4. L'intercepteur Axios attache automatiquement `Authorization: Bearer <token>` à chaque requête
5. En cas de 401, l'intercepteur tente un rafraîchissement silencieux via `POST /api/auth/refresh/`
6. Chaque vue backend vérifie les permissions via `rest_framework.permissions` et les permissions personnalisées dans `core/permissions.py`

---

## 4. Base de données

### Modèle conceptuel (MCD simplifié)

```
Utilisateur (AbstractUser)
├── Etudiant (OneToOne)
│   ├── NiveauScolaire (FK)
│   ├── Etablissement (FK)
│   └── Classe (FK)
├── Enseignant (OneToOne)
│   ├── NiveauScolaire (FK)
│   └── Etablissement (FK)
└── AdminPlateforme (OneToOne)
    └── niveau_acces

Etablissement ──── Classe ──── Etudiant
NiveauScolaire ── Classe
NiveauScolaire ── Matiere (M2M)

Matiere ── Chapitre ── Lecon ── FichierMultimedia
Lecon ── SessionVisio

Examen ── QuestionExamen
Examen ── CopieExamen ── ReponseExamen
CopieExamen ── LogSurveillance

Panier ── PanierItem ── RessourceBoutique
Commande

Actualite ── Auteur (Utilisateur)
Notification ── Utilisateur
Partenaire
Renovation

SessionEtude ── Etudiant, Chapitre
ProgressionChapitre ── Etudiant, Chapitre

RequestIA ── Etudiant
Recommandation ── Etudiant, Lecon
```

### Dictionnaire des 19 modèles

#### `core/models/base.py` — Modèles abstraits

| Modèle | Type | Champs | Description |
|--------|------|--------|-------------|
| **TimeStampedModel** | Abstrait | `date_creation`, `date_modification` | Ajoute automatiquement les dates de création et modification |
| **SoftDeleteModel** | Abstrait | `est_actif`, `date_suppression` | Suppression logique (soft delete) |

#### `core/models/utilisateurs.py` — 4 modèles

| Modèle | Table | Champs clés | Contraintes |
|--------|-------|-------------|-------------|
| **Utilisateur** | `core_utilisateur` | `prenom`, `email` (unique), `langue_preferee`, `type_utilisateur`, `photo_profil`, `options_accessibilite` (JSON) | Hérite d'AbstractUser + TimeStamped + SoftDelete. `type_utilisateur` ∈ {ETUDIANT, ENSEIGNANT, ADMINISTRATEUR} |
| **Etudiant** | `core_etudiant` | `utilisateur` (OneToOne), `etablissement` (FK), `numero_etudiant` (unique), `niveau` (FK), `classe` (FK), `points_global` | `numero_etudiant` unique — format "ETU001", "ETU002"... |
| **Enseignant** | `core_enseignant` | `utilisateur` (OneToOne), `etablissement` (FK), `specialite`, `niveau` (FK) | Un enseignant a une spécialité (ex: "Mathématiques") liée à une matière |
| **AdminPlateforme** | `core_adminplateforme` | `utilisateur` (OneToOne), `niveau_acces` | `niveau_acces` par défaut `super_admin` |

#### `core/models/etablissements.py` — 3 modèles

| Modèle | Table | Champs clés | Contraintes |
|--------|-------|-------------|-------------|
| **Etablissement** | `core_etablissement` | `nom`, `adresse`, `telephone` (RegexValidator), `email`, `code_etablissement` (unique), `type` ∈ {LYCEE, CEG, EPP, AUTRE} | Code unique pour identification |
| **AdminEtablissement** | `core_adminetablissement` | `utilisateur` (OneToOne), `etablissement` (FK), `fonction` | Lien entre un utilisateur et un établissement comme admin local |
| **Classe** | `core_classe` | `nom`, `niveau` (FK), `etablissement` (FK) | Unique : `(nom, etablissement)` |

#### `core/models/pedagogie.py` — 7 modèles

| Modèle | Table | Champs clés | Contraintes |
|--------|-------|-------------|-------------|
| **NiveauScolaire** | `core_niveauscolaire` | `nom` (choix: Maternelle→Terminale), `ordre` (unique), `description` | Niveaux ordonnés de 0 à 12 |
| **Matiere** | `core_matiere` | `nom`, `code` (unique), `description`, `niveaux` (M2M→NiveauScolaire), `ordre` | Une matière peut concerner plusieurs niveaux |
| **Chapitre** | `core_chapitre` | `titre`, `order` (PositiveInteger), `matiere` (FK), `niveau` (FK), `description`, `createur` (FK→Enseignant) | Unique : `(matiere, niveau, order)` |
| **Lecon** | `core_lecon` | `titre`, `order`, `chapitre` (FK), `contenue_texte` (HTML), `video_url`, `duree_estimee`, `objectifs`, `est_publie`, `createur` (FK→Enseignant) | Unique : `(chapitre, order)` |
| **FichierMultimedia** | `core_fichiermultimedia` | `type_fichier` (VIDEO/AUDIO/PDF), `titre`, `url_fichier`, `taille_no`, `lecon` (FK), `format`, `est_telechargeable`, `metadata` (JSON) | Fichiers uploadés associés aux leçons |
| **ProgressionChapitre** | `core_progressionchapitre` | `etudiant` (FK), `chapitre` (FK), `temps_passe_secondes`, `est_valide`, `date_derniere_session` | Unique : `(etudiant, chapitre)` |
| **SessionEtude** | `core_sessionetude` | `etudiant` (FK), `chapitre` (FK), `date_debut`, `date_fin`, `derniere_activite`, `temps_cumule_secondes`, `statut` ∈ {EN_COURS, PAUSE, TERMINE, ABANDONNE} | Chronomètre d'étude par chapitre |

#### `core/models/examens.py` — 5 modèles

| Modèle | Table | Champs clés | Contraintes |
|--------|-------|-------------|-------------|
| **Examen** | `core_examen` | `titre`, `enseignant` (FK), `matiere` (FK), `niveau` (FK), `duree_minutes`, `date_debut`, `date_fin`, `est_publie`, `coefficient`, `type_examen` (QCM/TEXTE/REDACTION/MIXTE), `lecture_automatique` | — |
| **QuestionExamen** | `core_questionexamen` | `examen` (FK), `texte`, `type_question` (QCM/TEXTE/NUMERIQUE/VRAI_FAUX/REDACTION), `points`, `ordre`, `options` (JSON), `reponse_correcte`, `mot_min`, `mot_max`, `criteres_correction` (JSON), `obligatoire` | Unique : `(examen, ordre)` |
| **CopieExamen** | `core_copieexamen` | `examen` (FK), `etudiant` (FK), `date_debut`, `date_soumission`, `note_obtenue` (0-20), `est_termine` | Unique : `(examen, etudiant)` |
| **ReponseExamen** | `core_reponseexamen` | `copie` (FK), `question` (FK), `reponse_etudiant`, `est_correct`, `points_obtenus`, `nb_mots`, `fautes_orthographe` (JSON), `correction_commentaire` | Unique : `(copie, question)` |
| **LogSurveillance** | `core_logsurveillance` | `copie` (FK), `evenement`, `details` (JSON), `date_evenement` | Journalisation des changements d'onglet pendant un examen |

#### `core/models/visioconference.py` — 3 modèles

| Modèle | Champs clés |
|--------|-------------|
| **SessionVisio** | `titre`, `enseignant` (FK), `lecon` (FK), `date_debut`, `date_fin`, `url_visio`, `est_active` |
| **ParticipationVisio** | `etudiant` (FK), `session` (FK), `date_joindre`, `date_quitter`, `duree_participation`, `evenements_inactive` (JSON) — Unique : `(etudiant, session)` |
| **QuestionVisio** | `session` (FK), `etudiant` (FK), `contenu`, `est_answered` |

#### `core/models/boutique.py` — 4 modèles

| Modèle | Champs clés |
|--------|-------------|
| **RessourceBoutique** | `titre`, `description`, `prix` (Decimal), `type_contenu` (LIVRE/EXERCICES/COURS/VIDEO), `fichier` (FK), `niveau` (FK), `matiere` (FK), `est_disponible`, `stock` |
| **Panier** | `etudiant` (OneToOne→Etudiant), `date_derniere_modif` |
| **PanierItem** | `panier` (FK), `ressources` (FK), `quantite` — Unique : `(panier, ressources)` |
| **Commande** | `etudiant` (FK), `montant_total` (Decimal), `statut_paiement` (EN_ATTENTE/PAYEE/LIVREE/ANNULEE), `reference_paiement` (unique) |

#### `core/models/communications.py` — 4 modèles

| Modèle | Champs clés |
|--------|-------------|
| **Actualite** | `titre`, `contenu`, `categorie` (Examens/Cours/Evenements/Annonces/Sport/Culture), `est_important`, `image` (ImageField), `video_url`, `lien_externe`, `auteur` (FK→Utilisateur), `date_expiration`, `est_publie`, `public_ciblie`, `etablissement_cible` (FK) |
| **Notification** | `utilisateur` (FK), `titre`, `message`, `est_lue`, `url_lien` |
| **Partenaire** | `nom`, `logo`, `url`, `ordre` (carrousel) |
| **Renovation** | `annee`, `titre`, `description`, `ordre` |

#### `core/models/intelligence_artificielle.py` — 2 modèles

| Modèle | Champs clés |
|--------|-------------|
| **RequestIA** | `etudiant` (FK), `request` (Text), `reponse` (Text), `type_requete` (NAVIGATION/RECOMMANDATION/AIDE) |
| **Recommandation** | `etudiant` (FK), `lecon` (FK), `score_pertinence` (0.0-1.0), `explication`, `est_consultee` |

---

## 5. Backend — Installation et codage

### Installation

```bash
# 1. Cloner le projet
git clone <url-du-projet> ENENI-main
cd ENENI-main/Backend

# 2. Créer et activer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou .\venv\Scripts\activate  # Windows

# 3. Installer les dépendances
# Les dépendances doivent être installées manuellement car il n'y a pas de requirements.txt
pip install Django==6.0.3 djangorestframework djangorestframework-simplejwt django-modeltranslation==0.19.12 livekit-api

# 4. Appliquer les migrations
python manage.py migrate

# 5. Lancer le serveur
python manage.py runserver  # → http://localhost:8000
```

### Modèle Django : Fonctionnement général

Django suit le pattern **MTV** (Model-Template-View), adapté ici en **API REST** :

```
[URL] → [ViewSet] → [Serializer] → [Model] → [Base de données]
```

1. **URL** (`urls.py`) : Routage des requêtes HTTP vers les ViewSets
2. **ViewSet** (`views/`) : Logique métier — récupère les données, applique les permissions
3. **Serializer** (`serializers/`) : Transformation des modèles en JSON (et vice-versa)
4. **Model** (`models/`) : Définition de la structure des données et des relations

### Fichier settings.py — Configuration clé

```python
# Fichier : ENENI/settings.py

# Base de données (SQLite en dev)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Modèle utilisateur personnalisé
AUTH_USER_MODEL = 'core.Utilisateur'

# REST Framework — Authentification JWT par défaut
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# JWT — Durée de vie
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# LiveKit (visioconférence)
LIVEKIT_API_KEY = os.environ.get('LIVEKIT_API_KEY', '')
LIVEKIT_API_SECRET = os.environ.get('LIVEKIT_API_SECRET', '')
LIVEKIT_URL = os.environ.get('LIVEKIT_URL', 'ws://localhost:7880')

# Internationalisation — 3 langues
LANGUAGES = [
    ('mg', _('Malagasy')),
    ('fr', _('French')),
    ('en', _('English')),
]
```

### Fichier test_settings.py — Patch pour Django 6

```python
# Problème : modeltranslation 0.19.12 incompatible avec Django 6
# Solution : Faker les migrations modeltranslation et patcher MultilingualQuerySet
MIGRATION_MODULES = {'modeltranslation': None}

from modeltranslation.manager import MultilingualQuerySet
MultilingualQuerySet._update = patched_update  # Délégation à QuerySet._update
```

### Fichier urls.py — Routage des 60+ endpoints API

Tous les endpoints sont organisés via un **DefaultRouter** (DRF) :

```python
router = DefaultRouter()
router.register(r'etudiants', EtudiantViewSet)
router.register(r'enseignants', EnseignantViewSet)
router.register(r'examens', ExamenViewSet)
# ... 30 ViewSets enregistrés

urlpatterns = [
    path('api/auth/login/', CustomTokenObtainPairView.as_view()),
    path('api/auth/me/', UserMeView.as_view()),
    path('api/public/stats/', GlobalStatsView.as_view()),
    path('api/', include(router.urls)),
    # + routes personnalisées pour examens, visio, etc.
]
```

### Fonctionnement de l'authentification

```
POST /api/auth/login/
Body: { "username": "ETU001", "password": "...", "role": "ETUDIANT", "establishment_id": 1 }

1. CustomTokenObtainPairSerializer.validate()
   a. Résolution de l'utilisateur : username → Utilisateur OU numero_etudiant → Etudiant → Utilisateur
   b. Vérification du rôle : type_utilisateur doit correspondre
   c. Vérification de l'établissement : l'étudiant/enseignant doit appartenir à cet établissement
   d. Authentification standard via super().validate(attrs)

2. EmailOrUsernameModelBackend.authenticate()
   a. Recherche par Q(username__iexact) | Q(email__iexact) | Q(numero_etudiant__iexact)
   b. Filtre par rôle si spécifié
   c. Vérification du mot de passe

3. Réponse JWT : { "access": "...", "refresh": "...", "user": { "id": 1, "role": "ETUDIANT", ... } }
```

### Permissions personnalisées

Fichier `core/permissions.py` :

```python
class IsEnseignantOrReadOnly:
    # Lecture (GET) pour tous les authentifiés
    # Écriture (POST/PUT/DELETE) pour ENSEIGNANT et ADMINISTRATEUR

class IsAdminOrReadOnly:
    # Lecture pour tous
    # Écriture pour ADMINISTRATEUR uniquement

class IsEtudiant:
    # Accès réservé aux étudiants
```

### Vues API — Logique métier par module

#### `utilisateurs_views.py`

- **CustomTokenObtainPairView** : Login personnalisé avec rôle et établissement
- **LogoutView** : Déconnexion (côté client — invalidation du token)
- **UtilisateurViewSet** : CRUD utilisateurs + action `actifs/`
- **EtudiantViewSet** : CRUD étudiants + action `top-points/`
- **EnseignantViewSet** : CRUD enseignants
- **AdminPlateformeViewSet** : CRUD administrateurs

#### `pedagogie_views.py`

- **NiveauScolaireViewSet** : CRUD niveaux (admin seulement)
- **MatiereViewSet** : CRUD matières + action `chapitres/` (filtre par niveau et établissement)
- **ChapitreViewSet** : CRUD chapitres avec auto-order + actions `lecons/`, `validate/`, `validation-question/`, `qcm-validation/`, `upload_file/`
- **LeconViewSet** : CRUD leçons avec auto-order, vérification du créateur, filtrage par niveau/matière/chapitre
- **SessionEtudeViewSet** : Chronomètre d'étude (start/pause/resume/end/heartbeat)
- **FichierMultimediaViewSet** : Gestion des fichiers uploadés
- **PublicSearchView** : Recherche publique (matières, chapitres, établissements)
- **ClasseViewSet** : Liste des classes avec élèves (filtre par établissement/niveau)

Points clés du filtrage des leçons :
- **Étudiant** : ne voit que les leçons **publiées** par les enseignants de **son établissement** et **son niveau**
- **Enseignant** : voit ses propres leçons (brouillons inclus) + les leçons publiées de sa matière/niveau

#### `examens_views.py`

- **ExamenViewSet** : CRUD examens avec actions `start/`, `soumettre/`, `publier/`, `ajouter_question/`, `questions/`, `timer/`, `log_event/`, `corrigeables/`, `corriger_copie/`
- **QuestionExamenViewSet** : CRUD questions
- **CopieExamenViewSet** : CRUD copies avec action `soumettre/`
- **ReponseExamenViewSet** : CRUD réponses
- **LogSurveillanceViewSet** : Logs de surveillance
- **CorrectionViewSet** : Interface de correction (list/classes/matieres/noter/spellcheck)
- **MesNotesView** : Bulletin de l'étudiant connecté
- **NotesEnseignantView** : Notes des élèves pour un enseignant
- **FileDownloadView** : Téléchargement de fichier avec authentification

Logique de soumission d'examen :
```
1. Étudiant POST /api/examens/<id>/start/ → Crée une CopieExamen
2. Étudiant POST /api/examens/<id>/submit/ 
   → Pour chaque réponse :
     - QCM/VRAI_FAUX : correction automatique (comparaison insensible à la casse)
     - Texte/Rédaction : calcul du nombre de mots, détection de fautes (spellcheck basique)
   → Marque la copie comme terminée
3. Enseignant POST /api/examens/<id>/corriger/<copie_id>/ → Attribution des points
```

#### `boutique_views.py`

- **RessourceBoutiqueViewSet** : Liste des ressources avec action `disponibles/`
- **PanierViewSet** : Gestion du panier avec action `add/` (ajout au panier étudiant)
- **PanierItemViewSet** : Articles du panier
- **CommandeViewSet** : Commandes avec filtrage par date

#### `communications_views.py`

- **ActualiteViewSet** : Actualités avec upload d'image, action `infinite/` (fil infini sans pagination). Lecture publique, écriture admin
- **NotificationViewSet** : Notifications avec actions `creer_visio/`, `notifier_ban/`, `lire/`, `tout_lire/`, `compte/`, `signaler_retard/`
- **PartenaireViewSet** : Liste publique des partenaires (sans pagination)
- **RenovationViewSet** : Liste publique des rénovations (sans pagination)

#### `stats_views.py`

- **GlobalStatsView** : Statistiques publiques (total utilisateurs, étudiants, écoles, leçons)
- **StudentStatsView** : Stats étudiant (temps d'étude, chapitres validés, par matière)
- **TeacherStatsView** : Stats enseignant (cours publiés, étudiants, examens, taux de succès, moyenne notes)

#### `visioconference_views.py`

- **SessionVisioViewSet** : Sessions visio avec actions `join/`, `leave/`, `raise-hand/`, `lower-hand/`, `questions/` (GET+POST), `mark_answered/`, `livekit_token/`, `ban/`
- **ParticipationVisioViewSet** : Historique des participations

#### `ia_views.py`

- **RequestIAViewSet** : Requêtes IA avec actions `recherche-rapide/` (Trie), `trajectoire/` (Graph), `commande-vocale/` (NLP)
- **RecommandationViewSet** : Recommandations avec action `generer/` (Scoring)

### Sérieurs — Transformation des données

Chaque module a son propre fichier de serializers :
- `base_serializers.py` : `UtilisateurSerializer`, `UtilisateurDetailSerializer`
- `utilisateurs_serializers.py` : `EtudiantSerializer`, `EnseignantSerializer`, `AdminPlateformeSerializer`, `CustomTokenObtainPairSerializer`
- `pedagogie_serializers.py` : `NiveauScolaireSerializer`, `MatiereSerializer`, `ChapitreSerializer`, `ChapitreDetailSerializer`, `LeconSerializer`, `FichierMultimediaSerializer`, `SessionEtudeSerializer`, `ClasseDetailSerializer`
- `examens_serializers.py` : `ExamenSerializer`, `QuestionExamenSerializer`, `CopieExamenSerializer`, `ReponseExamenSerializer`, `LogSurveillanceSerializer`
- `boutique_serializers.py` : `RessourceBoutiqueSerializer`, `PanierSerializer`, `PanierItemSerializer`, `CommandeSerializer`
- `communications_serializers.py` : `ActualiteSerializer`, `NotificationSerializer`, `PartenaireSerializer`, `RenovationSerializer`
- `visioconference_serializers.py` : `SessionVisioSerializer`, `ParticipationVisioSerializer`, `QuestionVisioSerializer`
- `ia_serializers.py` : `RequestIASerializer`, `RecommandationSerializer`
- `etablissements_serializers.py` : `EtablissementSerializer`, `AdminEtablissementSerializer`

### Fichiers d'administration (admin.py)

Utilisation de `TranslationAdmin` de `modeltranslation` pour l'interface d'administration Django avec support multilingue :

```python
@admin.register(NiveauScolaire, Matiere, Chapitre, Lecon, ...)
class TranslatedModelAdmin(TranslationAdmin):
    pass
```

---

## 6. Frontend — Installation et codage

### Installation

```bash
# 1. Aller dans le dossier frontend
cd ENENI-main/frontend

# 2. Installer les dépendances Node
npm install

# 3. Lancer le serveur de développement
npm run dev  # → http://localhost:5173
# (Le proxy Vite redirige /api → http://localhost:8000)
```

### Configuration Vite

```javascript
// vite.config.js — Proxy API vers Django
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

### Architecture React — Arbre des composants

```
App.jsx (Router + ThemeProvider)
├── LandingPage.jsx (Page d'accueil publique)
├── LoginPage.jsx (Connexion avec sélecteur d'établissement + rôle)
└── ProtectedRoute (vérification du token)
    └── Navbar.jsx (Barre de navigation)
        ├── StudentDashboard.jsx (Dashboard élève)
        ├── TeacherDashboard.jsx (Dashboard enseignant)
        ├── AdminDashboard.jsx (Dashboard admin)
        ├── CoursesPage.jsx + CoursePlayer.jsx (Cours)
        ├── ExamsPage.jsx + ExamMode.jsx (Examens)
        ├── BulletinPage.jsx (Notes)
        ├── CorrectionsPage.jsx (Corrections enseignant)
        ├── LiveClass.jsx (Visio)
        ├── ShopPage.jsx (Boutique)
        └── components/
            ├── Feed/ (Stories.jsx, InfiniteScrollContainer.jsx, etc.)
            ├── Layout/Navbar.jsx
            ├── Exam/ExamMode.jsx (Interface d'examen)
            └── UI/ (ThemeSwitcher, LanguageSwitcher, VoiceInput, etc.)
```

### Routage (App.jsx)

```jsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
  <Route path="/dashboard" element={<RoleDashboard user={user} />} />
  <Route path="/courses" element={<CoursesPage user={user} />} />
  <Route path="/courses/:id" element={<CoursePlayer />} />
  <Route path="/exams" element={<ExamsPage user={user} />} />
  <Route path="/exams/:id" element={<ExamView />} />
  <Route path="/bulletin" element={<BulletinPage user={user} />} />
  <Route path="/corrections" element={<CorrectionsPage />} />
  <Route path="/shop" element={<ShopPage />} />
  <Route path="/live/:id" element={<LiveClass />} />
  <Route path="/admin/news" element={<AdminDashboard />} />
</Routes>
```

### Service API (Axios) — Intercepteurs

```javascript
// api.js — Configuration Axios

// Intercepteur REQUÊTE :
// 1. Ajoute Accept-Language (i18n)
// 2. Ajoute CSRF token (cookie)
// 3. Ajoute JWT Bearer token (sessionStorage)

// Intercepteur RÉPONSE :
// 1. Si 401 → tente un refresh token automatique
// 2. Si refresh échoue → redirige vers /login

// Modules d'API organisés par domaine :
// authAPI   : login, logout, me
// courseAPI : list, detail, chapitres, lecons, progress
// examAPI   : list, start, submit, timer, publier, questions
// shopAPI   : resources, addToCart, cart, checkout
// statsAPI  : getGlobal, getStudent, getTeacher
// notifAPI  : list, markRead, markAllRead, count
// newsAPI   : list, create, update, remove (multipart)
// notesAPI  : mesNotes, notesEnseignant
// liveAPI   : sessions, join, leave, raiseHand, questions, livekitToken
// teacherCourseAPI : chapitres, lecons, uploadFile, QCM
// correctionAPI : list, classes, matieres, noter, spellcheck
// sessionAPI : start, pause, resume, end, heartbeat
// publicAPI : search, getStats, getPartners, getRenovations
// classesAPI : list, get
```

### Connexion (LoginPage.jsx)

La page de connexion est la plus complexe avec :
1. **Sélecteur d'établissement** — Dropdown custom avec :
   - Barre de recherche
   - Filtres par type (LYCÉE/CEG/EPP)
   - Badges colorés par type
   - Animations Framer Motion
2. **Sélecteur de rôle** — 3 boutons (Élève/Enseignant/Admin)
3. **Champ identifiant** — S'adapte au rôle (numéro étudiant / email)
4. **Champ mot de passe** — Avec toggle visibilité

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await authAPI.login({
    username: form.identifier,
    password: form.password,
    role: form.role,
    establishment_id: form.establishment
  });
  sessionStorage.setItem('eneni_token', res.data.access);
  sessionStorage.setItem('eneni_refresh', res.data.refresh);
  onLogin?.(res.data?.user);
};
```

### Sécurité des examens (côté client)

Le hook `useExamSecurity` implémente :
- Plein écran forcé (`Fullscreen API`)
- Blocage clavier (Alt+F4, Ctrl+W, Echap, etc.)
- Blocage clic droit
- Blocage copier/coller
- Détection de sortie de fenêtre

Le hook `useSurveillance` journalise les changements d'onglet via API :
```javascript
// Détection de perte de focus
document.addEventListener('visibilitychange', () => {
  if (document.hidden) surveillanceAPI.logEvent(examId, 'TAB_SWITCH');
});
```

---

## 7. Structure détaillée du code backend

### Arborescence core/

```
core/
├── admin.py              # Interface Django Admin (TranslationAdmin)
├── apps.py               # Configuration app
├── auth_backends.py      # EmailOrUsernameModelBackend
├── models/
│   ├── __init__.py       # Import de tous les modèles
│   ├── base.py           # TimeStampedModel, SoftDeleteModel
│   ├── utilisateurs.py   # Utilisateur, Etudiant, Enseignant, AdminPlateforme
│   ├── etablissements.py # Etablissement, AdminEtablissement, Classe
│   ├── pedagogie.py      # NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia, ProgressionChapitre, SessionEtude
│   ├── examens.py        # Examen, QuestionExamen, CopieExamen, ReponseExamen, LogSurveillance
│   ├── boutique.py       # RessourceBoutique, Panier, PanierItem, Commande
│   ├── communications.py # Actualite, Notification, Partenaire, Renovation
│   ├── visioconference.py# SessionVisio, ParticipationVisio, QuestionVisio
│   └── intelligence_artificielle.py # RequestIA, Recommandation
├── views/
│   ├── __init__.py       # Export de toutes les vues
│   ├── utilisateurs_views.py     # 4 ViewSets + CustomTokenObtainPairView + LogoutView
│   ├── etablissements_views.py   # 2 ViewSets
│   ├── pedagogie_views.py        # 7 ViewSets + PublicSearchView (650 lignes — le plus gros)
│   ├── examens_views.py          # 5 ViewSets + 3 APIViews + CorrectionViewSet
│   ├── boutique_views.py         # 4 ViewSets
│   ├── communications_views.py   # 4 ViewSets
│   ├── visioconference_views.py  # 2 ViewSets (162 lignes)
│   ├── ia_views.py               # 2 ViewSets (122 lignes)
│   └── stats_views.py            # 3 APIViews
├── serializers/
│   ├── __init__.py       # Package
│   ├── base_serializers.py       # UtilisateurSerializer
│   ├── utilisateurs_serializers.py # 4 serializers + CustomTokenObtainPairSerializer
│   ├── etablissements_serializers.py
│   ├── pedagogie_serializers.py
│   ├── examens_serializers.py
│   ├── boutique_serializers.py
│   ├── communications_serializers.py
│   ├── visioconference_serializers.py
│   └── ia_serializers.py
├── services/
│   ├── __init__.py       # Export de tous les services
│   ├── trie_service.py   # NavigationTrie (arbre de recherche par préfixe)
│   ├── scoring_service.py# ScoringService (recommandations par performance)
│   ├── graph_service.py  # CurriculumGraph (graphe de trajectoire)
│   ├── voice_service.py  # VoiceCommandProcessor (NLP basique)
│   └── livekit_service.py# Génération de tokens LiveKit
├── permissions.py        # IsEnseignantOrReadOnly, IsAdminOrReadOnly, IsEtudiant
├── translation.py        # modeltranslation registration (14 modèles)
├── urls.py               # Toutes les routes API
└── management/commands/  # seed_schools.py, seed_all.py, check_credentials.py, update_credentials.py
```

### Détail des endpoints API

#### Authentification
```
POST   /api/auth/login/                      → CustomTokenObtainPairView
POST   /api/auth/logout/                     → LogoutView
POST   /api/auth/refresh/                    → TokenRefreshView
GET    /api/auth/me/                         → UserMeView
```

#### Utilisateurs
```
GET    /api/utilisateurs/                    → Liste
POST   /api/utilisateurs/                    → Création
GET    /api/utilisateurs/{id}/               → Détail
GET    /api/utilisateurs/actifs/             → Utilisateurs actifs
GET    /api/etudiants/                       → Liste étudiants
GET    /api/etudiants/top-points/            → Top points
POST   /api/etudiants/                       → Création étudiant
GET    /api/enseignants/                     → Liste enseignants
POST   /api/enseignants/                     → Création enseignant
GET    /api/admins-plateforme/               → Liste admins
```

#### Établissements
```
GET    /api/etablissements/                  → Liste (public, sans auth)
POST   /api/etablissements/                  → Création
GET    /api/etablissements/{id}/             → Détail
GET    /api/admin-etablissements/            → Admins établissement
GET    /api/classes/                         → Liste classes
GET    /api/classes/{id}/                    → Détail classe
```

#### Pédagogie
```
GET    /api/niveaux-scolaires/               → Liste niveaux
GET    /api/matieres/                        → Liste matières (filtrée par niveau, établissement)
GET    /api/matieres/{id}/chapitres/         → Chapitres d'une matière
GET    /api/chapitres/                       → Liste chapitres
POST   /api/chapitres/                       → Création chapitre
GET    /api/chapitres/{id}/                  → Détail chapitre
GET    /api/chapitres/{id}/lecons/           → Leçons d'un chapitre
POST   /api/chapitres/{id}/validate/         → Validation chapitre
GET    /api/chapitres/{id}/validation-question/ → Question de validation
GET    /api/chapitres/{id}/qcm-validation/   → QCM validation
POST   /api/chapitres/{id}/qcm-validation/   → Création QCM
DELETE /api/chapitres/{id}/qcm-validation/   → Suppression QCM
POST   /api/chapitres/upload_file/           → Upload fichier
GET    /api/lecons/                          → Liste leçons (filtrée par rôle)
POST   /api/lecons/                          → Création leçon
GET    /api/lecons/{id}/progress/            → Progression étudiant
GET    /api/lecons/enseignants/              → Leçons de l'enseignant
GET    /api/fichiers-multimedia/             → Liste fichiers
GET    /api/sessions-etude/                  → Sessions d'étude
POST   /api/courses/{pk}/session/start/      → Démarrer session
POST   /api/sessions/{pk}/pause/             → Pause session
POST   /api/sessions/{pk}/resume/            → Reprendre session
POST   /api/sessions/{pk}/end/               → Terminer session
POST   /api/sessions/{pk}/heartbeat/         → Heartbeat (toutes les 30s)

# Endpoints enseignant (gestion des cours)
GET    /api/teacher/chapitres/               → Liste chapitres (enseignant)
POST   /api/teacher/chapitres/               → Création chapitre
GET    /api/teacher/chapitres/{id}/          → Détail chapitre
PUT    /api/teacher/chapitres/{id}/          → Modification
DELETE /api/teacher/chapitres/{id}/          → Suppression
GET    /api/teacher/lecons/                  → Liste leçons (enseignant)
POST   /api/teacher/lecons/                  → Création leçon
PUT    /api/teacher/lecons/{id}/             → Modification
DELETE /api/teacher/lecons/{id}/             → Suppression
```

#### Examens
```
GET    /api/examens/                         → Liste (filtrée par rôle)
POST   /api/examens/                         → Création
GET    /api/examens/{id}/                    → Détail
GET    /api/examens/publies/                 → Examens publiés
POST   /api/examens/{id}/start/              → Démarrer examen
POST   /api/examens/{id}/submit/             → Soumettre examen
POST   /api/examens/{id}/soumettre/          → Alias soumission
POST   /api/examens/{id}/publier/            → Publier examen
POST   /api/examens/{id}/ajouter-question/   → Ajouter question
GET    /api/examens/{id}/questions/          → Questions
GET    /api/examens/{id}/timer/              → Timer restant
POST   /api/examens/{id}/logs/              → Log surveillance
GET    /api/examens/corrigeables/            → Examens à corriger
POST   /api/examens/{id}/corriger/{copie_id}/→ Corriger copie
GET    /api/questions-examen/                → Liste questions
GET    /api/copies-examen/                   → Liste copies
POST   /api/copies-examen/{id}/soumettre/    → Soumettre copie
GET    /api/reponses-examen/                 → Liste réponses
GET    /api/logs-surveillance/               → Logs surveillance
GET    /api/corrections/                     → Corrections (enseignant)
GET    /api/corrections/classes/             → Classes pour correction
GET    /api/corrections/matieres/            → Matières pour correction
POST   /api/corrections/{id}/noter/          → Noter copie
GET    /api/corrections/{id}/spellcheck/     → Vérification orthographe
GET    /api/mes-notes/                       → Bulletin étudiant
GET    /api/notes-enseignant/                → Notes enseignant
GET    /api/courses/{course_id}/files/{file_id}/download/ → Téléchargement
```

#### Boutique
```
GET    /api/boutique/                        → Ressources boutique
GET    /api/boutique/disponibles/            → Ressources disponibles
POST   /api/boutique/                        → Création ressource
GET    /api/panier/                          → Panier
POST   /api/panier/add/                      → Ajout au panier
GET    /api/panier-items/                    → Articles panier
GET    /api/commandes/                       → Commandes
POST   /api/commandes/                       → Passer commande
```

#### Communications
```
GET    /api/actualites/                      → Actualités (public)
POST   /api/actualites/                      → Création (admin)
GET    /api/actualites/infinite/             → Fil infini
GET    /api/notifications/                   → Notifications utilisateur
POST   /api/notifications/creer-visio/       → Notif visio
POST   /api/notifications/notifier-ban/      → Notif bannissement
PATCH  /api/notifications/lire/{id}/         → Marquer lue
POST   /api/notifications/tout-lire/         → Tout marquer lu
GET    /api/notifications/compte/            → Compte non lues
POST   /api/notifications/signaler-retard/   → Signaler retard
GET    /api/partenaires/                     → Partenaires (public)
GET    /api/renovations/                     → Rénovations (public)
```

#### Visioconférence
```
GET    /api/sessions-visio/                  → Sessions
POST   /api/sessions-visio/                  → Création
GET    /api/sessions-visio/{id}/             → Détail
POST   /api/sessions-visio/{id}/join/        → Rejoindre
POST   /api/sessions-visio/{id}/leave/       → Quitter
POST   /api/sessions-visio/{id}/raise-hand/  → Lever main
POST   /api/sessions-visio/{id}/lower-hand/  → Baisser main
GET    /api/sessions-visio/{id}/questions/   → Questions
POST   /api/sessions-visio/{id}/questions/   → Poser question
PATCH  /api/sessions-visio/{id}/questions/{qid}/answered/ → Marquer répondue
GET    /api/sessions-visio/{id}/livekit-token/ → Token LiveKit
POST   /api/sessions-visio/{id}/ban/         → Bannir
GET    /api/participations-visio/            → Participations
```

#### Statistiques
```
GET    /api/public/stats/                    → Stats globales (public)
GET    /api/stats/                           → Stats globales
GET    /api/stats/student/                   → Stats étudiant
GET    /api/stats/teacher/                   → Stats enseignant
```

#### Intelligence Artificielle
```
GET    /api/requetes-ia/                     → Requêtes IA
GET    /api/requetes-ia/recherche-rapide/    → Recherche Trie
GET    /api/requetes-ia/trajectoire/         → Trajectoire Graph
POST   /api/requetes-ia/commande-vocale/     → Commande vocale NLP
GET    /api/recommandations/                 → Recommandations
POST   /api/recommandations/generer/         → Générer recommandation
```

#### Public
```
GET    /api/public/search/                   → Recherche publique
GET    /api/public/partners/                 → Partenaires
GET    /api/public/renovations/              → Rénovations
GET    /api/public/stats/                    → Statistiques
```

---

## 8. Structure détaillée du code frontend

### Pages et leurs composants

| Page | Fichier | Composants utilisés | API consommée |
|------|---------|-------------------|---------------|
| **Landing** | `LandingPage.jsx` | Stories, InfiniteScrollContainer | publicAPI |
| **Login** | `LoginPage.jsx` | EstablishmentSelector (custom) | authAPI, publicAPI |
| **Dashboard Étudiant** | `StudentDashboard.jsx` | ProgressChart, Stories | statsAPI, courseAPI, examAPI |
| **Dashboard Enseignant** | `TeacherDashboard.jsx` | ProgressChart, TeacherCourseManager | statsAPI, teacherCourseAPI |
| **Dashboard Admin** | `AdminDashboard.jsx` | NotificationForm | newsAPI |
| **Cours** | `CoursesPage.jsx` + `CoursePlayer.jsx` | RichTextEditor, VoiceInput | courseAPI, sessionAPI |
| **Examens** | `ExamsPage.jsx` + `ExamMode.jsx` | useExamSecurity, useSurveillance | examAPI, surveillanceAPI |
| **Bulletin** | `BulletinPage.jsx` | — | notesAPI |
| **Corrections** | `CorrectionsPage.jsx` | — | correctionAPI |
| **Visio** | `LiveClass.jsx` | VisioGrid | liveAPI, visioAPI |
| **Boutique** | `ShopPage.jsx` | — | shopAPI |

### Hooks personnalisés

| Hook | Fichier | Fonction |
|------|---------|----------|
| **useAuth** | `hooks/useAuth.js` | Vérification du token, rafraîchissement |
| **useNotifications** | `hooks/useNotifications.js` | Polling des notifications non lues |
| **useSpeech** | `hooks/useSpeech.js` | Speech-to-Text (Web Speech API) |
| **useSurveillance** | `hooks/useSurveillance.js` | Détection de changement d'onglet, log API |
| **useFullscreen** | `hooks/useFullscreen.js` | Plein écran forcé |
| **useCourseTimer** | `hooks/useCourseTimer.js` | Chronomètre d'étude avec heartbeat |
| **useExamSecurity** | `hooks/useExamSecurity.js` | Blocage clavier, clic droit, copie |

### Internationalisation

```javascript
// i18n.js — 3 langues supportées
i18n.use(initReactI18next).init({
  resources: { en, fr, mg },
  lng: localStorage.getItem('eneni_lang') || 'fr',
  fallbackLng: 'fr',
});
```

Les fichiers de traduction sont dans `src/locales/{fr,en,mg}/translation.json`.

### Thème

Le `ThemeContext` supporte 3 thèmes : **green** (défaut), **dark**, **light**. Le thème est stocké dans `localStorage` (`eneni_theme`).

---

## 9. Services intelligents (IA)

### NavigationTrie — Recherche par préfixe

```python
# trie_service.py — Arbre de recherche ultra-rapide
# Singleton : reste en mémoire vive entre les requêtes
# Initialisation : charge toutes les matières, chapitres, leçons dans l'arbre
# Recherche : O(k) où k = longueur du préfixe

trie = NavigationTrie()         # Instance singleton
trie.initialize_from_db()       # Chargement en mémoire
results = trie.search_prefix("math")  # → [{type: "matiere", id: 1, nom: "Mathématiques"}, ...]
```

Algorithme : **Arbre Trie (Prefix Tree)** avec parcours DFS pour collecter les résultats.

### CurriculumGraph — Trajectoire d'apprentissage

```python
# graph_service.py — Graphe orienté des leçons
# Construction : ordre linéaire chapitre → leçon
# Chaque leçon pointe vers la suivante (graphe simple)

graph = CurriculumGraph(matiere_id=1)
next_step = graph.find_next_step(lecon_id=5)  # → {id: 6, metadata: {...}}
full_path = graph.get_full_path(lecon_id=5)   # → [{id:5,...}, {id:6,...}, ...]
```

Algorithme : **Liste d'adjacence** basée sur l'ordre des chapitres et leçons.

### ScoringService — Recommandations personnalisées

```python
# scoring_service.py — Analyse des performances
# Calcule la moyenne des 5 dernières copies d'un étudiant pour une matière
# Si moyenne < 10/20 → recommande la leçon fondamentale

reco = ScoringService.analyser_et_recommander(etudiant, matiere)
# → Recommandation avec score_pertinence = max(0.1, 1.0 - moyenne/20)
```

Algorithme : **Scoring pondéré** — seuil de réussite à 10/20.

### VoiceCommandProcessor — NLP basique

```python
# voice_service.py — Traitement du langage naturel
# Reconnaissance d'intention par expressions régulières
# 4 intentions : OUVRIR_LECON, PASSER_EXAMEN, NAVIGATION_GLOBALE, BOUTIQUE

resultat = VoiceCommandProcessor.process("ouvrir la leçon de maths")
# → {action: "NAVIGATE_LECON", target_id: 3, feedback: "Ouverture de la leçon : ..."}
```

Algorithme : **Pattern matching** (Regex) + recherche en base de données pour l'extraction d'entités.

### LiveKit Service — Génération de tokens

```python
# livekit_service.py — Génére un token JWT pour la visioconférence WebRTC
# Utilise la bibliothèque livekit-api

token = generate_livekit_token(identity="1-jean", room="session-42", is_publisher=True)
# Le token permet de rejoindre une salle LiveKit avec des droits spécifiques
```

---

## 10. Tests

### Backend — 222 tests unitaires

| Fichier | Tests | Description |
|---------|-------|-------------|
| `test_enseignant_model.py` | 11 | Création enseignant, relations, contraintes |
| `test_enseignant_views.py` | 14 | Endpoints enseignant (CRUD, permissions) |
| `test_enseignant_serializers.py` | 12 | Validation sérialiseurs enseignant |
| `test_enseignant_pedagogie.py` | 30 | Gestion des cours (chapitres, leçons, upload) |
| `test_enseignant_examens.py` | 16 | Création, publication, soumission, correction examens |
| `test_enseignant_stats.py` | 9 | Statistiques enseignant |
| `test_etudiant.py` | 58 | Profil étudiant, cours, examens, progression |
| `test_etablissement.py` | 24 | Établissements, classes, admins établissement |
| `test_boutique.py` | 16 | Ressources boutique, panier, commandes |
| `test_communications.py` | 31 | Actualités, notifications, partenaires, endpoints publics |
| `test_permissions.py` | 13 | Permissions personnalisées (IsEnseignantOrReadOnly, etc.) |
| **Total** | **222** | |

Exécution :
```bash
cd Backend
python manage.py test core.tests --settings=ENENI.test_settings -v 2
# ou via pytest
python -m pytest core/tests/ -v
```

### Frontend — 15 tests E2E Playwright

| Fichier | Tests | Description |
|---------|-------|-------------|
| `teacher.spec.js` | 6 | Login teacher, dashboard, cours, examens, corrections, navigation |
| `student.spec.js` | 6 | Login student, dashboard, bulletin, boutique, cours, examens |
| `admin.spec.js` | 3 | Login admin, dashboard, bouton nouvelle publication |

Exécution :
```bash
cd frontend/tests/e2e
bash run_e2e.sh
```

Le script `run_e2e.sh` :
1. Configure les données de test (via `setup_test_data.py`)
2. Démarre le backend Django sur le port 8000
3. Démarre le frontend Vite sur le port 5173
4. Attend que les deux serveurs soient prêts
5. Exécute les tests Playwright avec `npx playwright test`
6. Nettoie les processus

### Usine à données (Factories)

Fichier `core/tests/factories.py` :
- Utilise des compteurs auto-incrémentés pour générer des données uniques
- Crée automatiquement les dépendances (ex: créer une classe crée aussi son établissement et son niveau)
- Supporte tous les modèles principaux

```python
class Factory:
    etablissement_counter = 1
    niveau_counter = 1
    chapitre_counter = 1
    lecon_counter = 1
    etudiant_counter = 1
```

---

## 11. Guide de déploiement

### Prérequis

- Python 3.12+
- Node.js 18+
- NPM
- SQLite (développement) ou PostgreSQL/MySQL (production)
- LiveKit Server (optionnel, pour visio)

### Installation complète

```bash
# 1. Backend
cd Backend
python3 -m venv venv
source venv/bin/activate
pip install Django==6.0.3 djangorestframework djangorestframework-simplejwt django-modeltranslation==0.19.12 livekit-api
python manage.py migrate
python manage.py seed_all  # Génère les données de démonstration
python manage.py runserver &

# 2. Frontend
cd ../frontend
npm install
npm run dev &
```

### Production

Pour la production, les modifications nécessaires sont :

1. **Base de données** : Passer de SQLite à PostgreSQL dans `settings.py`
2. **Static/Media files** : Configurer un CDN ou un serveur de fichiers (Nginx/Apache)
3. **Sécurité** : Mettre `DEBUG=False`, configurer `ALLOWED_HOSTS`, HTTPS
4. **LiveKit** : Déployer un serveur LiveKit et configurer les clés API
5. **Build frontend** : `npm run build` → sert les fichiers statiques via Nginx

### Variables d'environnement

```
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://livekit.example.com
VITE_API_URL=https://api.eneni.mg
```
