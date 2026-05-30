/** Données statiques ENENI — remplace l'API Django */
const ENENI_DATA = {
  stats: {
    total_schools: '2 500+',
    total_students: '1.2M',
    total_lessons: '15 000+',
    success_rate: '85%',
  },

  partners: [
    { id: 1, nom: 'UNESCO', name: 'UNESCO', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_UNESCO.svg/200px-Logo_of_UNESCO.svg.png', url: 'https://www.unesco.org' },
    { id: 2, nom: 'UNICEF', name: 'UNICEF', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_UNICEF.svg/200px-Logo_of_UNICEF.svg.png', url: 'https://www.unicef.org' },
    { id: 3, nom: 'Banque Mondiale', name: 'Banque Mondiale', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/World_Bank_logo.svg/200px-World_Bank_logo.svg.png', url: 'https://www.banquemondiale.org' },
    { id: 4, nom: 'AFD', name: 'AFD', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/8a/Logo_AFD.svg/200px-Logo_AFD.svg.png', url: 'https://www.afd.fr' },
    { id: 5, nom: 'USAID', name: 'USAID', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/USAID-Identity.svg/200px-USAID-Identity.svg.png', url: 'https://www.usaid.gov' },
    { id: 6, nom: 'JICA', name: 'JICA', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/JICA_logo.svg/200px-JICA_logo.svg.png', url: 'https://www.jica.go.jp' },
  ],

  renovations: [
    { annee: '2024', titre: 'Plan Numérique École 2024', description: 'Déploiement de tablettes et connexion internet dans 500 établissements prioritaires à travers les 22 régions de Madagascar.' },
    { annee: '2023', titre: 'Réforme des Programmes', description: 'Mise à jour des curricula nationaux alignés sur les standards internationaux avec intégration du numérique et de l\'éducation civique.' },
    { annee: '2022', titre: 'Formation des Enseignants', description: 'Plus de 10 000 enseignants formés aux outils numériques et à la pédagogie active via la plateforme ENENI.' },
    { annee: '2021', titre: 'Lancement ENENI', description: 'Création de la plateforme nationale d\'éducation numérique pour centraliser l\'accès aux ressources pédagogiques.' },
  ],

  establishments: [
    { id: 1, nom: 'Lycée Andohalo', type: 'LYCEE', type_label: 'Lycée' },
    { id: 2, nom: 'Lycée Jules Ferry', type: 'LYCEE', type_label: 'Lycée' },
    { id: 3, nom: 'CEG Ampefiloha', type: 'CEG', type_label: 'CEG' },
    { id: 4, nom: 'CEG Ankadifotsy', type: 'CEG', type_label: 'CEG' },
    { id: 5, nom: 'EPP Analakely', type: 'EPP', type_label: 'EPP' },
    { id: 6, nom: 'Lycée Rabearivelo', type: 'LYCEE', type_label: 'Lycée' },
    { id: 7, nom: 'CEG Mahajanga Centre', type: 'CEG', type_label: 'CEG' },
    { id: 8, nom: 'Lycée Faravohitra', type: 'LYCEE', type_label: 'Lycée' },
  ],

  demoUsers: {
    ETUDIANT: { id: 1, username: '2026001', password: 'pass1234', nom: 'Rakoto', prenom: 'Jean', type_utilisateur: 'ETUDIANT', niveau: 'Terminale', etablissement: 'Lycée Andohalo', numero_etudiant: '2026001', points: 1250 },
    ENSEIGNANT: { id: 2, username: 'prof.rabe', password: 'pass1234', nom: 'Rabe', prenom: 'Marie', type_utilisateur: 'ENSEIGNANT', etablissement: 'Lycée Andohalo', specialite: 'Mathématiques' },
    ADMINISTRATEUR: { id: 3, username: 'admin', password: 'pass1234', nom: 'Admin', prenom: 'ENENI', type_utilisateur: 'ADMINISTRATEUR', etablissement: 'Ministère de l\'Éducation' },
  },

  searchResults: [
    { titre: 'Mathématiques — Terminale', type: 'Cours', niveau: 'Terminale' },
    { titre: 'Physique-Chimie — Seconde', type: 'Cours', niveau: 'Seconde' },
    { titre: 'Lycée Andohalo', type: 'Établissement', niveau: 'Antananarivo' },
    { titre: 'Examen BAC Maths 2025', type: 'Examen', niveau: 'Terminale' },
    { titre: 'Français — Première', type: 'Cours', niveau: 'Première' },
    { titre: 'Histoire-Géographie', type: 'Cours', niveau: 'Troisième' },
  ],

  news: [
    { id: 1, titre: 'Calendrier des examens nationaux 2025', contenu: 'Le Ministère publie le calendrier officiel des épreuves du baccalauréat et du CEPE pour l\'année scolaire 2024-2025.', categorie: 'Examens', est_important: true, date_creation: '2025-05-15', auteur_nom: 'Ministère ENENI', image_url: 'https://images.unsplash.com/photo-1434030216561-28b683f11512?w=800&q=80' },
    { id: 2, titre: 'Nouveaux cours de Physique-Chimie disponibles', contenu: 'Des ressources vidéo et exercices interactifs sont maintenant accessibles pour les classes de Seconde et Terminale.', categorie: 'Cours', est_important: false, date_creation: '2025-05-10', auteur_nom: 'ENENI Pédagogie' },
    { id: 3, titre: 'Journée portes ouvertes numérique', contenu: 'Participez à la visioconférence nationale le 15 juin pour découvrir les nouveautés de la plateforme.', categorie: 'Événements', est_important: true, date_creation: '2025-05-08', auteur_nom: 'ENENI Événements', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 4, titre: 'Résultats du concours de mathématiques', contenu: 'Félicitations aux lauréats régionaux ! Consultez les résultats complets sur votre espace élève.', categorie: 'Annonces', est_important: false, date_creation: '2025-05-01', auteur_nom: 'Direction Régionale' },
    { id: 5, titre: 'Tournoi inter-établissements de football', contenu: 'Inscriptions ouvertes jusqu\'au 30 mai pour le championnat scolaire national.', categorie: 'Sport', est_important: false, date_creation: '2025-04-28', auteur_nom: 'ENENI Sport' },
    { id: 6, titre: 'Semaine de la culture malgache', contenu: 'Ateliers, conférences et spectacles dans tous les établissements du 10 au 17 juin.', categorie: 'Culture', est_important: false, date_creation: '2025-04-20', auteur_nom: 'ENENI Culture' },
  ],

  studentStats: {
    cours_en_cours: 4,
    cours_termines: 12,
    heures_etude: 48,
    progression: 68,
    prochain_examen: '2025-06-15T08:00:00',
  },

  courses: [
    { id: 1, titre: 'Mathématiques', matiere: 'Mathématiques', niveau: 'Terminale', emoji: '📐', color: 'rgba(27,138,90,0.15)', duree: 'Programme complet', progression: 72 },
    { id: 2, titre: 'Physique-Chimie', matiere: 'Physique-Chimie', niveau: 'Terminale', emoji: '⚗️', color: 'rgba(124,58,237,0.15)', duree: 'Programme complet', progression: 45 },
    { id: 3, titre: 'Français', matiere: 'Français', niveau: 'Terminale', emoji: '📖', color: 'rgba(214,69,69,0.15)', duree: 'Programme complet', progression: 88 },
    { id: 4, titre: 'Histoire-Géographie', matiere: 'Histoire-Géographie', niveau: 'Terminale', emoji: '🌍', color: 'rgba(217,119,6,0.15)', duree: 'Programme complet', progression: 30 },
    { id: 5, titre: 'SVT', matiere: 'SVT', niveau: 'Terminale', emoji: '🔬', color: 'rgba(6,182,212,0.15)', duree: 'Programme complet', progression: 55 },
    { id: 6, titre: 'Anglais', matiere: 'Anglais', niveau: 'Terminale', emoji: '🇬🇧', color: 'rgba(109,40,217,0.15)', duree: 'Programme complet', progression: 60 },
  ],

  courseDetails: {
    1: {
      id: 1, titre: 'Mathématiques', matiere: 'Mathématiques',
      chapitres: [
        { id: 1, titre: 'Analyse — Limites et continuité', lecons: [
          { id: 1, titre: 'Introduction aux limites', contenu: '<h3>Limites de fonctions</h3><p>La notion de limite est fondamentale en analyse. Une fonction f admet une limite L en a si...</p><p>Pour tout ε > 0, il existe δ > 0 tel que |f(x) - L| < ε dès que |x - a| < δ.</p>' },
          { id: 2, titre: 'Théorèmes fondamentaux', contenu: '<h3>Théorème des gendarmes</h3><p>Si g(x) ≤ f(x) ≤ h(x) et lim g = lim h = L, alors lim f = L.</p>' },
        ]},
        { id: 2, titre: 'Algèbre — Matrices', lecons: [
          { id: 3, titre: 'Opérations sur les matrices', contenu: '<h3>Multiplication matricielle</h3><p>Le produit AB est défini si le nombre de colonnes de A égale le nombre de lignes de B.</p>' },
        ]},
      ],
      fichiers: [
        { id: 1, nom: 'Cours_Limites.pdf', type: 'PDF' },
        { id: 2, nom: 'Exercices_Corriges.pdf', type: 'PDF' },
      ],
      validation: { question: 'Quelle est la limite de 1/x quand x tend vers +∞ ?', options: ['0', '1', '+∞', 'Indéfinie'], correct: 0 },
    },
    2: {
      id: 2, titre: 'Physique-Chimie', matiere: 'Physique-Chimie',
      chapitres: [
        { id: 1, titre: 'Optique — La lumière', lecons: [
          { id: 1, titre: 'Réflexion et réfraction', contenu: '<h3>Lois de Snell-Descartes</h3><p>n₁ sin i = n₂ sin r</p>' },
        ]},
      ],
      fichiers: [{ id: 1, nom: 'TP_Optique.pdf', type: 'PDF' }],
      validation: { question: 'La vitesse de la lumière dans le vide est approximativement :', options: ['3×10⁸ m/s', '3×10⁶ m/s', '340 m/s', '1500 m/s'], correct: 0 },
    },
  },

  exams: [
    { id: 1, titre: 'Examen Blanc — Mathématiques', matiere: 'Mathématiques', duree_minutes: 120, nb_questions: 20, statut: 'DISPONIBLE', type: 'QCM' },
    { id: 2, titre: 'Contrôle Physique-Chimie', matiere: 'Physique-Chimie', duree_minutes: 60, nb_questions: 15, statut: 'DISPONIBLE', type: 'MIXTE' },
    { id: 3, titre: 'Évaluation Français', matiere: 'Français', duree_minutes: 90, nb_questions: 10, statut: 'PLANIFIE', type: 'REDACTION' },
    { id: 4, titre: 'Test Anglais — Compréhension', matiere: 'Anglais', duree_minutes: 45, nb_questions: 30, statut: 'TERMINE', type: 'QCM' },
  ],

  examQuestions: {
    1: [
      { id: 1, type: 'QCM', texte: 'Quelle est la dérivée de x² ?', options: ['2x', 'x', 'x²', '2'], correct: 0 },
      { id: 2, type: 'QCM', texte: 'La solution de l\'équation 2x + 4 = 0 est :', options: ['x = -2', 'x = 2', 'x = 4', 'x = -4'], correct: 0 },
      { id: 3, type: 'VRAI_FAUX', texte: 'La fonction sin(x) est périodique de période 2π.', correct: true },
      { id: 4, type: 'TEXTE', texte: 'Énoncez le théorème de Pythagore et donnez un exemple d\'application.' },
      { id: 5, type: 'QCM', texte: 'L\'intégrale de 2x dx est :', options: ['x² + C', '2x² + C', 'x + C', '2 + C'], correct: 0 },
    ],
    2: [
      { id: 1, type: 'QCM', texte: 'L\'unité SI de la force est :', options: ['Newton', 'Joule', 'Watt', 'Pascal'], correct: 0 },
      { id: 2, type: 'VRAI_FAUX', texte: 'La lumière se propage en ligne droite dans un milieu homogène.', correct: true },
    ],
  },

  notes: [
    { matiere: 'Mathématiques', note: 16.5, coefficient: 4, appreciation: 'Excellent' },
    { matiere: 'Physique-Chimie', note: 14, coefficient: 3, appreciation: 'Très bien' },
    { matiere: 'Français', note: 15, coefficient: 3, appreciation: 'Très bien' },
    { matiere: 'Histoire-Géographie', note: 12, coefficient: 2, appreciation: 'Bien' },
    { matiere: 'Anglais', note: 13.5, coefficient: 2, appreciation: 'Bien' },
    { matiere: 'SVT', note: 11, coefficient: 2, appreciation: 'Passable' },
  ],

  shop: [
    { id: 1, titre: 'Manuel Maths Terminale', type: 'LIVRE', prix: 25000, description: 'Manuel officiel conforme au programme national.', emoji: '📚' },
    { id: 2, titre: 'Exercices Physique-Chimie', type: 'EXERCICES', prix: 15000, description: '200 exercices corrigés niveau Terminale.', emoji: '✏️' },
    { id: 3, titre: 'Cours Vidéo Anglais', type: 'VIDEO', prix: 20000, description: '30 heures de cours vidéo interactif.', emoji: '🎬' },
    { id: 4, titre: 'Pack Révision BAC', type: 'COURS', prix: 35000, description: 'Toutes matières — fiches et annales.', emoji: '🎯' },
    { id: 5, titre: 'Atlas Histoire-Géo', type: 'LIVRE', prix: 18000, description: 'Atlas cartographique Madagascar et monde.', emoji: '🗺️' },
    { id: 6, titre: 'SVT — Biologie Cellulaire', type: 'COURS', prix: 12000, description: 'Cours complet avec schémas animés.', emoji: '🔬' },
  ],

  corrections: [
    { id: 1, eleve: 'Rakoto Jean', examen: 'Mathématiques — Contrôle 3', date: '2025-05-20', statut: 'SOUMIS', contenu: 'La dérivée de f(x) = x³ est f\'(x) = 3x². Pour la limite...', note: null },
    { id: 2, eleve: 'Rasoa Marie', examen: 'Mathématiques — Contrôle 3', date: '2025-05-20', statut: 'SOUMIS', contenu: 'J\'ai utilisé le théorème des gendarmes pour montrer que...', note: null },
    { id: 3, eleve: 'Andria Paul', examen: 'Physique — TP Optique', date: '2025-05-18', statut: 'CORRIGE', contenu: 'Loi de Snell: n1*sin(i) = n2*sin(r)...', note: 14 },
    { id: 4, eleve: 'Rabe Sophie', examen: 'Français — Dissertation', date: '2025-05-15', statut: 'CORRIGE', contenu: 'La liberté est un concept philosophique fondamental...', note: 16 },
  ],

  notifications: [
    { id: 1, title: 'Nouvel examen disponible', message: 'L\'examen de Mathématiques est ouvert jusqu\'au 30 mai.', type: 'EXAMEN', read: false },
    { id: 2, title: 'Cours mis à jour', message: 'Le chapitre "Limites" a été enrichi avec de nouvelles vidéos.', type: 'COURS', read: false },
    { id: 3, title: 'Visioconférence demain', message: 'Cours de Physique en direct à 14h00.', type: 'VISIO', read: true },
    { id: 4, title: 'Note publiée', message: 'Votre note de Français est disponible sur le bulletin.', type: 'NOTE', read: true },
  ],

  upcomingExams: [
    { titre: 'BAC Blanc — Maths', date: '2025-06-15' },
    { titre: 'CEPE — Français', date: '2025-06-20' },
  ],

  teacherData: {
    matieres: ['Mathématiques', 'Physique-Chimie', 'Français', 'Histoire-Géographie', 'SVT', 'Anglais'],
    selectedMatiere: 'Mathématiques',
    niveau: 'Terminale',
    chapitres: [
      {
        id: 1, titre: 'Analyse — Limites', description: 'Étude des limites et de la continuité des fonctions',
        lecons: [
          { id: 1, titre: 'Introduction aux limites', contenue_texte: '<h3>Limites de fonctions</h3><p>La notion de limite est fondamentale en analyse. Une fonction f admet une limite L en a si pour tout ε > 0, il existe δ > 0 tel que |f(x) - L| < ε dès que |x - a| < δ.</p>', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', objectifs: 'Comprendre la définition formelle d\'une limite', duree_estimee: 45, est_publie: true, fichiers: [{ id: 1, nom: 'cours_limites.pdf', type_fichier: 'PDF' }] },
          { id: 2, titre: 'Théorèmes fondamentaux', contenue_texte: '<h3>Théorème des gendarmes</h3><p>Si g(x) ≤ f(x) ≤ h(x) et lim g = lim h = L, alors lim f = L.</p>', video_url: '', objectifs: 'Savoir appliquer le théorème des gendarmes', duree_estimee: 30, est_publie: false, fichiers: [] },
        ]
      },
      {
        id: 2, titre: 'Algèbre — Matrices', description: 'Opérations sur les matrices',
        lecons: [
          { id: 3, titre: 'Multiplication matricielle', contenue_texte: '<h3>Produit matriciel</h3><p>Le produit AB est défini si le nombre de colonnes de A égale le nombre de lignes de B.</p>', video_url: '', objectifs: 'Maîtriser la multiplication de matrices', duree_estimee: 60, est_publie: true, fichiers: [] },
        ]
      },
    ]
  },

  recommandations: [
    {
      id: 1,
      cours_id: 2,
      score_pertinence: 0.92,
      explication: 'Votre progression en Physique-Chimie (45%) est en retard. Ce cours vous aidera à rattraper le niveau attendu.',
      est_consultee: false,
    },
    {
      id: 2,
      cours_id: 4,
      score_pertinence: 0.85,
      explication: 'Histoire-Géographie (30%) nécessite une attention particulière pour préparer les examens.',
      est_consultee: false,
    },
    {
      id: 3,
      cours_id: 5,
      score_pertinence: 0.78,
      explication: 'Un effort sur SVT (55%) consoliderait vos bases scientifiques avant le BAC.',
      est_consultee: false,
    },
  ],
};
