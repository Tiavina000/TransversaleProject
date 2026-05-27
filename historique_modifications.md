# Historique des Modifications du Projet ENENI

Ce document retrace l'évolution détaillée du projet ENENI, de sa création initiale jusqu'à aujourd'hui.

## 13 & 14 Mai 2026 - Modernisation de l'Expérience Utilisateur et Sécurité Avancée
- **Authentification Multiniveau** : Refonte du système de connexion pour exiger la sélection de l'établissement et du rôle en plus des identifiants (Matricule/Username + Password).
- **Liaison Institutionnelle** : Mise à jour des modèles `Etudiant` et `Enseignant` pour inclure une clé étrangère vers `Etablissement`, garantissant une étanchéité des données par école.
- **Suivi des Sessions d'Étude** : Implémentation du système de `heartbeat` (toutes les 30s) et du modèle `SessionEtude` pour calculer précisément le temps réel passé par l'élève sur chaque leçon.
- **Dashboard "Aura" v2** : Modernisation graphique du tableau de bord (Hero section premium, suppression des termes techniques, barre de progression par matière).
- **Fil d'Actualité Infini** : Développement d'un feed Instagram-style avec structure de données optimisée pour un défilement infini et circulaire des actualités.
- **Portail Public & Partenaires** : Ajout d'un bandeau défilant "Infinite Marquee" sur la landing page pour mettre en avant les partenaires institutionnels (AFD, UNICEF, etc.).
- **Robustesse API** : Correction d'erreurs critiques d'importation dans les vues et permissions, et synchronisation des données de démo avec le fichier `user.txt`.
- **Intégration Git** : Finalisation de la configuration du dépôt distant sur GitHub pour le projet `TransversaleProject`.

## 02 Mai 2026 - Internationalisation (Multilingue) et Finalisation
- **Ajout de l'internationalisation (i18n)** : Configuration de `LocaleMiddleware` dans `settings.py`.
- **Support de langues** : Intégration du Malgache (`mg`), Français (`fr`) et Anglais (`en`).
- **Routage Multilingue** : Modification de `urls.py` pour utiliser `i18n_patterns`, permettant des préfixes de langue dans les URLs (ex: `/mg/`, `/fr/`).
- **Génération des fichiers de traduction** : Création du dossier `locale` et exécution des commandes `makemessages` et `compilemessages` pour générer les fichiers `.po` et `.mo`.

## 29 Avril 2026 - Pédagogie et Interface Utilisateur
- **Création des vues pédagogiques** : Ajout de `pedagogie_views.py` pour gérer le contenu éducatif et les leçons.
- **Gestion des examens** : Implémentation des vues dans `examens_views.py` pour l'évaluation des étudiants.
- **Permissions et Sécurité** : Définition des règles d'accès personnalisées dans `permissions.py` (DRF).

## 26 Avril 2026 - Intégration de l'Intelligence Artificielle et Voix
- **Services IA** : Développement de `ia_views.py` et intégration de modèles d'IA pour assister les apprenants.
- **Service Vocal** : Implémentation de `voice_service.py` pour les fonctionnalités de Text-to-Speech (TTS) et Speech-to-Text (STT) destinées aux apprenants malvoyants ou ayant des difficultés motrices.
- **Tests unitaires IA** : Ajout des tests dans `test_ia_services.py` pour valider l'intégration avec les API externes.

## 22 Avril 2026 - Algorithmes Avancés (Trie, Graphes, Scoring)
- **Structure de données Trie** : Implémentation du service `trie_service.py` pour la recherche rapide et l'auto-complétion du contenu éducatif.
- **Service de Graphes** : Création de `graph_service.py` pour modéliser les parcours d'apprentissage et les prérequis des cours.
- **Système de Scoring** : Ajout de `scoring_service.py` pour l'évaluation dynamique et la recommandation de parcours en fonction des résultats de l'utilisateur.

## 18 Avril 2026 - Modélisation de la Base de Données
- **Modèles de base** : Création du modèle `Utilisateur` (Custom User Model) dans l'application `core`.
- **Modèles éducatifs** : Mise en place des tables pour les Cours, Leçons, Examens et Résultats.
- **Accessibilité** : Ajout des préférences d'accessibilité (ex: support pour handicap moteur/visuel) directement dans le profil utilisateur.
- **Migration initiale** : Configuration de PostgreSQL comme base de données principale et première migration (`makemigrations`, `migrate`).

## 14 Mai 2026 - Implémentation Complète des Requêtes (R1-R21)
- **R1 - Login sans refresh** : Correction du `handleLogin` dans App.jsx pour mise à jour d'état synchrone + navigation immédiate.
- **R1 - Système de thème** : Création de `ThemeContext.jsx` (Provider avec 3 thèmes : Ministère, Sombre, Clair), `ThemeSwitcher.jsx` dans la navbar, variables CSS dynamiques.
- **R2 - Compte à rebours cohérent** : Correction du stale closure dans `DynamicTimer` (ExamMode), chargement dynamique des examens via API dans `StudentDashboard`.
- **R3 - Landing page optimisée** : lazy loading, animations allégées, suppression des `motion.div` superflus.
- **R4 - Bug scroll corrigé** : Retrait du `backdrop-filter` sur la navbar fixe (cause du glitch GPU), `overflow-x-hidden` à la racine.
- **R5-6 - Dashboard professeur** : Création de `TeacherDashboard.jsx` avec "Prof de [Matiere] en [Niveau]", établissement.
- **R7-8 - Gestion cours professeur** : Views enrichies (upload fichiers, QCM validation, CRUD chapitres). API `teacherCourseAPI`.
- **R9 - Visioconférence WebRTC** : Refonte de `LiveClass.jsx` avec flux média réel, contrôles prof/élève, main levée, questions/commentaires, bannissement.
- **R10 - Notifications** : Endpoints CRUD, notification 30min avant visio, badge compteur dans navbar.
- **R11 - Création examens** : Nouveaux champs modèle (`type_examen`, `lecture_automatique`, `mot_min/max`), endpoints de création.
- **R12 - Correction examens** : `CorrectionViewSet`, auto-correction QCM/VF, `auto_spell_check()`, comptage mots.
- **R14-16 - Cours étudiant** : Navigation chapitres, onglet Fichiers, téléchargement authentifié.
- **R17-20 - Examen étudiant** : `ExamsPage.jsx` (planning, plein écran, anti-triche), sécurité renforcée.
- **R21 - Bulletin de notes** : `BulletinPage.jsx` (notes par matière, moyenne, export PDF), API `MesNotesView`.
- **Documentation complète** : Mise à jour de `contenu_finale.txt` avec architecture, flux, syntaxes, et récapitulatif R1-R21.

## 15 Avril 2026 - Initialisation du Projet
- **Création du projet Django** : Génération du projet `ENENI` via `django-admin startproject`.
- **Configuration initiale** : Mise en place de `settings.py` (CORS, ALLOWED_HOSTS, etc.).
- **Installation des dépendances** : Configuration de l'environnement virtuel et installation de `Django`, `djangorestframework`, `psycopg2-binary`.
- **Création de l'application `core`** : Application principale du système backend (`python manage.py startapp core`).
