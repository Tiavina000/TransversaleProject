"""
Seed complet : classes, utilisateurs, cours, examens.
Génère un fichier credentials.txt avec tous les logins.

Usage:
  python manage.py seed_all
  python manage.py seed_all --max-schools 3
"""

import os
import random
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.db import transaction
from core.models import (
    Etablissement, NiveauScolaire, Classe,
    Utilisateur, Etudiant, Enseignant, AdminEtablissement,
    Matiere, Chapitre, Lecon, Examen, QuestionExamen,
)

NIVEAUX_PAR_TYPE = {
    'LYCEE': ['2nde', '1ère', 'Terminale'],
    'CEG':   ['6ème', '5ème', '4ème', '3ème'],
    'EPP':   ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    'AUTRE': ['2nde', '1ère', 'Terminale'],
}

SUFFIXES_CLASSE = ['A', 'B', 'C']

PRENOMS = [
    "Miora","Sarobidy","Soa","Feno","Tiana","Noro","Lalaina","Voahangy",
    "Mirana","Tantely","Nantenaina","Rondro","Mamy","Tahiry","Fara","Holy",
    "Toky","Maminirina","Rado","Fidy","Hery","Tafika","Nandrianina","Manda",
    "Fandresena","Rindra","Nirina","Tao","Rija","Haja","Manoa","Tiavina",
    "Miangaly","Tahina","Nambinina","Herimalala","Randria","Faniry","Mendrika",
]

NOMS = [
    "Rakoto","Rabe","Razafy","Randria","Rajaonarison","Andriatiana",
    "Rakotondrabe","Rakotonirina","Rakotomalala","Rakotoson","Ranaivo",
    "Ratsimbazafy","Randrianarison","Rakotondrainibe","Rakotozafy",
    "Rakotondramasy","Randrianasolo","Rafanomezantsoa","Rakotoarisoa",
    "Razafimahatratra","Rakotondrazaka","Rajaobelina","Rakotomanga",
]

SPECIALITES = [
    "Mathématiques","Français","Malagasy","Physique-Chimie","SVT",
    "Histoire-Géographie","Anglais","Philosophie","Informatique",
]

ADMIN_FONCTIONS = ["Proviseur / Directeur","Proviseur adjoint","Directeur des études"]

CHAPITRES_PAR_MATIERE = {
    "Mathématiques": ["Nombres et calculs", "Géométrie", "Statistiques"],
    "Français":      ["Grammaire", "Littérature", "Rédaction"],
    "Malagasy":      ["Fitsipi-pitenenana", "Hairaitra", "Soratra"],
    "Physique-Chimie": ["Mécanique", "Électricité", "Chimie organique"],
    "SVT":           ["Biologie cellulaire", "Géologie", "Écologie"],
    "Histoire-Géographie": ["Histoire ancienne", "Géographie mondiale", "Histoire moderne"],
    "Anglais":       ["Grammar", "Vocabulary", "Comprehension"],
    "Philosophie":   ["La raison", "La liberté", "La justice"],
    "Informatique":  ["Algorithmique", "Programmation", "Réseaux"],
}

PASSWORD = "pass1234"


class Command(BaseCommand):
    help = "Crée classes + utilisateurs + cours pour tous les établissements"

    def add_arguments(self, parser):
        parser.add_argument('--max-schools', type=int, default=0)

    def handle(self, *args, **options):
        max_per_type = options.get('max_schools', 0) or None
        lines = []
        total = {'classes': 0, 'users': 0, 'ecoles': 0,
                 'chapitres': 0, 'lecons': 0, 'examens': 0}
        etudiant_counter = 1
        hashed_pw = make_password(PASSWORD)

        etabs_par_type = {}
        for e in Etablissement.objects.all().order_by('type', 'nom'):
            etabs_par_type.setdefault(e.type, []).append(e)

        out_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'credentials.txt')
        )

        matieres = {m.code: m for m in Matiere.objects.all()}
        matiere_list = list(matieres.values())
        # map specialite name -> matiere object
        matiere_par_nom = {}
        for m in matiere_list:
            for s in SPECIALITES:
                if m.nom == s:
                    matiere_par_nom[s] = m

        now = timezone.now()

        for etype in ['LYCEE', 'CEG', 'EPP', 'AUTRE']:
            niveaux_noms = NIVEAUX_PAR_TYPE.get(etype, [])
            etabs = etabs_par_type.get(etype, [])[:max_per_type]
            niveaux = {n.nom: n for n in NiveauScolaire.objects.filter(nom__in=niveaux_noms)}

            for etab in etabs:
                total['ecoles'] += 1
                self.stdout.write(f"  {etab.nom}...", ending=' ')
                self.stdout.flush()

                # ── 1. Créer les classes ──────────────────────────────
                classes_objs = []
                niveaux_dispo = []
                for niveau_nom in niveaux_noms:
                    niv = niveaux.get(niveau_nom)
                    if not niv:
                        continue
                    niveaux_dispo.append(niv)
                    for suffixe in SUFFIXES_CLASSE:
                        nom_classe = f"{niveau_nom} {suffixe}"
                        classe, created = Classe.objects.get_or_create(
                            nom=nom_classe, niveau=niv, etablissement=etab,
                        )
                        classes_objs.append(classe)
                        if created:
                            total['classes'] += 1

                if not classes_objs:
                    self.stdout.write("pas de niveaux")
                    continue

                # ── 2. Créer un enseignant PAR matière ────────────────
                enseignants_crees = []
                for specialite in SPECIALITES:
                    mat = matiere_par_nom.get(specialite)
                    if not mat:
                        continue
                    prenom = random.choice(PRENOMS)
                    nom = random.choice(NOMS)
                    base = f"prof.{nom.lower()}.{prenom.lower()}.{etab.id}.{specialite.lower()[:4]}"
                    username = base[:150]
                    user, user_created = Utilisateur.objects.get_or_create(
                        username=username,
                        defaults=dict(
                            prenom=prenom, email=f"{base}@eneni.mg",
                            password=hashed_pw,
                            type_utilisateur='ENSEIGNANT',
                            langue_preferee='FR', is_active=True,
                        ),
                    )
                    if user_created:
                        # Assigner un niveau unique à l'enseignant (rotation circulaire)
                        if niveaux_dispo:
                            niveau_enseignant = niveaux_dispo[len(enseignants_crees) % len(niveaux_dispo)]
                        else:
                            niveau_enseignant = None
                        enseignant = Enseignant.objects.create(
                            utilisateur=user, etablissement=etab,
                            specialite=specialite,
                            date_embauche='2024-09-01',
                            niveau=niveau_enseignant,
                        )
                        enseignants_crees.append(enseignant)
                        total['users'] += 1
                        niveau_label = f"niveau: {niveau_enseignant.nom}" if niveau_enseignant else "niveau: aucun"
                        lines.append(
                            f"[ENSEIGNANT] {etab.nom} | {prenom} {nom} | "
                            f"user: {username} | mdp: {PASSWORD} | "
                            f"matière: {specialite} | {niveau_label}"
                        )

                        # Créer un Examen de référence pour que UserMeView
                        # détecte les matieres_enseignees et niveaux_enseignes
                        for niveau_nom in niveaux_noms:
                            niv = niveaux.get(niveau_nom)
                            if not niv:
                                continue
                            # Un examen par (enseignant, matière, niveau)
                            Examen.objects.get_or_create(
                                titre=f"Évaluation - {specialite} - {niveau_nom} - {etab.nom}",
                                enseignant=enseignant,
                                matiere=mat,
                                niveau=niv,
                                defaults=dict(
                                    duree_minutes=60,
                                    date_debut=now,
                                    date_fin=now + timezone.timedelta(hours=2),
                                    est_publie=True,
                                    type_examen='QCM',
                                    coefficient=1.0,
                                ),
                            )
                            total['examens'] += 1

                # ── 3. Admin ──────────────────────────────────────────
                username_a = f"admin.{etab.id}"
                user_a, created_a = Utilisateur.objects.get_or_create(
                    username=username_a,
                    defaults=dict(
                        prenom=random.choice(PRENOMS), email=f"{username_a}@eneni.mg",
                        password=hashed_pw,
                        type_utilisateur='ADMINISTRATEUR',
                        langue_preferee='FR', is_active=True,
                    ),
                )
                if created_a:
                    AdminEtablissement.objects.create(
                        utilisateur=user_a, etablissement=etab,
                        fonction=random.choice(ADMIN_FONCTIONS),
                    )
                    total['users'] += 1
                    lines.append(
                        f"[ADMIN] {etab.nom} | {user_a.prenom} {random.choice(NOMS)} | "
                        f"user: {username_a} | mdp: {PASSWORD}"
                    )

                # ── 4. Étudiants ──────────────────────────────────────
                users_bulk = []
                etudiants_bulk = []
                student_records = []

                for classe in classes_objs:
                    for _ in range(10):
                        prenom = random.choice(PRENOMS)
                        nom = random.choice(NOMS)
                        base_s = f"etu.{etab.id}.{classe.id}.{etudiant_counter}"
                        username_s = base_s[:150]
                        numero = f"EN{etudiant_counter:06d}"

                        users_bulk.append(Utilisateur(
                            username=username_s,
                            prenom=prenom,
                            email=f"{base_s}@etudiant.eneni.mg",
                            password=hashed_pw,
                            type_utilisateur='ETUDIANT',
                            langue_preferee='FR',
                            is_active=True,
                            date_joined=now,
                        ))
                        student_records.append((classe, prenom, nom, username_s, numero))
                        etudiant_counter += 1

                Utilisateur.objects.bulk_create(users_bulk, ignore_conflicts=True)

                usernames = [r[3] for r in student_records]
                user_map = {}
                for u in Utilisateur.objects.filter(username__in=usernames, type_utilisateur='ETUDIANT'):
                    user_map[u.username] = u

                for classe, prenom, nom, uname, numero in student_records:
                    user = user_map.get(uname)
                    if not user:
                        continue
                    etudiants_bulk.append(Etudiant(
                        utilisateur=user,
                        etablissement=etab,
                        classe=classe,
                        niveau=classe.niveau,
                        numero_etudiant=numero,
                    ))

                Etudiant.objects.bulk_create(etudiants_bulk, ignore_conflicts=True)
                total['users'] += len(etudiants_bulk)

                for classe, prenom, nom, uname, numero in student_records:
                    if uname in user_map:
                        lines.append(
                            f"[ETUDIANT] {etab.nom} | {classe.nom} | "
                            f"{prenom} {nom} | "
                            f"user: {uname} | mdp: {PASSWORD} | "
                            f"num: {numero}"
                        )

                # ── 5. Créer des chapitres et leçons ──────────────────
                # Construire un mapping (specialite, niveau_id) → enseignant
                # Inclut les nouveaux + les existants pour fonctionner en ré-exécution
                teacher_map = {}
                all_teachers = Enseignant.objects.filter(
                    etablissement=etab,
                    specialite__in=SPECIALITES,
                    niveau__isnull=False,
                ).select_related('niveau')
                for ens in all_teachers:
                    teacher_map[(ens.specialite, ens.niveau.id)] = ens

                for specialite in SPECIALITES:
                    mat = matiere_par_nom.get(specialite)
                    if not mat:
                        continue
                    chapitres_titres = CHAPITRES_PAR_MATIERE.get(specialite, [])
                    for niveau_nom in niveaux_noms:
                        niv = niveaux.get(niveau_nom)
                        if not niv:
                            continue
                        teacher = teacher_map.get((specialite, niv.id))
                        for order, titre_chap in enumerate(chapitres_titres, 1):
                            defaults_chap = dict(titre=titre_chap, description=f"Chapitre {titre_chap} - {niveau_nom}")
                            if teacher is not None:
                                defaults_chap['createur'] = teacher
                            chapitre, chap_created = Chapitre.objects.get_or_create(
                                matiere=mat, niveau=niv, order=order,
                                defaults=defaults_chap,
                            )
                            if not chap_created and chapitre.createur is None and teacher is not None:
                                from django.db import connection
                                with connection.cursor() as cursor:
                                    cursor.execute(
                                        "UPDATE core_chapitre SET createur_id = %s WHERE id = %s",
                                        [teacher.id, chapitre.id]
                                    )
                            if chap_created:
                                total['chapitres'] += 1
                            # Créer 2 leçons par chapitre
                            for lec_order in range(1, 3):
                                lecon_titre = f"Leçon {lec_order} : {titre_chap}"
                                defaults_lecon = dict(
                                    titre=lecon_titre,
                                    contenue_texte=f"Contenu de {lecon_titre} pour {niveau_nom}.",
                                    duree_estimee=30,
                                    objectifs=f"Objectifs de {lecon_titre}",
                                    est_publie=True,
                                )
                                if teacher is not None:
                                    defaults_lecon['createur'] = teacher
                                lecon, lec_created = Lecon.objects.get_or_create(
                                    chapitre=chapitre, order=lec_order,
                                    defaults=defaults_lecon,
                                )
                                if not lec_created and (not lecon.est_publie or lecon.createur is None):
                                    from django.db import connection
                                    createur_id = teacher.id if teacher is not None else None
                                    with connection.cursor() as cursor:
                                        cursor.execute(
                                            "UPDATE core_lecon SET est_publie = %s, createur_id = %s WHERE id = %s",
                                            [True, createur_id, lecon.id]
                                        )
                                if lec_created:
                                    total['lecons'] += 1

                self.stdout.write(self.style.SUCCESS("OK"))

        with open(out_path, 'w') as f:
            f.write("=== CREDENTIALS ENENI ===\n")
            f.write(f"Mot de passe unique pour tous : {PASSWORD}\n\n")
            f.write(f"Total établissements traités : {total['ecoles']}\n")
            f.write(f"Total classes créées : {total['classes']}\n")
            f.write(f"Total utilisateurs créés : {total['users']}\n")
            f.write(f"Total chapitres créés : {total['chapitres']}\n")
            f.write(f"Total leçons créées : {total['lecons']}\n")
            f.write(f"Total examens créés : {total['examens']}\n")
            f.write("=" * 60 + "\n\n")
            f.write("\n".join(lines))

        self.stdout.write(self.style.SUCCESS(f"\n✓ {total['classes']} classes créées"))
        self.stdout.write(self.style.SUCCESS(f"✓ {total['users']} utilisateurs créés"))
        self.stdout.write(self.style.SUCCESS(f"✓ {total['chapitres']} chapitres créés"))
        self.stdout.write(self.style.SUCCESS(f"✓ {total['lecons']} leçons créées"))
        self.stdout.write(self.style.SUCCESS(f"✓ {total['examens']} examens créés"))
        self.stdout.write(self.style.SUCCESS(f"✓ Fichier généré : {out_path}"))
