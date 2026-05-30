"""
Compare les credentials.txt avec la base de données réelle.
Génère un rapport : qui est présent, qui est manquant.
"""
import os
import re
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Etudiant, Enseignant

Utilisateur = get_user_model()

PASSWORD = "pass1234"


class Command(BaseCommand):
    help = "Compare credentials.txt avec la DB et liste les utilisateurs réels"

    def handle(self, *args, **options):
        out_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'credentials.txt')
        )

        if not os.path.exists(out_path):
            self.stderr.write("credentials.txt introuvable")
            return

        with open(out_path) as f:
            creds_text = f.read()

        creds_usernames = set(re.findall(r'user: (\S+)', creds_text))

        db_users = {u.username: u for u in Utilisateur.objects.all()}
        db_usernames = set(db_users.keys())

        in_both = creds_usernames & db_usernames
        missing_from_db = creds_usernames - db_usernames
        extra_in_db = db_usernames - creds_usernames

        lines = []
        lines.append("=" * 70)
        lines.append("RAPPORT CREDENTIALS vs BASE DE DONNÉES")
        lines.append(f"Mot de passe unique : {PASSWORD}")
        lines.append("=" * 70)
        lines.append("")

        # Stats
        lines.append(f"Utilisateurs dans credentials.txt : {len(creds_usernames)}")
        lines.append(f"Utilisateurs dans la base de données : {len(db_usernames)}")
        lines.append(f"Présents dans les deux : {len(in_both)}")
        lines.append(f"Manquants dans la DB : {len(missing_from_db)}")
        lines.append(f"Supplémentaires dans la DB : {len(extra_in_db)}")
        lines.append("")

        # Manquants
        if missing_from_db:
            lines.append("-" * 70)
            lines.append(f"❌ MANQUANTS DANS LA DB ({len(missing_from_db)})")
            lines.append("-" * 70)
            for line in creds_text.split('\n'):
                for u in missing_from_db:
                    if f'user: {u}' in line:
                        lines.append(f"  {line.strip()}")
                        break
            lines.append("")

        # Supplémentaires
        if extra_in_db:
            lines.append("-" * 70)
            lines.append(f"⚠️  SUPPLÉMENTAIRES DANS LA DB (non dans credentials) ({len(extra_in_db)})")
            lines.append("-" * 70)
            for u in sorted(extra_in_db):
                user = db_users[u]
                role = user.type_utilisateur
                extra = ""
                if role == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
                    p = user.etudiant_profile
                    etab = p.etablissement.nom if p.etablissement else "?"
                    extra = f" | {etab} | {p.classe.nom if p.classe else '?'}"
                elif role == 'ENSEIGNANT' and hasattr(user, 'enseignant_profile'):
                    p = user.enseignant_profile
                    etab = p.etablissement.nom if p.etablissement else "?"
                    extra = f" | {etab} | spé: {p.specialite}"
                elif role == 'ADMINISTRATEUR':
                    extra = " | Admin plateforme/admin établissement"
                lines.append(f"  [{role}] user: {u}{extra}")
            lines.append("")

        # TOUS les utilisateurs DB avec statut
        lines.append("=" * 70)
        lines.append("LISTE COMPLÈTE DES UTILISATEURS DANS LA DB")
        lines.append("=" * 70)
        lines.append("")

        # Enseignants d'abord
        lines.append("── ENSEIGNANTS ──")
        for u in sorted(db_users.values(), key=lambda x: x.username):
            if u.type_utilisateur != 'ENSEIGNANT':
                continue
            in_creds = "✓" if u.username in creds_usernames else "✗"
            p = getattr(u, 'enseignant_profile', None)
            etab = p.etablissement.nom if p and p.etablissement else "?"
            specialite = p.specialite if p else "?"
            lines.append(
                f"  [{in_creds}] {u.username} | {u.prenom} | "
                f"{etab} | {specialite} | mdp: {PASSWORD}"
            )

        lines.append("")
        lines.append("── ÉTUDIANTS ──")
        for u in sorted(db_users.values(), key=lambda x: x.username):
            if u.type_utilisateur != 'ETUDIANT':
                continue
            in_creds = "✓" if u.username in creds_usernames else "✗"
            p = getattr(u, 'etudiant_profile', None)
            etab = p.etablissement.nom if p and p.etablissement else "?"
            classe = p.classe.nom if p and p.classe else "?"
            num = p.numero_etudiant if p else "?"
            lines.append(
                f"  [{in_creds}] {u.username} | {u.prenom} | "
                f"{etab} | {classe} | num: {num} | mdp: {PASSWORD}"
            )

        # Admins
        lines.append("")
        lines.append("── ADMINISTRATEURS ──")
        for u in sorted(db_users.values(), key=lambda x: x.username):
            if u.type_utilisateur not in ('ADMINISTRATEUR', 'ADMIN_PLATEFORME'):
                continue
            in_creds = "✓" if u.username in creds_usernames else "✗"
            lines.append(f"  [{in_creds}] {u.username} | {u.prenom} | mdp: {PASSWORD}")

        output = "\n".join(lines)

        # Écrire le rapport
        report_path = out_path.replace('credentials.txt', 'rapport_credentials.txt')
        with open(report_path, 'w') as f:
            f.write(output)

        self.stdout.write(self.style.SUCCESS(f"Rapport généré : {report_path}"))
        self.stdout.write(f"Dans credentials : {len(creds_usernames)}")
        self.stdout.write(f"Dans DB : {len(db_usernames)}")
        self.stdout.write(f"Manquants DB : {len(missing_from_db)}")
        self.stdout.write(f"Supplémentaires DB : {len(extra_in_db)}")
