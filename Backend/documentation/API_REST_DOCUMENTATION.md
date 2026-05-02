# 📚 Documentation des APIs REST - Projet ENENI

## Vue d'ensemble

Toutes les APIs REST du projet ENENI sont accessibles via l'URL de base:
```
http://localhost:8000/api/
```

Le projet utilise Django REST Framework avec:
- ✅ **Pagination**: 10 résultats par page
- ✅ **Filtrage**: Recherche par mots-clés
- ✅ **Tri**: Ordre personnalisé
- ✅ **Authentification**: À configurer selon vos besoins

---

## 📋 Vue d'ensemble des endpoints

### 1. **UTILISATEURS**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/utilisateurs/` | GET/POST | Lister/Créer les utilisateurs |
| `/api/utilisateurs/{id}/` | GET/PUT/DELETE | Détails d'un utilisateur |
| `/api/utilisateurs/actifs/` | GET | Utilisateurs actifs uniquement |
| `/api/etudiants/` | GET/POST | Gérer les étudiants |
| `/api/etudiants/top_points/` | GET | Top étudiants par points |
| `/api/enseignants/` | GET/POST | Gérer les enseignants |
| `/api/admins-plateforme/` | GET/POST | Gérer les admin |
| `/api/admin-etablissements/` | GET/POST | Admin d'établissements |

---

### 2. **ÉTABLISSEMENTS**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/etablissements/` | GET/POST | Lister/Créer des établissements |
| `/api/etablissements/{id}/` | GET/PUT/DELETE | Détails d'un établissement |

---

### 3. **PÉDAGOGIE** (Contenu scolaire)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/niveaux-scolaires/` | GET/POST | Niveaux (Maternelle, CP, etc.) |
| `/api/matieres/` | GET/POST | Matières scolaires |
| `/api/matieres/{id}/chapitres/` | GET | Chapitres d'une matière |
| `/api/chapitres/` | GET/POST | Chapitres détaillés |
| `/api/lecons/` | GET/POST | Leçons avec fichiers |
| `/api/fichiers-multimedia/` | GET/POST | Fichiers vidéo, PDF, Audio |

---

### 4. **EXAMENS**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/examens/` | GET/POST | Créer/Lister les examens |
| `/api/examens/publies/` | GET | Examens publiés uniquement |
| `/api/questions-examen/` | GET/POST | Questions d'examen |
| `/api/copies-examen/` | GET/POST | Copies d'examen |
| `/api/copies-examen/{id}/soumettre/` | POST | Soumettre une copie |
| `/api/reponses-examen/` | GET/POST | Réponses aux questions |
| `/api/logs-surveillance/` | GET | Logs de surveillance |

---

### 5. **VISIOCONFÉRENCE**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/sessions-visio/` | GET/POST | Sessions de visioconférence |
| `/api/participations-visio/` | GET/POST | Participations aux sessions |

---

### 6. **BOUTIQUE**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/ressources-boutique/` | GET/POST | Livres, cours, vidéos |
| `/api/ressources-boutique/disponibles/` | GET | Ressources disponibles |
| `/api/paniers/` | GET/POST | Paniers d'achat |
| `/api/panier-items/` | GET/POST | Articles du panier |
| `/api/commandes/` | GET/POST | Commandes |

---

### 7. **COMMUNICATIONS**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/actualites/` | GET/POST | Actualités et news |
| `/api/notifications/` | GET/POST | Notifications utilisateurs |

---

### 8. **INTELLIGENCE ARTIFICIELLE**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/requetes-ia/` | GET/POST | Requêtes IA |
| `/api/recommandations/` | GET/POST | Recommandations de leçons |

---

## 🔍 Exemples de requêtes

### Récupérer les utilisateurs

```bash
# Lister les utilisateurs (première page)
GET /api/utilisateurs/

# Lister avec pagination personnalisée
GET /api/utilisateurs/?page=1&page_size=20

# Rechercher un utilisateur
GET /api/utilisateurs/?search=john

# Trier par date
GET /api/utilisateurs/?ordering=-date_creation

# Combiné: recherche + tri + pagination
GET /api/utilisateurs/?search=john&ordering=-date_creation&page_size=15
```

### Créer un utilisateur

```bash
POST /api/utilisateurs/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "prenom": "John",
  "password": "secure_password123",
  "langue_preferee": "FR",
  "type_utilisateur": "ETUDIANT"
}
```

### Lister les examens publiés

```bash
GET /api/examens/publies/?ordering=-date_debut
```

### Créer une commande

```bash
POST /api/commandes/
Content-Type: application/json

{
  "etudiant": 1,
  "montant_total": "150.50",
  "statut_paiement": "EN_ATTENTE"
}
```

---

## 📊 Filtrage et recherche

### Paramètres courants:

| Paramètre | Exemple | Description |
|-----------|---------|-------------|
| `search` | `?search=python` | Chercher dans les champs searchables |
| `ordering` | `?ordering=-date_creation` | Trier (- = décroissant) |
| `page_size` | `?page_size=50` | Nombre de résultats par page |
| `page` | `?page=2` | Numéro de page |

### Exemple combiné:

```bash
GET /api/examens/?search=Mathématiques&ordering=-date_debut&page_size=20&page=1
```

---

## 🔐 Réponses

### Succès (200 OK)

```json
{
  "count": 50,
  "next": "http://localhost:8000/api/utilisateurs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "prenom": "John",
      "type_utilisateur": "ETUDIANT",
      "date_creation": "2024-03-15T10:30:00Z"
    }
  ]
}
```

### Erreur (400 Bad Request)

```json
{
  "detail": "Invalid request"
}
```

---

## 🚀 Installation et démarrage

### 1. Installer les dépendances

```bash
pip install django djangorestframework
```

### 2. Appliquer les migrations

```bash
python manage.py migrate
```

### 3. Créer un superutilisateur

```bash
python manage.py createsuperuser
```

### 4. Lancer le serveur

```bash
python manage.py runserver
```

### 5. Accéder à l'API

- **Browsable API**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/

---

## 📝 Notes importantes

1. **Pagination**: Par défaut, 10 résultats par page
2. **Read-only fields**: Les champs `id`, `date_creation`, `date_modification` sont en lecture seule
3. **Relations**: Les relations many-to-many utilisent `_ids` pour l'écriture
4. **Timestamps**: Tous les modèles timestampés incluent `date_creation` et `date_modification`

---

## 🔄 Structure des données

### Modèle Utilisateur

```
Utilisateur (base)
├── Etudiant (OneToOne)
├── Enseignant (OneToOne)
└── AdminPlateforme (OneToOne)
```

### Modèle Pédagogie

```
NiveauScolaire
├── Matiere
│   ├── Chapitre
│   │   └── Lecon
│   │       └── FichierMultimedia
```

### Modèle Examen

```
Examen
├── QuestionExamen
├── CopieExamen
│   ├── ReponseExamen
│   └── LogSurveillance
```

---

## 🆘 Dépannage

### 404 - Endpoint non trouvé

Vérifiez que les URLs sont correctement incluses dans `core/urls.py` et que le routeur est configuré.

### 400 - Données invalides

Vérifiez le format JSON et les champs obligatoires du serializer.

### 403 - Permission refusée

Implémentez l'authentification et les permissions (voir section suivante).

---

## 🔐 Prochaines étapes

1. **Ajouuter l'authentification** (Token, JWT)
2. **Configurer les permissions** (IsAuthenticated, IsAdminUser)
3. **Ajouter les tests unitaires**
4. **Documenter avec Swagger/OpenAPI**
5. **Configurer CORS** pour les demandes cross-origin

---

**Créé automatiquement pour ENENI** 🎓
