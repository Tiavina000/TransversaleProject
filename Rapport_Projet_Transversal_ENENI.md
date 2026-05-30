# Rapport de Projet Transversal L2SIO

## Plateforme Éducative Numérique ENENI

---

# Sommaire

1. Résumé et Abstract
2. Introduction
3. Analyse et conception
4. Réalisation
5. Résultats
6. Conclusion
7. Bibliographie
8. Annexes
9. Table des matières

---

# 1. Résumé et Abstract

## A. Résumé

La gestion de l'éducation numérique à Madagascar fait face à de nombreux défis : absence de plateforme centralisée, difficultés de suivi des apprentissages, et manque d'outils adaptés aux besoins des établissements scolaires. Le projet ENENI répond à cette problématique en proposant une plateforme éducative numérique complète destinée aux écoles malgaches (lycées, CEG, EPP). Développée avec Django REST Framework en backend et React.js en frontend, la plateforme intègre la gestion des cours, des examens avec surveillance anti-triche, de la visioconférence, d'une boutique de ressources pédagogiques, d'un fil d'actualités, et d'un système de recommandations basé sur l'intelligence artificielle. Le résultat est une solution fonctionnelle couvrant 21 fonctionnalités clés (R1 à R21), avec une interface responsive, multilingue (malgache, français, anglais) et accessible. Ce projet démontre la faisabilité d'un outil numérique adapté au contexte éducatif malgache.

**Mots-clés :** Django, React, Éducation numérique, API REST, Gestion d'examens, Visioconférence, Intelligence Artificielle, Madagascar

## B. Abstract

The management of digital education in Madagascar faces numerous challenges: lack of a centralized platform, difficulties in tracking learning progress, and absence of tools adapted to schools' needs. The ENENI project addresses this issue by providing a comprehensive digital education platform for Malagasy schools (high schools, CEG, EPP). Developed with Django REST Framework as backend and React.js as frontend, the platform integrates course management, exam proctoring with anti-cheating measures, video conferencing, an educational resource shop, a news feed, and an AI-based recommendation system. The result is a functional solution covering 21 key features (R1 to R21), with a responsive, multilingual (Malagasy, French, English) and accessible interface. This project demonstrates the feasibility of a digital tool adapted to the Malagasy educational context.

**Keywords:** Django, React, Digital Education, REST API, Exam Management, Video Conferencing, Artificial Intelligence, Madagascar

---

# 2. Introduction

## A. Contexte général

Madagascar compte des milliers d'établissements scolaires publics et privés — lycées, collèges d'enseignement général (CEG), écoles primaires publiques (EPP) — répartis sur l'ensemble du territoire. La transformation numérique de l'éducation est devenue une priorité nationale, comme en témoignent les partenariats avec des organisations internationales (UNICEF, AFD, UNESCO, etc.). Cependant, les outils numériques adaptés au contexte local restent rares, et la plupart des établissements ne disposent pas d'une plateforme intégrée pour la gestion des cours, des examens et du suivi pédagogique.

## B. Problématique

Comment concevoir et développer une plateforme éducative numérique centralisée qui permette aux établissements scolaires malgaches de gérer efficacement les cours, les examens, les visioconférences et le suivi des apprentissages, tout en garantissant la sécurité, l'accessibilité et l'adaptation au contexte local ?

## C. Objectifs

**Objectif général :** Développer une plateforme éducative numérique complète et fonctionnelle pour les établissements scolaires malgaches.

**Objectifs spécifiques :**
- Mettre en place un système d'authentification multiniveau (étudiant, enseignant, administrateur) avec liaison institutionnelle
- Permettre la gestion de contenu pédagogique (cours, chapitres, leçons, fichiers multimédia)
- Implémenter un système d'examens avec différents types de questions et surveillance anti-triche
- Intégrer la visioconférence pour les cours à distance
- Créer une boutique de ressources pédagogiques numériques
- Développer un système de recommandations par intelligence artificielle
- Assurer le multilingue (malgache, français, anglais) et l'accessibilité

## D. Structure du rapport

Ce rapport est organisé en cinq parties principales. La première partie présente l'analyse des besoins et la modélisation UML du système. La deuxième partie détaille la réalisation technique, incluant les technologies utilisées et l'architecture. La troisième partie expose les résultats obtenus à travers des scénarios concrets. La quatrième partie propose des perspectives d'amélioration. Enfin, la conclusion fait le bilan des apprentissages et de l'utilité du projet.

---

# 3. Analyse et conception

## 3.1 Analyse des besoins

### A. Les utilisateurs (acteurs)

Le système identifie trois types d'acteurs principaux :

1. **Administrateur de plateforme** : Gère l'ensemble du système, les établissements et les utilisateurs.
2. **Administrateur d'établissement** : Gère les utilisateurs et les contenus de son établissement.
3. **Enseignant** : Crée et gère les cours, les examens, et anime les visioconférences.
4. **Étudiant** : Consulte les cours, passe les examens, participe aux visioconférences, achète des ressources.

### B. Leurs besoins

| Acteur | Besoins |
|--------|---------|
| Administrateur plateforme | Gérer les établissements, les utilisateurs, les paramètres globaux |
| Administrateur établissement | Gérer les classes, les enseignants, les étudiants de son école |
| Enseignant | Créer des cours/chapitres/leçons, concevoir des examens, corriger les copies, animer des visios |
| Étudiant | Suivre des cours, passer des examens, consulter ses notes, participer aux visios, acheter des ressources |

### C. Types de besoins

**Besoins fonctionnels :**
- Authentification et gestion des utilisateurs avec rôles
- Gestion des établissements et classes
- Création et consultation de contenu pédagogique (cours, chapitres, leçons)
- Système d'examens (QCM, texte, rédaction, mixte) avec auto-correction
- Visioconférence avec interaction en temps réel
- Boutique de ressources numériques avec panier et commandes
- Fil d'actualités et notifications
- Recommandations par IA

**Besoins non fonctionnels :**
- Sécurité : authentification JWT, protection anti-triche aux examens
- Performance : chargement optimisé, pagination, défilement infini
- Accessibilité : support du texte vocal (TTS/STT), contraste adapté
- Portabilité : interface responsive, multilingue (MG/FR/EN)
- Maintenabilité : architecture modulaire (modèles, sérialiseurs, vues séparés)

## 3.2 Fonctionnalités à implémenter

Le projet couvre 21 fonctionnalités (R1 à R21) :

| Réf. | Fonctionnalité | Description |
|------|---------------|-------------|
| R1 | Authentification | Connexion multiniveau avec sélection établissement + rôle + identifiants, JWT |
| R2 | Dashboard étudiant | Tableau de bord avec progression, matières, notifications |
| R3 | Landing page | Page d'accueil publique avec statistiques et partenaires |
| R4 | Navigation | Barre de navigation responsive avec thèmes et langue |
| R5 | Dashboard professeur | Tableau de bord enseignant avec classes et matières |
| R6 | Gestion cours enseignant | CRUD des chapitres et leçons par l'enseignant |
| R7 | Upload fichiers | Gestion des fichiers multimédia (vidéo, audio, PDF) |
| R8 | Visioconférence | Sessions live avec flux WebRTC, main levée, questions |
| R9 | Notifications | Alertes et rappels (examens, visios, etc.) |
| R10 | Création examens | Examens avec types QCM, texte, rédaction, mixte |
| R11 | Auto-correction | Correction automatique QCM/Vrai-Faux |
| R12 | Correction manuelle | Interface de correction pour les enseignants |
| R13 | Gestion des apprenants | Suivi des étudiants par l'enseignant |
| R14 | Navigation cours étudiant | Parcours des chapitres et leçons |
| R15 | Progrès étudiant | Suivi du temps d'étude et progression |
| R16 | Examen étudiant | Passage d'examen en mode plein écran |
| R17 | Sécurité examen | Anti-triche (blocage clavier, plein écran, logs) |
| R18 | Minuteur synchronisé | Compte à rebours synchronisé pour les examens |
| R19 | Soumission examen | Soumission automatique et manuelle des copies |
| R20 | Bulletin de notes | Consultation des notes par matière et moyenne |
| R21 | Boutique | Achat de ressources pédagogiques numériques |

## 3.3 Modélisation du système

### A. Diagramme de cas d'utilisation (Use Case)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLATEFORME ENENI                              │
│                                                                  │
│  ┌──────────────┐                                               │
│  │  Administrateur│────┐                                        │
│  │  Plateforme   │    │  ┌───────────────────┐                  │
│  └──────────────┘    ├──│ Gérer établissements│                 │
│                       │  └───────────────────┘                  │
│                       │  ┌───────────────────┐                  │
│                       ├──│ Gérer utilisateurs │                 │
│                       │  └───────────────────┘                  │
│  ┌──────────────┐    │                                          │
│  │Admin Établis- │────┤  ┌───────────────────┐                  │
│  │sement        │    ├──│ Gérer classes      │                 │
│  └──────────────┘    │  └───────────────────┘                  │
│                       │  ┌───────────────────┐                  │
│                       ├──│ Gérer enseignants  │                 │
│                       │  └───────────────────┘                  │
│  ┌──────────────┐    │                                          │
│  │ Enseignant   │────┤  ┌───────────────────┐                  │
│  └──────────────┘    ├──│ Créer cours        │                 │
│                       │  └───────────────────┘                  │
│                       │  ┌───────────────────┐                  │
│                       ├──│ Créer examens      │                 │
│                       │  └───────────────────┘                  │
│                       │  ┌───────────────────┐                  │
│                       ├──│ Corriger copies    │                 │
│                       │  └───────────────────┘                  │
│                       │  ┌───────────────────┐                  │
│                       ├──│ Animer visio       │                 │
│                       │  └───────────────────┘                  │
│  ┌──────────────┐    │                                          │
│  │  Étudiant    │────┤  ┌───────────────────┐                  │
│  └──────────────┘    ├──│ Consulter cours    │                 │
│                       │  └───────────────────┘                  │
│                       │  ┌───────────────────┐                  │
│                       ├──│ Passer examen      │                 │
│                       │  └───────────────────┘                  │
│                       │  ┌───────────────────┐                  │
│                       ├──│ Voir bulletin      │                 │
│                       │  └───────────────────┘                  │
│                       │  ┌───────────────────┐                  │
│                       ├──│ Participer visio   │                 │
│                       │  └───────────────────┘                  │
│                       │  ┌───────────────────┐                  │
│                       └──│ Acheter ressources │                 │
│                          └───────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

*[Insérer ici l'image du diagramme de cas d'utilisation]*

### B. Diagramme de séquence — Réservation d'examen

```
Étudiant                Frontend React             API Django              Base de données
    │                        │                        │                        │
    │── 1. Se connecte ──────│                        │                        │
    │                        │── 2. POST /api/auth/login/ ──│                 │
    │                        │                        │── 3. Vérifie identifiants ──│
    │                        │                        │── 4. Retourne JWT ────│
    │                        │── 5. Stocke token ────│                        │
    │                        │                        │                        │
    │── 6. Accède aux examens │                        │                        │
    │                        │── 7. GET /api/examens/ ──│                     │
    │                        │                        │── 8. SELECT examens ──│
    │                        │── 9. Retourne liste ──│                        │
    │                        │                        │                        │
    │── 10. Lance examen ───│                        │                        │
    │                        │── 11. POST /api/copies-examen/ ──│            │
    │                        │                        │── 12. INSERT copie ──│
    │                        │── 13. Retourne copie ─│                        │
    │                        │                        │                        │
    │── 14. Répond questions ─│                       │                        │
    │                        │── 15. POST /api/reponses-examen/ ──│          │
    │                        │                        │── 16. INSERT réponse ─│
    │                        │                        │                        │
    │── 17. Soumet copie ───│                        │                        │
    │                        │── 18. POST /copies/{id}/soumettre/ ──│        │
    │                        │                        │── 19. Calcule note ──│
    │                        │── 20. Retourne note ──│                        │
    │                        │                        │                        │
```

*[Insérer ici l'image du diagramme de séquence]*

### C. Diagramme de classes

```
┌─────────────────────┐       ┌──────────────────────────┐
│    Utilisateur       │       │    TimeStampedModel       │
│  - id (PK)           │       │  (abstract)               │
│  - username          │       │  - date_creation          │
│  - prenom            │       │  - date_modification      │
│  - email             │◄──────│                           │
│  - type_utilisateur  │       └──────────────────────────┘
│  - langue_preferee   │
│  - options_accessibilite│     ┌──────────────────────────┐
│  - photo_profil      │       │    SoftDeleteModel        │
│  - est_actif         │◄──────│  (abstract)               │
│  - date_suppression  │       │  - est_actif              │
└────────┬────────────┘       │  - date_suppression       │
         │                    └──────────────────────────┘
         │
    ┌────┼────────────────────┐
    │    │                    │
    ▼    ▼                    ▼
┌───────────┐ ┌───────────┐ ┌──────────────┐
│ Étudiant  │ │Enseignant │ │AdminPlateforme│
│(OneToOne) │ │(OneToOne) │ │ (OneToOne)    │
├───────────┤ ├───────────┤ ├──────────────┤
│-numero    │ │-specialite│ │-niveau_acces │
│ etudiant  │ │-date_emb.│ │               │
│-points    │ │-niveau   │ │               │
│ global    │ └─────┬─────┘ └──────────────┘
│-niveau    │       │
│-classe    │       │ 1
│-établies. │       ├────────────┐
└──────┬────┘       │            │
       │            │            │
       │ N          │            │
┌──────┴──────┐    │            │
│ Progression │    │ 1          │ N
│ Chapitre    │    │            │
├─────────────┤    ▼            ▼
│-temps passé │ ┌────────┐ ┌──────────┐
│-est_valide  │ │Chapitre│ │ Examen   │
└─────────────┘ ├────────┤ ├──────────┤
                │-titre  │ │-titre    │
┌───────────┐   │-order  │ │-type     │
│SessionEtude│  │-matière│ │-durée    │
├───────────┤   └───┬────┘ │-coeff    │
│-statut    │       │      │-dates    │
│-temps_cum.│       │ N    └─────┬────┘
└───────────┘       │            │
                    ▼            ▼
               ┌────────┐ ┌──────────────┐
               │ Leçon  │ │QuestionExamen│
               ├────────┤ ├──────────────┤
               │-titre  │ │-texte        │
               │-ordre  │ │-type_question│
               │-contenu│ │-points       │
               │-durée  │ │-options      │
               └────┬───┘ │-reponse_corr │
                    │     └──────┬───────┘
               ┌────┴───┐       │
               │Fichier │       │ N
               │Multimédia│     │
               ├────────┤      │
               │-type   │      ▼
               │-url    │ ┌──────────┐
               │-format │ │CopieExam.│
               └────────┘ ├──────────┤
                         │-note     │
┌──────────┐  ┌────────┐ │-terminée │
│Etablisse.│  │ Classe │ └────┬─────┘
├──────────┤  ├────────┤      │
│-nom      │  │-nom    │      ▼
│-type     │  │-niveau │ ┌──────────┐ ┌──────────────┐
│-adresse  │  └────────┘ │Réponse   │ │LogSurveillance│
│-code     │             │Examen    │ ├──────────────┤
└──────────┘             ├──────────┤ │-evenement    │
                         │-reponse  │ │-détails      │
┌──────────┐  ┌────────┐ │-correct  │ └──────────────┘
│Niveau    │  │Matière │ │-points   │
│Scolaire  │  ├────────┤ └──────────┘
├──────────┤  │-nom    │
│-nom      │  │-code   │
│-ordre    │  └────────┘
└──────────┘
```

*[Insérer ici l'image du diagramme de classes]*

---

# 4. Réalisation

## 4.1 Technologies utilisées

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Python | 3.x | Langage de programmation |
| Django | 6.0.3 | Framework web backend |
| Django REST Framework | 3.x | Création d'API REST |
| PostgreSQL | 16.x | Base de données |
| djangorestframework-simplejwt | - | Authentification JWT |
| django-modeltranslation | - | Internationalisation des modèles |

**Choix justifiés :** Django a été choisi pour sa rapidité de développement, sa sécurité intégrée (CSRF, XSS, SQL injection), et son ORM puissant. DRF permet de construire des API REST robustes avec un minimum de code grâce aux ViewSets et ModelSerializers.

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19.2.5 | Bibliothèque d'interface utilisateur |
| Vite | 8.0.10 | Outil de build et développement |
| Tailwind CSS | 3.4.19 | Framework CSS utilitaire |
| React Router DOM | 7.14.2 | Routage côté client |
| Axios | 1.15.2 | Client HTTP |
| Framer Motion | 12.38.0 | Animations |
| i18next / react-i18next | 26.x / 17.x | Internationalisation |
| Lucide React | 1.14.0 | Icônes |

**Choix justifiés :** React a été choisi pour sa composabilité et son écosystème riche. Vite offre un rechargement à chaud extrêmement rapide. Tailwind CSS permet un développement d'interface rapide et cohérent.

### Outils de développement

| Outil | Rôle |
|-------|------|
| VS Code | Éditeur de code |
| Git / GitHub | Gestion de version |
| Postman | Test des API REST |
| ESLint | Linting du code frontend |

## 4.2 Structure des dossiers

### Backend

```
Backend/
├── ENENI/                          # Configuration Django
│   ├── settings.py                 # Configuration (DRF, i18n, etc.)
│   ├── urls.py                     # Routage principal
│   ├── wsgi.py
│   └── asgi.py
│
├── core/                           # Application principale
│   ├── models/                     # Modèles de données
│   │   ├── base.py                 # Classes abstraites (TimeStampedModel)
│   │   ├── utilisateurs.py         # Utilisateur, Étudiant, Enseignant
│   │   ├── etablissements.py       # Établissement, Classe
│   │   ├── pedagogie.py            # Niveau, Matière, Chapitre, Leçon
│   │   ├── examens.py              # Examen, Question, Copie, Réponse
│   │   ├── visioconference.py      # SessionVisio, Participation
│   │   ├── boutique.py            # Ressource, Panier, Commande
│   │   ├── communications.py       # Actualité, Notification
│   │   └── intelligence_artificielle.py # RequêteIA, Recommandation
│   │
│   ├── serializers/                # Transformation Modèle ↔ JSON
│   ├── views/                      # Logique des endpoints API
│   ├── urls.py                     # Routage des API (/api/...)
│   ├── permissions.py              # Permissions personnalisées
│   ├── auth_backends.py            # Backend d'authentification
│   └── admin.py                    # Interface d'administration
│
├── documentation/                  # Documentation du projet
│   ├── ARCHITECTURE.md
│   ├── API_REST_DOCUMENTATION.md
│   └── GUIDE_IMPLEMENTATION.md
│
├── locale/                         # Fichiers de traduction (.po/.mo)
├── manage.py                       # Point d'entrée Django
└── (PostgreSQL)                   # Base de données
```

*[Insérer ici la capture d'écran de l'arborescence du backend]*

### Frontend

```
frontend/
├── src/
│   ├── main.jsx                    # Point d'entrée React
│   ├── App.jsx                     # Composant racine (routage)
│   ├── index.css                   # Styles globaux Tailwind
│   ├── i18n.js                     # Configuration i18next
│   │
│   ├── pages/                      # Pages principales
│   │   ├── LandingPage.jsx         # Page d'accueil publique
│   │   ├── LoginPage.jsx           # Connexion multiniveau
│   │   ├── CoursesPage.jsx         # Catalogue cours
│   │   ├── CoursePlayer.jsx        # Lecteur de cours
│   │   ├── ExamsPage.jsx           # Planning examens
│   │   ├── BulletinPage.jsx        # Bulletin de notes
│   │   ├── LiveClass.jsx           # Visioconférence
│   │   ├── ShopPage.jsx            # Boutique
│   │   └── CorrectionsPage.jsx     # Correction examens
│   │
│   ├── components/                 # Composants réutilisables
│   │   ├── Layout/Navbar.jsx       # Barre de navigation
│   │   ├── Feed/                   # Dashboards
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── Exam/ExamMode.jsx       # Mode examen plein écran
│   │   └── UI/                     # Composants d'interface
│   │
│   ├── context/ThemeContext.jsx     # Gestion des thèmes
│   ├── hooks/                      # Hooks personnalisés
│   ├── services/api.js             # Client Axios avec intercepteurs
│   └── locales/                    # Fichiers de traduction
│       ├── fr/translation.json
│       ├── mg/translation.json
│       └── en/translation.json
│
├── public/                         # Fichiers statiques
├── package.json
└── vite.config.js
```

*[Insérer ici la capture d'écran de l'arborescence du frontend]*

## 4.3 Structure de la base de données

La base de données est composée de 9 modules de modèles principaux :

### Tables principales

| Table | Description | Champs clés |
|-------|-------------|-------------|
| core_utilisateur | Utilisateurs (AbstractUser étendu) | id, username, email, type_utilisateur, langue_preferee |
| core_etudiant | Profils étudiants | id, utilisateur_id (FK), etablissement_id, numero_etudiant, points_global |
| core_enseignant | Profils enseignants | id, utilisateur_id (FK), etablissement_id, specialite |
| core_adminplateforme | Administrateurs | id, utilisateur_id (FK), niveau_acces |
| core_etablissement | Établissements scolaires | id, nom, type (LYCEE/CEG/EPP/AUTRE), code_etablissement |
| core_classe | Classes | id, nom, niveau_id (FK), etablissement_id (FK) |
| core_niveauscolaire | Niveaux scolaires | id, nom (CP à Terminale), ordre |
| core_matiere | Matières | id, nom, code, niveaux (M2M) |
| core_chapitre | Chapitres de cours | id, titre, matiere_id (FK), niveau_id (FK), createur_id (FK) |
| core_lecon | Leçons | id, titre, chapitre_id (FK), contenue_texte, duree_estimee |
| core_fichiermultimedia | Fichiers (vidéo/audio/PDF) | id, type_fichier, url_fichier, lecon_id (FK) |
| core_examen | Examens | id, titre, enseignant_id (FK), matiere_id, duree_minutes, type_examen |
| core_questionexamen | Questions d'examen | id, examen_id (FK), texte, type_question, points, reponse_correcte |
| core_copieexamen | Copies d'examen | id, examen_id (FK), etudiant_id (FK), note_obtenue |
| core_reponseexamen | Réponses aux questions | id, copie_id (FK), question_id (FK), reponse_etudiant |
| core_logsurveillance | Logs anti-triche | id, copie_id (FK), evenement, details (JSON) |
| core_sessionvisio | Sessions visioconférence | id, titre, enseignant_id (FK), lecon_id (FK), url_visio |
| core_ressourceboutique | Ressources boutique | id, titre, prix, type_contenu, fichier_id (FK) |
| core_actualite | Actualités | id, titre, contenu, categorie, auteur_id (FK) |
| core_notification | Notifications | id, utilisateur_id (FK), titre, message, est_lue |
| core_requestia | Requêtes IA | id, etudiant_id (FK), request, reponse, type_requete |
| core_recommandation | Recommandations | id, etudiant_id (FK), lecon_id (FK), score_pertinence |

### Relations principales

- **Utilisateur** 1──1 **Étudiant** / **Enseignant** / **AdminPlateforme**
- **Établissement** 1──N **Classe** / **Étudiant** / **Enseignant**
- **NiveauScolaire** N──M **Matière**
- **Matière** 1──N **Chapitre**
- **Chapitre** 1──N **Leçon** 1──N **FichierMultimedia**
- **Examen** 1──N **QuestionExamen**
- **Examen** 1──N **CopieExamen** 1──N **RéponseExamen** / **LogSurveillance**
- **Étudiant** 1──N **ProgressionChapitre** / **SessionEtude**

*[Insérer ici la capture d'écran du schéma de la base de données]*

---

# 5. Résultats

## 5.1 Résultats obtenus

### Scénario 1 : Authentification multiniveau

**Description :** L'utilisateur se connecte en sélectionnant d'abord son établissement, puis son rôle (étudiant, enseignant, administrateur), et enfin ses identifiants (matricule ou nom d'utilisateur + mot de passe).

**Résultat :** L'authentification JWT fonctionne avec des tokens d'accès (24h) et de refresh (7 jours). La redirection se fait vers le dashboard correspondant au rôle.

**Capture :** *[Insérer ici la capture d'écran de la page de connexion]*

### Scénario 2 : Consultation de cours

**Description :** L'étudiant navigue dans le catalogue de cours, sélectionne une matière, parcourt les chapitres et lit les leçons avec leurs fichiers multimédia.

**Résultat :** L'affichage des cours est structuré par niveau et matière. Les leçons s'affichent avec leur contenu texte et les fichiers vidéo/audio/PDF associés. Le temps d'étude est suivi via des sessions avec heartbeat (30s).

**Capture :** *[Insérer ici la capture d'écran du lecteur de cours]*

### Scénario 3 : Passage d'examen

**Description :** L'étudiant lance un examen depuis le planning. Le système active le mode plein écran, bloque les raccourcis clavier (F12, Ctrl+C/V/U, PrintScreen, Alt+Tab), désactive le clic droit, et journalise toute tentative de triche.

**Résultat :** L'examen s'affiche avec un minuteur synchronisé. Les questions QCM sont auto-corrigées. Les réponses texte sont soumises avec comptage de mots et vérification orthographique. À la soumission, la note est calculée automatiquement.

**Capture :** *[Insérer ici la capture d'écran du mode examen]*

### Scénario 4 : Visioconférence

**Description :** L'enseignant crée une session de visioconférence liée à une leçon. Les étudiants rejoignent la session, peuvent lever la main, poser des questions, et l'enseignant peut gérer les participants.

**Résultat :** La visioconférence fonctionne avec flux média réel. Les fonctionnalités de main levée, questions/réponses et bannissement sont opérationnelles.

**Capture :** *[Insérer ici la capture d'écran de la visioconférence]*

### Scénario 5 : Bulletin de notes

**Description :** L'étudiant consulte son bulletin avec les notes par matière, les coefficients, et la moyenne générale.

**Résultat :** Le bulletin affiche l'ensemble des examens passés avec les notes obtenues, les moyennes par matière, et la moyenne générale. L'export PDF est disponible.

**Capture :** *[Insérer ici la capture d'écran du bulletin de notes]*

### Scénario 6 : Administration

**Description :** L'administrateur gère les établissements, les utilisateurs, les classes, et les paramètres du système.

**Résultat :** L'interface d'administration permet la gestion complète des entités du système avec recherche, filtrage et pagination.

**Capture :** *[Insérer ici la capture d'écran du dashboard admin]*

## 5.2 Perspectives d'amélioration

### Amélioration 1 : Notifications par email et SMS
Implémenter l'envoi de notifications par email et SMS pour les rappels d'examens, les nouveaux cours, et les communications importantes.

### Amélioration 2 : Application mobile
Développer une application mobile React Native pour permettre l'accès à la plateforme depuis les smartphones, particulièrement adaptée au contexte malgache où le mobile est prédominant.

### Amélioration 3 : Intelligence Artificielle avancée
Renforcer le système d'IA avec :
- Génération automatique de questions d'examen à partir du contenu des cours
- Détection des difficultés d'apprentissage par analyse des résultats
- Parcours d'apprentissage personnalisé basé sur les performances

### Amélioration 4 : Tableau de bord analytics
Créer un tableau de bord pour les administrateurs avec des statistiques avancées (taux de réussite, temps d'étude moyen, matières les plus consultées, etc.).

---

# 6. Conclusion

## A. Qu'avons-nous appris ?

Ce projet transversal nous a permis d'acquérir des compétences pratiques essentielles :

- **Développement backend** avec Django REST Framework : création de modèles, sérialiseurs, ViewSets, permissions, et authentification JWT.
- **Développement frontend** avec React : composants, hooks, context API, routage, animations avec Framer Motion.
- **Conception UML** : diagrammes de cas d'utilisation, de séquence et de classes pour modéliser le système avant le développement.
- **Architecture REST** : conception d'API RESTful complètes avec plus de 80 endpoints.
- **Internationalisation** : mise en place du multilingue (malgache, français, anglais) avec django-modeltranslation et i18next.
- **Gestion de version** avec Git et GitHub pour le travail collaboratif.
- **Sécurité web** : implémentation de mesures anti-triche, protection CSRF, validation des données.

## B. Utilité du projet

Ce projet nous prépare au développement professionnel en nous confrontant à des problématiques réelles : la conception d'une plateforme utilisable par des milliers d'utilisateurs, la gestion de la sécurité et de l'accessibilité, et le travail avec des technologies modernes largement utilisées dans l'industrie. La plateforme ENENI répond à un besoin concret du système éducatif malgache et pourrait être déployée dans des établissements réels.

## C. Ouverture

Comment la plateforme ENENI pourrait-elle intégrer l'intelligence artificielle générative pour créer automatiquement des contenus pédagogiques adaptés au programme malgache ? Cette question ouvre des perspectives intéressantes pour réduire la charge de travail des enseignants tout en personnalisant l'apprentissage pour chaque élève.

---

# 7. Bibliographie

## Références bibliographiques (format APA)

1. Django Software Foundation. (2026). *Django Documentation (6.0)*. https://docs.djangoproject.com/en/6.0/

2. Django REST Framework. (2026). *DRF Documentation*. https://www.django-rest-framework.org/

3. Mozilla. (2026). *MDN Web Docs — React*. https://developer.mozilla.org/fr/docs/Web/React

4. React Team. (2026). *React Documentation (19.x)*. https://react.dev/

5. Vite Team. (2026). *Vite Documentation*. https://vitejs.dev/

6. Tailwind CSS. (2026). *Tailwind CSS Documentation*. https://tailwindcss.com/docs

7. i18next. (2026). *i18next Documentation*. https://www.i18next.com/

8. React Router. (2026). *React Router Documentation*. https://reactrouter.com/

9. Luciano Ramalho. (2022). *Fluent Python (2nd ed.)*. O'Reilly Media.

10. William S. Vincent. (2024). *Django for APIs: Build web APIs with Python and Django*. Leanpub.

---

# 8. Annexes

## A. Questionnaire d'analyse des besoins

*À remplir selon les enquêtes menées auprès des utilisateurs cibles*

**Questions proposées :**

1. Quelles sont les principales difficultés rencontrées dans la gestion des cours et des examens ?
2. Utilisez-vous actuellement des outils numériques pour l'enseignement ?
3. Quelles fonctionnalités seraient les plus importantes pour une plateforme éducative ?
4. Seriez-vous prêt à utiliser une plateforme en ligne pour le suivi des apprentissages ?
5. Quels types de ressources pédagogiques souhaiteriez-vous trouver sur la plateforme ?
6. Quels sont vos critères de sécurité pour un outil d'examen en ligne ?

## B. Extraits de code significatifs

### Modèle Utilisateur (Backend/core/models/utilisateurs.py)

```python
class Utilisateur(AbstractUser, TimeStampedModel, SoftDeleteModel):
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    langue_preferee = models.CharField(
        max_length=2, choices=LANGUE_CHOICES, default='MG'
    )
    options_accessibilite = models.JSONField(default=dict, blank=True)
    photo_profil = models.ImageField(upload_to='profiles/', null=True, blank=True)
    type_utilisateur = models.CharField(
        max_length=25, choices=TYPE_UTILISATEUR_CHOICES, default='ETUDIANT'
    )
```

Ce modèle étend AbstractUser avec les champs spécifiques au projet : préférences linguistiques, options d'accessibilité, et type d'utilisateur. L'héritage de TimeStampedModel et SoftDeleteModel permet un suivi automatique des dates et une suppression logique.

### ViewSet Examen (Backend/core/views/examens_views.py) — extrait

```python
class ExamenViewSet(viewsets.ModelViewSet):
    queryset = Examen.objects.all()
    serializer_class = ExamenSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def publier(self, request, pk=None):
        examen = self.get_object()
        examen.est_publie = True
        examen.save()
        return Response({'status': 'examen publié'})
```

Les ViewSets DRF permettent de générer automatiquement les endpoints CRUD tout en autorisant des actions personnalisées comme la publication d'examen.

### Mode Examen Plein Écran (Frontend) — extrait React

```jsx
// Hook useExamSecurity — blocage des raccourcis et plein écran
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'F12' ||
        (e.ctrlKey && ['c','u','v','p','s'].includes(e.key)) ||
        (e.altKey && e.key === 'Tab')) {
      e.preventDefault();
      logSurveillance('Tentative de triche', { key: e.key });
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

Ce hook sécurise l'examen en bloquant les raccourcis dangereux et en journalisant les événements suspects dans la base de données via l'API.

### Routage Frontend (Frontend/src/App.jsx) — extrait

```jsx
function ProtectedRoute({ user, children }) {
  const token = sessionStorage.getItem('eneni_token');
  if (!user && !token) return <Navigate to="/login" replace />;
  return children;
}
```

Le routage protégé vérifie la présence du token JWT dans le sessionStorage avant d'autoriser l'accès aux pages internes.

---

# 9. Table des matières

| Section | Page |
|---------|------|
| Sommaire | 1 |
| 1. Résumé et Abstract | 2 |
| 1.1 Résumé | 2 |
| 1.2 Abstract | 2 |
| 2. Introduction | 3 |
| 2.1 Contexte général | 3 |
| 2.2 Problématique | 3 |
| 2.3 Objectifs | 3 |
| 2.4 Structure du rapport | 3 |
| 3. Analyse et conception | 4 |
| 3.1 Analyse des besoins | 4 |
| 3.1.1 Utilisateurs (acteurs) | 4 |
| 3.1.2 Besoins | 4 |
| 3.2 Fonctionnalités à implémenter | 5 |
| 3.3 Modélisation du système | 6 |
| 3.3.1 Diagramme de cas d'utilisation | 6 |
| 3.3.2 Diagramme de séquence | 7 |
| 3.3.3 Diagramme de classes | 8 |
| 4. Réalisation | 9 |
| 4.1 Technologies utilisées | 9 |
| 4.2 Structure des dossiers | 10 |
| 4.3 Structure de la base de données | 11 |
| 5. Résultats | 13 |
| 5.1 Résultats obtenus | 13 |
| 5.2 Perspectives d'amélioration | 15 |
| 6. Conclusion | 16 |
| 7. Bibliographie | 17 |
| 8. Annexes | 18 |
| 8.1 Questionnaire | 18 |
| 8.2 Extraits de code | 18 |
| 9. Table des matières | 20 |
