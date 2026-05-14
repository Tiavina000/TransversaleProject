"""
Script pour injecter des actualités de démonstration enrichies.
Inclut des actualités avec catégories, importance, et liens.
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ENENI.settings')
django.setup()

from core.models import Actualite, Utilisateur, Etablissement

def seed_news():
    # On récupère le super_admin pour lui attribuer des actus
    try:
        admin = Utilisateur.objects.get(username='super_admin')
    except Utilisateur.DoesNotExist:
        admin = None

    try:
        etab = Etablissement.objects.first()
    except:
        etab = None

    news_data = [
        {
            'titre': 'Session de Baccalauréat 2026 — Convocations disponibles',
            'contenu': 'La session du Baccalauréat 2026 commence le 20 mai. Les convocations sont disponibles en ligne. Vérifiez votre centre d\'examen et votre numéro de place.',
            'categorie': 'Examens',
            'est_important': True,
            'est_publie': True,
            'lien_externe': 'https://www.education.gov.mg',
            'lien_label': 'Consulter les convocations',
            'public_ciblie': 'ETUDIANTS',
        },
        {
            'titre': 'Nouveaux cours de Physique-Chimie — Terminale S',
            'contenu': '3 nouvelles leçons sur la thermodynamique et l\'optique géométrique sont maintenant disponibles dans votre espace de cours. Accédez-y dès maintenant.',
            'categorie': 'Cours',
            'est_important': False,
            'est_publie': True,
            'public_ciblie': 'ETUDIANTS',
        },
        {
            'titre': 'Tournoi inter-établissements de Football 2026',
            'contenu': 'Le grand tournoi annuel de football entre établissements aura lieu le 25 mai au stade municipal. Venez encourager votre équipe !',
            'categorie': 'Sport',
            'est_important': False,
            'est_publie': True,
            'lien_externe': 'https://www.education.gov.mg',
            'lien_label': 'Programme du tournoi',
            'public_ciblie': 'TOUS',
        },
        {
            'titre': 'Maintenance planifiée de la plateforme ENENI',
            'contenu': 'La plateforme ENENI sera en maintenance technique le samedi 12 mai de 22h00 à 00h30. Veuillez sauvegarder vos travaux en cours avant cette période.',
            'categorie': 'Annonces',
            'est_important': True,
            'est_publie': True,
            'public_ciblie': 'TOUS',
        },
        {
            'titre': 'Fête de la musique scolaire — 21 juin 2026',
            'contenu': 'Les élèves du club de musique présentent leur concert annuel. Exposition culturelle et animations artistiques. Entrée libre pour tous.',
            'categorie': 'Culture',
            'est_important': False,
            'est_publie': True,
            'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'public_ciblie': 'TOUS',
        },
        {
            'titre': 'Journée Portes Ouvertes — Samedi 15 mai',
            'contenu': "L'établissement ouvre ses portes aux futurs élèves et leurs familles. Visite des installations, rencontre avec les enseignants, présentation des programmes.",
            'categorie': 'Événements',
            'est_important': False,
            'est_publie': True,
            'public_ciblie': 'TOUS',
        },
        {
            'titre': 'Cours de Mathématiques annulé — Mardi 14h',
            'contenu': 'Le cours de mathématiques du mardi 14h de M. Rakoto est annulé. Une séance de rattrapage est planifiée le vendredi 17 mai à 14h en salle 204.',
            'categorie': 'Cours',
            'est_important': True,
            'est_publie': True,
            'public_ciblie': 'ETUDIANTS',
        },
    ]

    created = 0
    for data in news_data:
        obj, was_created = Actualite.objects.get_or_create(
            titre=data['titre'],
            defaults={**data, 'auteur': admin, 'etablissement_cible': etab}
        )
        if was_created:
            created += 1
            print(f"  ✓ Créée: {obj.titre[:50]}")
        else:
            print(f"  · Déjà existante: {obj.titre[:50]}")

    print(f"\n{created} nouvelles actualités créées. Total: {Actualite.objects.count()}")

if __name__ == '__main__':
    seed_news()
