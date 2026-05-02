# Historique des Modifications du Projet ENENI

Ce document retrace l'évolution détaillée du projet ENENI, de sa création initiale jusqu'à aujourd'hui.

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

## 15 Avril 2026 - Initialisation du Projet
- **Création du projet Django** : Génération du projet `ENENI` via `django-admin startproject`.
- **Configuration initiale** : Mise en place de `settings.py` (CORS, ALLOWED_HOSTS, etc.).
- **Installation des dépendances** : Configuration de l'environnement virtuel et installation de `Django`, `djangorestframework`, `psycopg2-binary`.
- **Création de l'application `core`** : Application principale du système backend (`python manage.py startapp core`).
