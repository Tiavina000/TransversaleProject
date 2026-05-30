# ENENI — Site statique (HTML / CSS / JS)

Version autonome de la plateforme **ENENI** (Éducation Nationale Numérique — Madagascar), sans base de données ni backend Django.

## Fonctionnalités

- **Page d'accueil** : hero, recherche, statistiques, mission, rénovations, partenaires, CTA
- **Connexion** : sélection d'établissement, rôles (élève / enseignant / admin)
- **Tableau de bord** : fil d'actualités (élève), espace enseignant, admin actualités
- **Cours** : catalogue, lecteur avec chapitres, timer, validation QCM
- **Examens** : liste + mode examen (timer, navigation, anti-copie)
- **Bulletin** : notes et moyenne (élèves)
- **Boutique** : panier `localStorage`, checkout simulé
- **Corrections** : notation des copies (enseignants)
- **Thèmes** : vert institutionnel, sombre, clair
- **Langues** : FR, EN, MG (partiel)

## Démarrage

Ouvrir `index.html` dans un navigateur, ou lancer un serveur local :

```bash
cd static-site
python3 -m http.server 8080
```

Puis visiter : http://localhost:8080

## Comptes de démonstration

| Rôle | Identifiant | Mot de passe |
|------|-------------|--------------|
| Élève | `2026001` | `pass1234` |
| Enseignant | `prof.rabe` | `pass1234` |
| Admin | `admin` | `pass1234` |

Choisir un établissement avant de se connecter.

## Structure

```
static-site/
├── index.html          # Accueil public
├── login.html
├── dashboard.html
├── courses.html
├── course-player.html
├── exams.html
├── exam.html
├── bulletin.html
├── shop.html
├── corrections.html
├── css/
│   ├── tokens.css      # Variables de thème
│   └── main.css        # Composants & layout
├── js/
│   ├── data.js         # Données mock
│   └── app.js          # Auth, thème, navbar, panier
└── assets/
```

## Données

Toutes les données sont dans `js/data.js`. Modifier ce fichier pour enrichir cours, examens, actualités, etc.

Persistance locale :
- `sessionStorage.eneni_user` — session utilisateur
- `localStorage.eneni_theme` — thème
- `localStorage.eneni_lang` — langue
- `localStorage.eneni_cart` — panier boutique
