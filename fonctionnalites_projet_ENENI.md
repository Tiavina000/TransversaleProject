# Fonctionnalités du Projet ENENI

Ce document liste les fonctionnalités identifiées pour le projet ENENI, séparées entre le backend et le frontend, avec une catégorisation de leur statut (principalement "Implémenté" basée sur l'analyse du code).

---

## Fonctionnalités Backend (Implémentées)

Basées sur l'analyse des fichiers `ENENI-main/Backend/ENENI/urls.py` et `ENENI-main/Backend/core/urls.py`.

### 1. Authentification & Autorisation
*   **Django Admin Interface**: `admin/` - Gestion des utilisateurs, groupes, et contenu via l'interface d'administration Django.
*   **Authentification Django Intégrée**: `accounts/` - Fonctions de connexion, déconnexion, et gestion des mots de passe.
*   **Login JWT Personnalisé**: `api/auth/login/` - Obtention de jetons JWT pour l'authentification.
*   **Déconnexion Personnalisée**: `api/auth/logout/` - Invalidation des sessions utilisateur.
*   **Rafraîchissement de Jeton JWT**: `api/auth/refresh/` - Renouvellement des jetons d'accès.
*   **Profil Utilisateur Authentifié**: `api/auth/me/` - Récupération des données du profil utilisateur connecté et de ses rôles spécifiques.

### 2. Gestion des Utilisateurs
*   **Utilisateurs Génériques**: `api/utilisateurs/` - Opérations CRUD pour tous les types d'utilisateurs.
*   **Étudiants**: `api/etudiants/` - Opérations CRUD spécifiques aux étudiants.
*   **Enseignants**: `api/enseignants/` - Opérations CRUD spécifiques aux enseignants.
*   **Administrateurs de Plateforme**: `api/admins-plateforme/` - Opérations CRUD pour les administrateurs globaux.

### 3. Gestion des Établissements
*   **Établissements Scolaires**: `api/etablissements/` - Opérations CRUD pour les établissements.
*   **Administrateurs d'Établissement**: `api/admin-etablissements/` - Opérations CRUD pour les administrateurs d'établissement.

### 4. Gestion du Contenu Pédagogique
*   **Niveaux Scolaires**: `api/niveaux-scolaires/` - Opérations CRUD pour les différents niveaux scolaires.
*   **Matières/Cours**: `api/matieres/` - Opérations CRUD pour les matières enseignées.
*   **Chapitres**: `api/chapitres/` - Opérations CRUD pour les chapitres de cours.
*   **Leçons**: `api/lecons/` - Opérations CRUD pour les leçons individuelles.
*   **Fichiers Multimédia**: `api/fichiers-multimedia/` - Opérations CRUD pour les ressources multimédia (vidéos, images, etc.).
*   **Sessions d'Étude**: `api/sessions-etude/` - Opérations CRUD pour le suivi des sessions d'étude des étudiants.
*   **Classes**: `api/classes/` - Opérations CRUD pour les classes d'étudiants.
*   **Catalogue de Cours**: `api/courses/` - Liste et récupération des détails des cours (matières).
*   **Démarrer Session d'Étude**: `api/courses/<int:pk>/session/start/` - Initie une session d'étude pour un cours.
*   **Mettre en Pause Session d'Étude**: `api/sessions/<int:pk>/pause/` - Met en pause une session d'étude.
*   **Reprendre Session d'Étude**: `api/sessions/<int:pk>/resume/` - Reprend une session d'étude.
*   **Terminer Session d'Étude**: `api/sessions/<int:pk>/end/` - Termine une session d'étude.
*   **Heartbeat Session d'Étude**: `api/sessions/<int:pk>/heartbeat/` - Maintient la session d'étude active.
*   **Gestion Chapitres (Enseignant)**: `api/teacher/chapitres/` - Liste, création, mise à jour, suppression de chapitres par les enseignants.
*   **Gestion Leçons (Enseignant)**: `api/teacher/lecons/` - Liste, création, mise à jour, suppression de leçons par les enseignants.

### 5. Gestion des Examens et Évaluations
*   **Examens**: `api/examens/` - Opérations CRUD pour les examens.
*   **Questions d'Examen**: `api/questions-examen/` - Opérations CRUD pour les questions spécifiques aux examens.
*   **Copies d'Examen**: `api/copies-examen/` - Opérations CRUD pour les copies rendues par les étudiants.
*   **Réponses d'Examen**: `api/reponses-examen/` - Opérations CRUD pour les réponses des étudiants aux questions.
*   **Logs de Surveillance**: `api/logs-surveillance/` - Opérations CRUD pour les logs de surveillance pendant les examens.
*   **Démarrer un Examen**: `api/examens/<int:pk>/start/` - Lance un examen pour un étudiant.
*   **Soumettre un Examen**: `api/examens/<int:pk>/submit/` - Permet à un étudiant de soumettre son examen.
*   **Minuteur d'Examen**: `api/examens/<int:pk>/timer/` - Récupère le temps restant pour un examen.
*   **Enregistrer Événements d'Examen**: `api/examens/<int:pk>/logs/` - Enregistre les événements liés à l'examen.
*   **Publier Résultats d'Examen**: `api/examens/<int:pk>/publier/` - Publie les résultats d'un examen.
*   **Ajouter Question à Examen**: `api/examens/<int:pk>/ajouter-question/` - Ajoute une question à un examen.
*   **Obtenir Questions d'Examen**: `api/examens/<int:pk>/questions/` - Récupère les questions d'un examen.
*   **Examens Corréctibles**: `api/examens/corrigeables/` - Liste des examens en attente de correction.
*   **Corriger Copie d'Examen**: `api/examens/<int:pk>/corriger/<int:copie_id>/` - Permet de corriger une copie d'examen.

### 6. Système de Correction
*   **Liste des Corrections**: `api/corrections/` - Récupère la liste des corrections.
*   **Classes pour Corrections**: `api/corrections/classes/` - Filtre les corrections par classe.
*   **Matières pour Corrections**: `api/corrections/matieres/` - Filtre les corrections par matière.
*   **Noter une Correction**: `api/corrections/<int:pk>/noter/` - Attribue une note à une copie corrigée.
*   **Vérification Orthographique**: `api/corrections/<int:pk>/spellcheck/` - Effectue une vérification orthographique sur une correction.

### 7. Visioconférence
*   **Sessions de Visioconférence**: `api/sessions-visio/` - Opérations CRUD pour les sessions de visioconférence.
*   **Participations à la Visioconférence**: `api/participations-visio/` - Opérations CRUD pour la gestion des participants.
*   **Sessions Live**: `api/live-sessions/` - Liste et crée des sessions live.
*   **Détails Session Live**: `api/live-sessions/<int:pk>/` - Récupère les détails d'une session live.
*   **Rejoindre Session Live**: `api/live-sessions/<int:pk>/join/` - Permet de rejoindre une session live.
*   **Quitter Session Live**: `api/live-sessions/<int:pk>/leave/` - Permet de quitter une session live.
*   **Lever la Main**: `api/live-sessions/<int:pk>/raise-hand/` - Fonctionnalité "lever la main" en session.
*   **Baisser la Main**: `api/live-sessions/<int:pk>/lower-hand/` - Fonctionnalité "baisser la main" en session.
*   **Gestion des Questions Live**: `api/live-sessions/<int:pk>/questions/` - Gérer les questions pendant une session live.
*   **Marquer Question Répondue**: `api/live-sessions/<int:pk>/questions/<int:qid>/answered/` - Marque une question comme répondue.
*   **Jeton Livekit**: `api/live-sessions/<int:pk>/livekit-token/` - Obtient un jeton pour Livekit.
*   **Bannir d'une Session Live**: `api/live-sessions/<int:pk>/ban/` - Bannit un utilisateur d'une session live.

### 8. Boutique / E-commerce
*   **Ressources de la Boutique**: `api/boutique/` - Opérations CRUD pour les articles en vente.
*   **Paniers d'Achat**: `api/paniers/` - Opérations CRUD pour les paniers des utilisateurs.
*   **Articles du Panier**: `api/panier-items/` - Opérations CRUD pour les articles ajoutés au panier.
*   **Commandes**: `api/commandes/` - Opérations CRUD pour la gestion des commandes.
*   **Ajouter au Panier**: `api/panier/add/` - Ajoute un article au panier.

### 9. Communication et Information Publique
*   **Actualités**: `api/actualites/` - Opérations CRUD pour les articles d'actualité.
*   **Notifications**: `api/notifications/` - Opérations CRUD pour la gestion des notifications.
*   **Partenaires**: `api/partenaires/` - Opérations CRUD pour les partenaires.
*   **Rénovations**: `api/renovations/` - Opérations CRUD pour les informations sur les rénovations.
*   **Notifications Spécifiques**:
    *   `api/notifications/creer-visio/`: Création d'une notification de visioconférence.
    *   `api/notifications/notifier-ban/`: Notification de bannissement.
    *   `api/notifications/lire/<int:pk>/`: Marquer une notification comme lue.
    *   `api/notifications/tout-lire/`: Marquer toutes les notifications comme lues.
    *   `api/notifications/compte/`: Compte des notifications non lues.
    *   `api/notifications/signaler-retard/`: Signaler un retard via notification.
*   **Recherche Publique**: `api/public/search/` - Fonctionnalité de recherche accessible publiquement.
*   **Partenaires Publics**: `api/public/partners/` - Liste des partenaires accessible publiquement.
*   **Rénovations Publiques**: `api/public/renovations/` - Liste des rénovations accessible publiquement.

### 10. Intelligence Artificielle et Recommandation
*   **Requêtes IA**: `api/requetes-ia/` - Opérations CRUD pour les requêtes adressées à l'IA.
*   **Recommandations**: `api/recommandations/` - Opérations CRUD pour les fonctionnalités de recommandation.

### 11. Statistiques
*   **Statistiques Globales Publiques**: `api/public/stats/`
*   **Statistiques Globales Authentifiées**: `api/stats/`
*   **Statistiques Étudiant**: `api/stats/student/`
*   **Statistiques Enseignant**: `api/stats/teacher/`

### 12. Gestion des Fichiers
*   **Téléchargement de Fichiers de Cours**: `api/courses/<int:course_id>/files/<int:file_id>/download/` - Permet le téléchargement de fichiers associés aux cours.

### 13. Rapports
*   **Notes de l'Étudiant**: `api/mes-notes/` - Accès aux notes et bulletins de l'étudiant.
*   **Notes par Enseignant**: `api/notes-enseignant/` - Vue des notes des étudiants par l'enseignant.

---

## Fonctionnalités Frontend (Implémentées)

Basées sur l'analyse de `ENENI-main/frontend/src/App.jsx` et l'identification des composants de pages.

### 1. Authentification
*   **Page de Connexion**: `LoginPage` - Interface utilisateur pour la connexion des utilisateurs.
*   **Gestion de l'État d'Authentification**: Fonctions `handleLogin` et `handleLogout` pour gérer les tokens JWT (`eneni_token`, `eneni_refresh`) dans `sessionStorage`.
*   **Protection des Routes**: `ProtectedRoute` - Empêche l'accès aux pages nécessitant une authentification.
*   **Redirection Conditionnelle**: Redirection vers le tableau de bord (`/dashboard`) après une connexion réussie.

### 2. Interfaces Utilisateur par Rôle
*   **Tableau de Bord Étudiant**: `StudentDashboard` - Interface spécifique aux étudiants.
*   **Tableau de Bord Enseignant**: `TeacherDashboard` - Interface spécifique aux enseignants.
*   **Tableau de Bord Administrateur**: `AdminDashboard` - Interface spécifique aux administrateurs.

### 3. Navigation et Mise en Page
*   **Barre de Navigation**: `Navbar` - Composant de navigation principal de l'application.
*   **Page d'Accueil Publique**: `LandingPage` - Page d'atterrissage accessible avant la connexion.

### 4. Accès au Contenu Pédagogique
*   **Liste des Cours**: `CoursesPage` - Affiche la liste des cours disponibles.
*   **Lecteur de Cours**: `CoursePlayer` - Permet de consulter le contenu des cours (vidéos, leçons, etc.).

### 5. Évaluations et Performances
*   **Liste des Examens**: `ExamsPage` - Affiche les examens disponibles.
*   **Interface de Passage d'Examen**: `ExamView` - Permet aux utilisateurs de passer un examen.
*   **Consultation du Bulletin**: `BulletinPage` - Affiche le bulletin de notes de l'étudiant.
*   **Gestion des Corrections**: `CorrectionsPage` - Interface pour visualiser et gérer les corrections.

### 6. Interaction en Direct
*   **Classe en Direct / Visioconférence**: `LiveClass` - Interface pour participer à des sessions de cours en direct.

### 7. E-commerce
*   **Page de la Boutique**: `ShopPage` - Affiche les ressources disponibles à l'achat.

### 8. Thème de l'Application
*   **Gestion du Thème**: `ThemeProvider` - Permet de gérer les thèmes visuels de l'application.

### 9. Internationalisation
*   **Support Multilingue**: Intégration de `i18n.js` pour la gestion des traductions.

---

## Fonctionnalités avec Bugs, Erreurs ou Non Utilisées

**Note :** L'identification des fonctionnalités présentant des bugs, des erreurs ou celles qui sont non utilisées ne peut pas être effectuée par simple analyse statique du code. Cela requiert des informations dynamiques telles que :

*   **Exécution de tests unitaires ou d'intégration.**
*   **Surveillance des logs d'erreurs** (backend et frontend) lors de l'exécution de l'application.
*   **Retours d'utilisateurs** ou rapports de bugs.
*   **Analyse de la couverture de code** pour identifier le code non exécuté.

Pour obtenir ces informations, il serait nécessaire d'exécuter des tests, de lancer l'application et de surveiller son comportement, ou de consulter des outils de suivi de projet existants.
