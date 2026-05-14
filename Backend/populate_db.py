import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ENENI.settings')
django.setup()

from core.models import NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia

def populate():
    print("Starting population...")

    # 1. Create Levels
    levels_data = [
        ('Maternelle', 1), ('CP', 2), ('CE1', 3), ('CE2', 4),
        ('CM1', 5), ('CM2', 6), ('6ème', 7), ('5ème', 8),
        ('4ème', 9), ('3ème', 10), ('2nde', 11), ('1ère', 12), ('Terminale', 13)
    ]
    
    levels = {}
    for nom, ordre in levels_data:
        obj, created = NiveauScolaire.objects.get_or_create(nom=nom, defaults={'ordre': ordre})
        levels[nom] = obj
        if created:
            print(f"Level {nom} created.")

    # 2. Create Subjects
    subjects_data = [
        ('Mathématiques', 'MATH', 'Étude des nombres, des formes et des structures.'),
        ('Français', 'FRA', 'Langue et littérature française.'),
        ('Malagasy', 'MLG', 'Tenireny sy kolontsaina malagasy.'),
        ('Physique-Chimie', 'PC', 'Étude de la matière et de l\'énergie.'),
        ('SVT', 'SVT', 'Sciences de la Vie et de la Terre.'),
        ('Histoire-Géo', 'HG', 'Étude du passé et de l\'espace terrestre.'),
        ('Anglais', 'ANG', 'Langue internationale.'),
        ('Philosophie', 'PHILO', 'Réflexion critique sur le monde et l\'existence.'),
        ('Informatique', 'INFO', 'Science du traitement automatique de l\'information.'),
    ]

    matieres = {}
    for i, (nom, code, desc) in enumerate(subjects_data):
        obj, created = Matiere.objects.get_or_create(
            code=code, 
            defaults={'nom': nom, 'description': desc, 'ordre': i}
        )
        # Link to levels (most subjects are for secondary, but some for primary too)
        if nom in ['Mathématiques', 'Français', 'Malagasy']:
            obj.niveaux.set(list(levels.values()))
        else:
            # Secondary only (6ème to Terminale)
            sec_levels = [levels[n] for n in ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']]
            obj.niveaux.set(sec_levels)
        
        matieres[nom] = obj
        if created:
            print(f"Subject {nom} created.")

    # 3. Create Chapters and Lessons for Terminale Mathématiques
    t_math_chapters = [
        {
            'titre': 'Nombres Complexes',
            'order': 1,
            'lessons': [
                {'titre': 'Forme algébrique et représentation géométrique', 'duree': 45},
                {'titre': 'Forme trigonométrique et exponentielle', 'duree': 60},
                {'titre': 'Équations du second degré', 'duree': 30},
            ]
        },
        {
            'titre': 'Fonctions Logarithmes',
            'order': 2,
            'lessons': [
                {'titre': 'La fonction logarithme népérien', 'duree': 50},
                {'titre': 'Propriétés et limites', 'duree': 40},
            ]
        },
        {
            'titre': 'Suites Numériques',
            'order': 3,
            'lessons': [
                {'titre': 'Suites arithmétiques et géométriques', 'duree': 45},
                {'titre': 'Convergence des suites', 'duree': 55},
            ]
        }
    ]

    for chap_data in t_math_chapters:
        chap, created = Chapitre.objects.get_or_create(
            matiere=matieres['Mathématiques'],
            niveau=levels['Terminale'],
            order=chap_data['order'],
            defaults={'titre': chap_data['titre']}
        )
        if created:
            print(f"Chapter {chap.titre} created.")
        
        for i, lesson_data in enumerate(chap_data['lessons']):
            les, l_created = Lecon.objects.get_or_create(
                chapitre=chap,
                order=i+1,
                defaults={
                    'titre': lesson_data['titre'],
                    'duree_estimee': lesson_data['duree'],
                    'contenue_texte': f"Contenu détaillé pour la leçon: {lesson_data['titre']}"
                }
            )
            if l_created:
                print(f"Lesson {les.titre} created.")
                # Add a dummy file
                FichierMultimedia.objects.get_or_create(
                    lecon=les,
                    titre=f"Document - {les.titre}",
                    defaults={
                        'type_fichier': 'PDF',
                        'url_fichier': 'https://example.com/course.pdf',
                        'taille_no': 1.5,
                        'format': 'pdf'
                    }
                )

    # 4. Create Chapters for Terminale Philosophie
    t_philo_chapters = [
        {
            'titre': 'La Conscience et l\'Inconscient',
            'order': 1,
            'lessons': [
                {'titre': 'Le sujet et la conscience', 'duree': 60},
                {'titre': 'Découverte de l\'inconscient (Freud)', 'duree': 60},
            ]
        },
        {
            'titre': 'Le Désir et le Bonheur',
            'order': 2,
            'lessons': [
                {'titre': 'Nature et origine du désir', 'duree': 45},
                {'titre': 'La quête du bonheur', 'duree': 45},
            ]
        }
    ]

    for chap_data in t_philo_chapters:
        chap, created = Chapitre.objects.get_or_create(
            matiere=matieres['Philosophie'],
            niveau=levels['Terminale'],
            order=chap_data['order'],
            defaults={'titre': chap_data['titre']}
        )
        if created:
            print(f"Chapter {chap.titre} created.")
        
        for i, lesson_data in enumerate(chap_data['lessons']):
            les, l_created = Lecon.objects.get_or_create(
                chapitre=chap,
                order=i+1,
                defaults={
                    'titre': lesson_data['titre'],
                    'duree_estimee': lesson_data['duree'],
                    'contenue_texte': f"Réflexion philosophique sur {lesson_data['titre']}"
                }
            )
            if l_created:
                print(f"Lesson {les.titre} created.")

    # 5. Create Enseignant, Examen and Questions for validation
    from core.models import Utilisateur, Enseignant, Examen, QuestionExamen
    from django.utils import timezone
    from datetime import timedelta

    admin_user, _ = Utilisateur.objects.get_or_create(
        username='admin_enseignant',
        defaults={'prenom': 'Prof', 'email': 'prof@eneni.mg', 'type_utilisateur': 'ENSEIGNANT'}
    )
    if _:
        admin_user.set_password('eneni2024')
        admin_user.save()

    prof, _ = Enseignant.objects.get_or_create(
        utilisateur=admin_user,
        defaults={'specialite': 'Mathématiques', 'date_embauche': timezone.now().date()}
    )

    # Examen de validation pour Mathématiques Terminale
    examen, _ = Examen.objects.get_or_create(
        titre="Validation Terminale Mathématiques",
        matiere=matieres['Mathématiques'],
        niveau=levels['Terminale'],
        enseignant=prof,
        defaults={
            'duree_minutes': 60,
            'date_debut': timezone.now(),
            'date_fin': timezone.now() + timedelta(days=365),
            'est_publie': True
        }
    )

    # Add questions for each chapter
    questions_data = [
        {
            'texte': 'Quelle est la forme algébrique de i^2 ?',
            'type': 'QCM',
            'options': ['1', '-1', 'i', '-i'],
            'reponse': '-1',
            'ordre': 1
        },
        {
            'texte': 'Quelle est la dérivée de ln(x) ?',
            'type': 'QCM',
            'options': ['x', '1/x', 'e^x', 'ln(x)'],
            'reponse': '1/x',
            'ordre': 2
        },
        {
            'texte': 'Une suite géométrique de raison q=2 et de premier terme u0=3 a pour terme u2 :',
            'type': 'QCM',
            'options': ['6', '9', '12', '15'],
            'reponse': '12',
            'ordre': 3
        }
    ]

    for q_data in questions_data:
        QuestionExamen.objects.get_or_create(
            examen=examen,
            ordre=q_data['ordre'],
            defaults={
                'texte': q_data['texte'],
                'type_question': q_data['type'],
                'options': q_data['options'],
                'reponse_correcte': q_data['reponse'],
                'points': 5.0
            }
        )

    # 6. Create Partners and Renovations
    from core.models import Partenaire, Renovation
    
    partners_data = [
        {'nom': 'AFD', 'logo': '/image/colab/afd.png', 'url': 'https://www.afd.fr'},
        {'nom': 'Ambassade de France', 'logo': '/image/colab/ambassade-de-france.png', 'url': 'https://mg.ambafrance.org'},
        {'nom': 'AUF', 'logo': '/image/colab/auf.png', 'url': 'https://www.auf.org'},
        {'nom': 'Banque Mondiale', 'logo': '/image/colab/banque-mondiale.png', 'url': 'https://www.banquemondiale.org'},
        {'nom': 'GIZ', 'logo': '/image/colab/giz.png', 'url': 'https://www.giz.de'},
        {'nom': 'Orange', 'logo': '/image/colab_orange.jpeg', 'url': 'https://www.orange.mg'},
    ]
    
    for i, p_data in enumerate(partners_data):
        Partenaire.objects.get_or_create(
            nom=p_data['nom'],
            defaults={'logo': p_data['logo'], 'url': p_data['url'], 'ordre': i}
        )

    renovations_data = [
        {'annee': '2020', 'titre': 'Digitalisation des examens', 'desc': 'Lancement du système d\'examens en ligne pour 50 000 candidats.'},
        {'annee': '2021', 'titre': 'Réhabilitation de 500 salles', 'desc': 'Rénovation des infrastructures scolaires dans 22 régions.'},
        {'annee': '2022', 'titre': 'Kits numériques en zone rurale', 'desc': 'Distribution de tablettes et de connexion aux écoles reculées.'},
        {'annee': '2023', 'titre': 'Programme STEM+', 'desc': 'Renforcement des sciences et mathématiques dans 1 200 collèges.'},
        {'annee': '2024', 'titre': 'Lancement ENENI', 'desc': 'Déploiement de la plateforme nationale d\'e-learning ENENI.'},
        {'annee': '2025', 'titre': 'Couverture nationale', 'desc': 'ENENI couvre 95% des établissements publics et privés agréés.'},
    ]

    for i, r_data in enumerate(renovations_data):
        Renovation.objects.get_or_create(
            annee=r_data['annee'],
            titre=r_data['titre'],
            defaults={'description': r_data['desc'], 'ordre': i}
        )

    print("Population complete with Partners and Renovations!")

if __name__ == '__main__':
    populate()
