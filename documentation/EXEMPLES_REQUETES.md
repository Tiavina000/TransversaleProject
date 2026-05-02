# 📖 Exemples pratiques - Requêtes API REST ENENI

## 1. CRUD de base (Create, Read, Update, Delete)

### 📥 CRÉER une ressource (POST)

```bash
curl -X POST http://localhost:8000/api/utilisateurs/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_wonder",
    "email": "alice@example.com",
    "prenom": "Alice",
    "password": "SecurePass123!",
    "type_utilisateur": "ETUDIANT",
    "langue_preferee": "FR"
  }'
```

**Réponse** (201 Created):
```json
{
  "id": 5,
  "username": "alice_wonder",
  "email": "alice@example.com",
  "prenom": "Alice",
  "type_utilisateur": "ETUDIANT",
  "langue_preferee": "FR",
  "est_actif": true,
  "date_creation": "2024-04-14T10:30:00Z",
  "date_modification": "2024-04-14T10:30:00Z"
}
```

---

### 📖 LIRE une liste (GET)

```bash
# Obtenir tous les utilisateurs
curl http://localhost:8000/api/utilisateurs/

# Avec pagination
curl "http://localhost:8000/api/utilisateurs/?page=1&page_size=10"

# Avec recherche
curl "http://localhost:8000/api/utilisateurs/?search=alice"

# Avec tri
curl "http://localhost:8000/api/utilisateurs/?ordering=-date_creation"

# Combiné
curl "http://localhost:8000/api/utilisateurs/?search=alice&ordering=-date_creation&page_size=5"
```

**Réponse** (200 OK):
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/utilisateurs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "prenom": "John",
      "type_utilisateur": "ETUDIANT",
      "date_creation": "2024-04-10T14:20:00Z"
    },
    {
      "id": 5,
      "username": "alice_wonder",
      "email": "alice@example.com",
      "prenom": "Alice",
      "type_utilisateur": "ETUDIANT",
      "date_creation": "2024-04-14T10:30:00Z"
    }
  ]
}
```

---

### 🔍 LIRE un détail (GET /{id})

```bash
curl http://localhost:8000/api/utilisateurs/5/
```

**Réponse** (200 OK):
```json
{
  "id": 5,
  "username": "alice_wonder",
  "email": "alice@example.com",
  "prenom": "Alice",
  "first_name": "",
  "langue_preferee": "FR",
  "type_utilisateur": "ETUDIANT",
  "photo_profil": null,
  "est_actif": true,
  "date_creation": "2024-04-14T10:30:00Z",
  "date_modification": "2024-04-14T10:30:00Z",
  "options_accessibilite": {},
  "date_suppression": null
}
```

---

### ✏️ METTRE À JOUR (PATCH)

```bash
# Mise à jour partielle (PATCH) - recommandé
curl -X PATCH http://localhost:8000/api/utilisateurs/5/ \
  -H "Content-Type: application/json" \
  -d '{
    "prenom": "Alexandra",
    "langue_preferee": "EN"
  }'
```

**Réponse** (200 OK):
```json
{
  "id": 5,
  "username": "alice_wonder",
  "email": "alice@example.com",
  "prenom": "Alexandra",
  "langue_preferee": "EN",
  "type_utilisateur": "ETUDIANT",
  "date_creation": "2024-04-14T10:30:00Z",
  "date_modification": "2024-04-14T11:45:00Z"
}
```

---

### 🗑️ SUPPRIMER (DELETE)

```bash
curl -X DELETE http://localhost:8000/api/utilisateurs/5/
```

**Réponse** (204 No Content) - Pas de corps de réponse

---

## 2. Relations entre tables

### 📌 Ajouter un étudiant avec relation à utilisateur

```bash
curl -X POST http://localhost:8000/api/etudiants/ \
  -H "Content-Type: application/json" \
  -d '{
    "utilisateur_id": 5,
    "points_global": 150
  }'
```

**Réponse**:
```json
{
  "id": 10,
  "utilisateur": {
    "id": 5,
    "username": "alice_wonder",
    "email": "alice@example.com",
    "prenom": "Alice"
  },
  "points_global": 150,
  "date_inscription": "2024-04-14T12:00:00Z"
}
```

---

## 3. Cas d'usage: Créer un examen complet

### Étape 1: Créer l'examen

```bash
curl -X POST http://localhost:8000/api/examens/ \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Examen de Mathématiques - Géométrie",
    "enseignant": 2,
    "matiere": 1,
    "niveau": 5,
    "duree_minutes": 120,
    "date_debut": "2024-05-01T10:00:00Z",
    "date_fin": "2024-05-01T12:00:00Z",
    "est_publie": false,
    "coefficient": 1.5
  }'
```

**Réponse** (201):
```json
{
  "id": 15,
  "titre": "Examen de Mathématiques - Géométrie",
  "enseignant": 2,
  "matiere": 1,
  "niveau": 5,
  "duree_minutes": 120,
  "date_debut": "2024-05-01T10:00:00Z",
  "date_fin": "2024-05-01T12:00:00Z",
  "est_publie": false,
  "coefficient": 1.5,
  "date_creation": "2024-04-14T12:30:00Z"
}
```

### Étape 2: Ajouter les questions

```bash
# Question 1: QCM
curl -X POST http://localhost:8000/api/questions-examen/ \
  -H "Content-Type: application/json" \
  -d '{
    "examen": 15,
    "texte": "Quel est le périmétre d_un triangle équilatéral de 5cm de côté?",
    "type_question": "QCM",
    "points": 2,
    "ordre": 1,
    "options": ["10 cm", "15 cm", "20 cm"],
    "reponse_correcte": "15 cm"
  }'

# Question 2: Réponse numérique
curl -X POST http://localhost:8000/api/questions-examen/ \
  -H "Content-Type: application/json" \
  -d '{
    "examen": 15,
    "texte": "Calculez l_aire d_un carré de 8cm de côté",
    "type_question": "NUMERIQUE",
    "points": 3,
    "ordre": 2,
    "options": [],
    "reponse_correcte": "64"
  }'
```

### Étape 3: Publier l_examen

```bash
curl -X PATCH http://localhost:8000/api/examens/15/ \
  -H "Content-Type: application/json" \
  -d '{
    "est_publie": true
  }'
```

### Étape 4: Les étudiants peuvent passer l_examen

```bash
# Créer une copie pour un étudiant
curl -X POST http://localhost:8000/api/copies-examen/ \
  -H "Content-Type: application/json" \
  -d '{
    "examen": 15,
    "etudiant": 10
  }'
```

---

## 4. Filtres et recherche avancée

### Examens publiés seulement

```bash
curl http://localhost:8000/api/examens/publies/
```

**Response**: Liste seulement des examens avec `est_publie: true`

---

### Top 5 des meilleurs étudiants

```bash
curl "http://localhost:8000/api/etudiants/top_points/?limit=5"
```

**Réponse**:
```json
[
  {
    "id": 1,
    "utilisateur": {"username": "einstein_albert"},
    "points_global": 5000,
    "date_inscription": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "utilisateur": {"username": "newton_isaac"},
    "points_global": 4850,
    "date_inscription": "2024-01-16T10:00:00Z"
  },
  ...
]
```

---

### Utilisateurs actifs uniquement

```bash
curl http://localhost:8000/api/utilisateurs/actifs/
```

---

### Ressources boutique disponibles

```bash
curl http://localhost:8000/api/ressources-boutique/disponibles/?page_size=20
```

---

## 5. Pagination

### Afficher 25 résultats par page (page 2)

```bash
curl "http://localhost:8000/api/utilisateurs/?page=2&page_size=25"
```

**Réponse** inclut:
- `count`: nombre total de résultats (ex: 150)
- `next`: URL de la page suivante
- `previous`: URL de la page précédente
- `results`: liste des 25 résultats

---

## 6. Recherche et tri

### Rechercher des matières par nom

```bash
curl "http://localhost:8000/api/matieres/?search=mathematiques&page_size=10"
```

---

### Trier les examens par date (plus récents d'abord)

```bash
curl "http://localhost:8000/api/examens/?ordering=-date_debut"
```

---

### Trier les utilisateurs par nom alphabétiquement

```bash
curl "http://localhost:8000/api/utilisateurs/?ordering=username"
```

---

## 7. Combinaison: recherche + tri + pagination

### Chercher "math" + trier par date + paginer

```bash
curl "http://localhost:8000/api/examens/?search=math&ordering=-date_debut&page=1&page_size=15"
```

---

## 8. Gestion des erreurs

### 404 - Ressource non trouvée

```bash
curl http://localhost:8000/api/utilisateurs/99999/
```

**Réponse** (404 Not Found):
```json
{
  "detail": "Not found."
}
```

---

### 400 - Requête invalide

```bash
curl -X POST http://localhost:8000/api/utilisateurs/ \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "username": ""}'
```

**Réponse** (400 Bad Request):
```json
{
  "username": ["This field may not be blank."],
  "email": ["Enter a valid email address."]
}
```

---

## 9. Utiliser avec Python requests

```python
import requests

BASE_URL = "http://localhost:8000/api"

# GET - lister
response = requests.get(f"{BASE_URL}/utilisateurs/")
data = response.json()
print(f"Total: {data['count']} utilisateurs")

# POST - créer
new_user = {
    "username": "bob_builder",
    "email": "bob@example.com",
    "prenom": "Bob",
    "password": "SecurePass123!"
}
response = requests.post(f"{BASE_URL}/utilisateurs/", json=new_user)
user_id = response.json()['id']
print(f"Créé avec ID: {user_id}")

# GET - détail
response = requests.get(f"{BASE_URL}/utilisateurs/{user_id}/")
print(f"Username: {response.json()['username']}")

# PATCH - mettre à jour
update_data = {"prenom": "Robert"}
response = requests.patch(f"{BASE_URL}/utilisateurs/{user_id}/", json=update_data)
print(f"Nouveau prénom: {response.json()['prenom']}")

# DELETE - supprimer
response = requests.delete(f"{BASE_URL}/utilisateurs/{user_id}/")
print(f"Supprimé! Status: {response.status_code}")

# Recherche
response = requests.get(f"{BASE_URL}/utilisateurs/?search=alice&ordering=-date_creation")
for user in response.json()['results']:
    print(f"- {user['username']}: {user['email']}")
```

---

## 10. Utiliser avec Postman

1. **Télécharger Postman**: https://www.postman.com/downloads/
2. **Créer une nouvelle requête**:
   - **URL**: `http://localhost:8000/api/utilisateurs/`
   - **Method**: GET (ou POST, PATCH, etc.)
   - **Body** (pour POST): JSON avec vos données
3. **Ajouter des parametres**:
   - **Params tab**: `search=alice`, `page=2`, `ordering=-date_creation`
4. **Configurer l'authentification** (après mise en place):
   - **Auth type**: Bearer Token ou Basic Auth

---

## 11. Statuts HTTP courants

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | OK - Succès | GET réussi, PATCH réussi |
| 201 | Created - Créé | POST réussi |
| 204 | No Content | DELETE réussi |
| 400 | Bad Request | Données invalides |
| 403 | Forbidden | Authentification manquante/invalide |
| 404 | Not Found | Ressource inexistante |
| 500 | Server Error | Erreur côté serveur |

---

## 🎓 Checklist de test

- [ ] GET /api/utilisateurs/ - Voir la liste
- [ ] GET /api/utilisateurs/1/ - Voir un détail
- [ ] POST /api/utilisateurs/ - Créer un nouvel utilisateur
- [ ] PATCH /api/utilisateurs/1/ - Mettre à jour
- [ ] GET /api/utilisateurs/?search=john - Chercher
- [ ] GET /api/utilisateurs/?ordering=-date_creation - Trier
- [ ] GET /api/utilisateurs/actifs/ - Action personnalisée
- [ ] GET /api/etudiants/top_points/ - Autre action

**Si tous ces tests fonctionnent, votre API est prête! ✅**

---

**Pour plus d'info**: Consultez `API_REST_DOCUMENTATION.md`
