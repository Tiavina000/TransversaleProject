# ENENI — Resume de Projet

## 1. Technologies Utilisées

### Backend : Django + Django REST Framework
| Technologie | Role |
|---|---|
| **Django 6.0** | Framework web Python (ORM, Admin, Auth, Migrations) |
| **Django REST Framework (DRF)** | Construction de l'API REST (ModelViewSet, Serializers, Permissions) |
| **djangorestframework-simplejwt** | Authentification par JWT (JSON Web Token) |
| **django-modeltranslation** | Traduction des champs de la base de donnees (MG/FR/EN) |
| **SQLite3** | Base de donnees (dev) |
| **LiveKit** | Visioconference WebRTC (serveur de streaming video) |

### Frontend : React 19 + Vite 8
| Technologie | Role |
|---|---|
| **React 19** | Bibliotheque UI (composants, hooks, state) |
| **Vite 8** | Bundler / dev server (remplace Webpack) |
| **React Router v7** | Routage cote client (SPA) |
| **Axios** | Client HTTP pour appeler l'API Django |
| **Framer Motion** | Animations (transitions, layout, gestes) |
| **Tailwind CSS v4** | Framework CSS utilitaire (classes atomiques) |
| **Lucide React** | Icons SVG (CheckCircle, Loader2, User, etc.) |
| **LiveKit Components** | Interface video WebRTC prete a l'emploi |
| **i18next + react-i18next** | Internationalisation (voir section 1.1) |
| **Playwright** | Tests E2E |
| **React Intersection Observer** | Detection du scroll (infinite scroll) |

---

### 1.1 Approfondissement : i18n (Internationalisation)

#### Definition
i18n (internationalization) est le processus de conception d'une application pour qu'elle puisse etre adaptee a differentes langues et regions sans modification du code source.

#### Role dans ENENI
ENENI cible les utilisateurs de Madagascar, pays multilingue (Malgache, Francais, Anglais). L'i18n permet de basculer l'interface utilisateur entre ces langues a la volee, sans rechargement de page.

#### Comment c'est implemente

**Fichier de config** — `frontend/src/i18n.js` :
```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['mg', 'fr', 'en'],
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
    interpolation: { escapeValue: false },
  });
```

- **Backend** `i18next-http-backend` : charge les fichiers JSON de traduction depuis `/locales/{lang}/translation.json`
- **LanguageDetector** : detecte la langue via `localStorage` (cle `eneni_lang`) ou le navigateur
- **fallbackLng** `'fr'` : si une cle n'est pas traduite, affiche la version francaise

**Fichiers de traduction** — `frontend/src/locales/fr/translation.json` (544 cles) :
Structure hierarchique par module :
```json
{
  "nav": { "home": "Accueil", "exams": "Examens", "bulletin": "Mon Bulletin" },
  "exam": { "start": "Commencer", "submit": "Soumettre", "time_left": "Temps restant" },
  "corrections": { "title": "Corrections", "finalize": "Finaliser" }
}
```

**Utilisation dans les composants** — hook `useTranslation()` :
```jsx
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { t, i18n } = useTranslation();
  const changeLang = (lng) => i18n.changeLanguage(lng);
  
  return (
    <button onClick={() => changeLang('mg')}>Malgache</button>
    <span>{t('nav.home')}</span>
  );
}
```

- `t('nav.home')` retourne "Accueil" en FR, "Home" en EN, "Trano" en MG
- `i18n.changeLanguage(lng)` change la langue et met a jour tous les composants

**Backend Django** — `django-modeltranslation` traduit les champs en base :
```python
# translation.py
from modeltranslation.translator import translator, TranslationOptions
from core.models import Matiere

class MatiereTranslationOptions(TranslationOptions):
    fields = ('nom', 'description')

translator.register(Matiere, MatiereTranslationOptions)
```

Cela cree automatiquement les colonnes `nom_fr`, `nom_mg`, `nom_en` (etc.) pour chaque champ enregistre.

#### Pourquoi i18n ?
1. **Accessibilite** : les eleves de Madagascar parlent malgache, les professeurs utilisent le francais, les partenaires internationaux l'anglais
2. **Legislation** : le systeme educatif malgache est bilingue (MG/FR)
3. **UX** : l'utilisateur choisit sa langue sans changer d'URL ni recharger
4. **Separation** : le code reste invariant, seules les chaines de caractere changent

---

## 2. Architecture Backend (Django)

```
Backend/
├── ENENI/                 # Configuration du projet Django
│   ├── settings.py        # DB, apps, middleware, REST config, JWT, LiveKit
│   ├── urls.py            # Routes racine (admin, api, media)
│   └── wsgi.py / asgi.py  # Serveurs WSGI/ASGI
├── core/                  # Application principale
│   ├── models/            # 30+ modeles (voir 2.1)
│   ├── serializers/       # 30+ serializers (voir 2.2)
│   ├── views/             # 30+ ViewSets (voir 2.3)
│   ├── services/          # Algorithmes metier (voir 2.4)
│   ├── urls.py            # 86+ routes API (voir 2.5)
│   └── permissions.py     # Droits d'acces
├── manage.py
└── db.sqlite3
```

### 2.1 Models (core/models/)

#### Hierarchie Django

```
models/
├── base.py                   # TimeStampedModel, SoftDeleteModel (classes abstraites)
├── utilisateurs.py           # Utilisateur -> Etudiant / Enseignant / AdminPlateforme
├── etablissements.py         # Etablissement -> Classe
├── pedagogie.py              # NiveauScolaire -> Matiere -> Chapitre -> Lecon
├── examens.py                # Examen -> QuestionExamen -> CopieExamen -> ReponseExamen
├── communications.py         # Actualite, Notification
├── boutique.py               # RessourceBoutique, Panier -> Commande
├── visioconference.py        # SessionVisio -> ParticipationVisio, QuestionVisio
└── intelligence_artificielle.py  # RequestIA, Recommandation
```

**Principe** : chaque fichier = un domaine metier. Les ForeignKey creent les relations entre domaines.

**Algorithme de progression** (`ProgressionChapitre`) :
- L'etudiant consulte des lecons dans un chapitre
- `SessionEtude` enregistre le temps passe avec `heartbeat` (ping toutes les 30s)
- Quand l'etudiant termine toutes les lecons, `ProgressionChapitre.est_valide` passe a `True`

### 2.2 Serializers

Chaque serializer suit le pattern :
```python
class ExamenSerializer(serializers.ModelSerializer):
    questions = QuestionExamenSerializer(many=True, read_only=True)  # Nested
    soumis = serializers.SerializerMethodField()                     # Champ calcule
    
    class Meta:
        model = Examen
        fields = ['id', 'titre', 'matiere', 'niveau', 'questions', 'soumis']
        read_only_fields = ['id', 'enseignant', 'date_creation']
```

**Algorithmes de serialisation** :
- `ExamenSerializer.get_soumis()` : verifie si l'etudiant courant a deja soumis sa copie
- `CopieCorrectionSerializer.get_statut()` : retourne `'soumis'`, `'corrige'` ou `'valide'` selon l'etat de la copie
- `NotificationSerializer` : virtualise les champs `title`, `read`, `created_at`, `type` pour le frontend

### 2.3 Views (core/views/)

Pattern ViewSet DRF :
```python
class ExamenViewSet(viewsets.ModelViewSet):
    queryset = Examen.objects.all()
    serializer_class = ExamenSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Filtre selon le type d'utilisateur
        if user.type_utilisateur == 'ENSEIGNANT':
            return qs.filter(enseignant=user.enseignant_profile)     # ses examens
        elif user.type_utilisateur == 'ETUDIANT':
            return qs.filter(est_publie=True, niveau=etudiant.niveau) # examens publies
        
    @action(detail=True, methods=['post'])
    def ajouter_question(self, request, pk=None):
        # Action personnalisee (non CRUD)
```

**Algorithmes clefs** :

| Endpoint | Algorithme |
|---|---|
| `examens/<pk>/soumettre/` | Pour chaque reponse etudiant : cree `ReponseExamen`, si QCM/VF compare avec `reponse_correcte`, calcule `points_obtenus` automatiquement |
| `examens/<pk>/publier/` | Cherche tous les `Etudiant` du meme `Niveau`, cree une `Notification` pour chacun |
| `corrections/<pk>/noter/` | Sauvegarde `note_obtenue` sur la copie (max 20) |
| `corrections/<pk>/valider/` | Passe `note_validee=True`, cree `Notification` pour l'etudiant, si `note_obtenue` est null la calcule depuis les `ReponseExamen.points_obtenus` |
| `mes-notes/` | Groupe les copies par `matiere`, separe `session='CC'` et `session='EF'`, calcule `(CC + EF) / 2` si les deux existent |

**Algorithme de validation** (`CorrectionViewSet.valider`) :
```
1. Recuperer la copie
2. Si deja validee -> 400
3. Si note_obtenue est null :
   a. Parcourir toutes les ReponseExamen de la copie
   b. Somme des points_obtenus
   c. Somme des points maximum des questions
   d. note = (pts_obtenus / pts_max) * 20
4. note_validee = True, date_validation = maintenant
5. Creer notification pour l'etudiant
6. Retourner la copie mise a jour
```

### 2.4 Services (core/services/)

| Fichier | Classe | Algorithme |
|---|---|---|
| `trie_service.py` | `NavigationTrie` (Singleton) | Arbre de prefixe pour l'autocompletion de recherche. Chaque noeud contient des enfants (lettres) et des suggestions. Permet de trouver en O(k) (k = longueur du mot tape) toutes les lecons/matieres/actualites correspondant a la requete |
| `scoring_service.py` | `ScoringService` | Moteur de recommandation : analyse les resultats d'examens d'un etudiant, identifie les matieres faibles, genere des recommandations de lecons a reviser avec un score de pertinence |
| `graph_service.py` | `CurriculumGraph` | Graphe oriente du programme : les lecons sont des noeuds, les prerequis sont des aretes. Calcule le chemin optimal (trajectoire) pour un etudiant depuis son niveau actuel jusqu'a un objectif |
| `voice_service.py` | `VoiceCommandProcessor` | NLP basique : tokenise une commande vocale, cherche des mots-cles dans un dictionnaire (ex: "ouvrir lecon maths" -> action=open, target=lecon, subject=maths) |
| `livekit_service.py` | `generate_livekit_token()` | Genere un JWT signe pour LiveKit avec les permissions de l'utilisateur (rejoindre une salle, publier audio/video) |

### 2.5 URLs (core/urls.py)

Utilisation du `DefaultRouter` DRF :
```python
router = DefaultRouter()
router.register(r'examens', ExamenViewSet)
router.register(r'questions-examen', QuestionExamenViewSet)
# ... 25+ enregistrements

urlpatterns = [
    path('api/auth/login/', CustomTokenObtainPairView.as_view()),
    path('api/mes-notes/', MesNotesView.as_view()),
    path('api/corrections/', CorrectionViewSet.as_view({'get': 'list'})),
    # Actions personnalisees ajoutees via @action decorator
] + router.urls
```

Les actions personnalisees (`@action`) generent des URLs automatiquement :
- `@action(detail=True, methods=['post'])` → `api/examens/{pk}/ajouter-question/`
- `@action(detail=False, methods=['get'])` → `api/examens/publies/`

---

## 3. Architecture Frontend (React)

```
src/
├── main.jsx                 # Point d'entree
├── App.jsx                  # Routeur + Auth + Provider
├── i18n.js                  # Configuration i18n
├── index.css                # Theme CSS (variables, Tailwind)
├── components/              # Composants reutilisables
│   ├── Exam/                # ExamMode (passation d'examen)
│   ├── Feed/                # Dashboards, cours, stories
│   ├── Layout/              # Navbar (navigation, notifications, theme/lang)
│   ├── UI/                  # ThemeSwitcher, VoiceInput, AttentionIndicator
│   └── Visio/               # VisioGrid (grille video LiveKit)
├── pages/                   # Pages (9 pages)
├── hooks/                   # Hooks personnalises (7 hooks)
├── services/                # Axios + API wrappers
├── context/                 # ThemeContext
└── locales/                 # Traductions JSON
```

### 3.1 Flux de donnees (Data Flow)

```
Utilisateur -> Composant React -> Hook personnalise -> Service API (Axios) -> API Django -> Base de donnees
                                                                                           |
                                                                                     Serializer -> Modele
```

**Exemple complet** (connexion) :
```
1. LoginPage.jsx         : formulaire email/mot de passe
2. useAuth.js            : appelle authAPI.login()
3. api.js (authAPI)      : axios.post('/api/auth/login/', { email, password })
4. Django URL            : CustomTokenObtainPairView
5. Serializer            : CustomTokenObtainPairSerializer valide les identifiants
6. Modele Utilisateur    : verifie email/mot de passe, retourne JWT
7. Reponse               : { access, refresh, user: { id, nom, role } }
8. localStorage          : sauvegarde le token
9. App.jsx               : charge le user via authAPI.me()
10. React Router         : redirige vers le dashboard selon le role
```

### 3.2 Pages et leurs roles

| Page | Route | Role | Composants cles |
|---|---|---|---|
| `LandingPage` | `/` | Page publique (stats, partenaires, renovations) | Stats cards, Carousel partenaires |
| `LoginPage` | `/login` | Authentification (choix etablissement, role) | Formulaire login, selecteur etablissement |
| `CoursesPage` | `/courses` | Catalogue de cours (eleve) ou gestion (prof) | CourseCard, InifiniteScroll, QuestionManager |
| `CoursePlayer` | `/courses/:id` | Lecteur de lecon (video, texte, fichiers) | RichTextEditor, courseTimer |
| `ExamsPage` | `/exams` | Liste d'examens (eleve) ou CRUD (prof) | ExamCard, ExamForm, QuestionForm, QuestionManager |
| `CorrectionsPage` | `/corrections` | Correction de copies (prof) | CopieCard (expand, toggle, note input, finaliser) |
| `BulletinPage` | `/bulletin` | Releve de notes (eleve) | Tableau de notes, moyenne generale |
| `LiveClass` | `/live/:id` | Classe en direct (LiveKit) | VisioGrid, chat, hand-raise |
| `ShopPage` | `/shop` | Boutique de ressources | Cart, resource cards |

### 3.3 Hooks personnalises

| Hook | Role | Algorithme |
|---|---|---|
| `useAuth` | Authentification | Au montage, lit le token du localStorage, appelle `authAPI.me()` pour charger l'utilisateur. Expose `user`, `login()`, `logout()` |
| `useExamSecurity` | Securite d'examen | Bloque clic droit, Ctrl+C/V, F12, Alt+F4. Force le plein ecran. A la sortie du plein ecran, affiche un avertissement |
| `useSurveillance` | Surveillance d'examen | Detecte les changements d'onglet (`visibilitychange`), les pertes de focus (`window.blur`), les envoie au backend via `surveillanceAPI.logEvent()` |
| `useNotifications` | Notifications temps reel | Interrogation toutes les 30s de `notifAPI.count()`. Normalise les champs (`title`, `read`, `created_at`, `type`). Gere le marquage comme lu |
| `useCourseTimer` | Timer de session d'etude | Compte le temps passe sur une lecon. Envoie un `heartbeat` toutes les 30s. Se met en pause si la fenetre est cachee ou si l'ecran est verrouille |
| `useSpeech` | Synthese vocale + Reconnaissance | Wrapper autour de la Web Speech API. `speak(text)` pour TTS, `listen()` pour STT avec retour en temps reel |
| `useFullscreen` | API Plein ecran | Abstraction de `document.fullscreenElement`, `requestFullscreen()`, `exitFullscreen()` |

### 3.4 Services API (api.js)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Intercepteur : ajoute le token JWT a chaque requete
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur : si 401, tente de refresher le token
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        const { data } = await axios.post('/api/auth/refresh/', { refresh });
        localStorage.setItem('access_token', data.access);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return api(error.config);
      }
    }
    throw error;
  }
);

// Wrappers par domaine
export const examAPI = {
  list:        (params) => api.get('/examens/', { params }),
  detail:      (id) => api.get(`/examens/${id}/`),
  create:      (d) => api.post('/examens/', d),
  start:       (id) => api.post(`/examens/${id}/start/`),
  submit:      (id, d) => api.post(`/examens/${id}/submit/`, d),
  ajouterQuestion: (id, d) => api.post(`/examens/${id}/ajouter-question/`, d),
};
```

### 3.5 Algorithme de correction (CorrectionsPage)

```
Etat initial : CopieCard (affiche eleve, matiere, statut, note)

Au clic : expand
1. appeler copieAPI.detail(id) -> retourne les reponses
2. Pour chaque reponse :
   - QCM / VRAI_FAUX -> bouton toggle (correct/incorrect)
   - TEXTE / NUMERIQUE / REDACTION -> champ note + bouton Appliquer

Toggle correct/incorrect :
1. reponseAPI.update(id, { est_correct: !current })
2. Mettre a jour points_obtenus (0 ou question_points)
3. Recalculer la note totale : sum(points_obtenus) / sum(question_points) * 20
4. correctionAPI.noter(copie_id, nouvelle_note)

Finaliser :
1. Si note_obtenue est null, la calculer depuis les points_obtenus
2. correctionAPI.valider(copie_id)
3. note_validee = True -> tous les champs desactives
4. La note apparait dans le bulletin de l'eleve
```

### 3.6 Algorithme d'examen (ExamMode)

```
Demarrage :
1. requestFullscreen() -> verrouillage plein ecran
2. examAPI.start(examId) -> enregistre date_debut sur le serveur
3. useExamSecurity() active les blocages
4. useSurveillance() commence a logger les evenements

Pendant l'examen :
1. Timer decremente chaque seconde (duree_minutes * 60)
2. Sync toutes les 30s avec le serveur (examAPI.syncTimer)
3. Reponses stockees dans state { [questionId]: reponseText }
4. L'etudiant navigue entre les questions

Soumission :
1. Transformer answers en [{ question_id, reponse }, ...]
2. examAPI.submit(examId, { reponses })
3. est_termine = True
4. Si QCM/VF, le backend compare et note automatiquement
5. Redirection vers la liste des examens
```

---

## 4. Algorithmes Metier Importants

### 4.1 Calcul de la note finale (MesNotesView)

```python
copies = CopieExamen.objects.filter(etudiant=etudiant, est_termine=True, note_validee=True)
by_matiere = groupby(copies, by='examen__matiere__nom')

for chaque matiere:
    cc_notes = [c.note for c in copies if c.examen.session == 'CC']
    ef_notes = [c.note for c in copies if c.examen.session == 'EF']
    
    if cc_notes and ef_notes:
        note = (moyenne(cc_notes) + moyenne(ef_notes)) / 2
    elif ef_notes:
        note = moyenne(ef_notes)
    elif cc_notes:
        note = moyenne(cc_notes)
```

### 4.2 Auto-correction QCM / VRAI_FAUX (ExamenViewSet.soumettre)

```python
for chaque question de l'examen:
    reponse_etudiant = request.data['reponses'][question.id]
    
    if question.type_question in ('QCM', 'VRAI_FAUX'):
        est_correct = (reponse_etudiant == question.reponse_correcte)
        points_obtenus = question.points if est_correct else 0
    else:
        est_correct = False  # le professeur corrigera manuellement
        points_obtenus = 0
    
    ReponseExamen.objects.create(
        copie=copie,
        question=question,
        reponse_etudiant=reponse_etudiant,
        est_correct=est_correct,
        points_obtenus=points_obtenus,
    )
```

### 4.3 Recommandation (ScoringService)

```python
class ScoringService:
    def generer_recommandations(self, etudiant):
        copies = CopieExamen.objects.filter(etudiant=etudiant, note_validee=True)
        matieres_faibles = []
        
        for c in copies:
            if c.note_obtenue < 10:  # en dessous de la moyenne
                matieres_faibles.append(c.examen.matiere)
        
        lecons_a_reviser = Lecon.objects.filter(
            matiere__in=matieres_faibles,
            niveau=etudiant.niveau
        ).order_by('-date_creation')[:5]
        
        for lecon in lecons_a_reviser:
            Recommandation.objects.create(
                etudiant=etudiant,
                lecon=lecon,
                score_pertinence=self._calculer_pertinence(etudiant, lecon)
            )
```

### 4.4 Trie de navigation (NavigationTrie)

```
Pour chaque requete de recherche (tape "math") :
1. Parcourir l'arbre depuis la racine : 'm' -> 'a' -> 't' -> 'h'
2. Si le chemin existe, collecter toutes les feuilles sous ce noeud (DFS)
3. Retourner les suggestions : ["Mathematiques", "Maths 6eme", ...]
4. Complexite : O(k + s) ou k = longueur de la requete, s = nombre de suggestions
```

### 4.5 Correction orthographique (spellcheck)

L'endpoint `corrections/<pk>/spellcheck/` analyse la reponse d'un etudiant :
1. Decouper le texte en mots
2. Pour chaque mot, verifier s'il existe dans le dictionnaire
3. Retourner une liste de fautes avec les corrections suggerees

---

## 5. Securite

### Backend
- **Permissions** : `IsAuthenticated` global, `IsEnseignantOrReadOnly` pour les creations, filtres par `get_queryset()` selon le role
- **JWT** : tokens d'acces (15min) + refresh (24h), stockes en `localStorage`
- **Validation** : DRF Serializers valident les entrees, `IntegrityError` capture les doublons

### Frontend
- **ExamSecurity** : plein ecran force, blocage des raccourcis (F12, Ctrl+Shift+I),
  blocage du copier/coller, detection de perte de focus
- **Surveillance** : chaque changement d'onglet est logue (timestamp, type d'evenement)
- **Intercepteur Axios** : rafraichissement automatique du JWT en cas de 401
