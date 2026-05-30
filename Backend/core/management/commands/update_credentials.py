"""
Met à jour credentials.txt avec la liste réelle des utilisateurs DB.
Marque chaque entrée : ✓ seed (présent dans le seed) ou ✗ extra (pas dans le seed).
"""
import os
import re
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Etudiant, Enseignant, AdminEtablissement, Etablissement

Utilisateur = get_user_model()

PASSWORD = "pass1234"


class Command(BaseCommand):
    help = "Met à jour credentials.txt avec tous les utilisateurs réels de la DB"

    def handle(self, *args, **options):
        creds_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'credentials.txt')
        )

        # Lire les usernames du credentials.txt existant
        seed_usernames = set()
        if os.path.exists(creds_path):
            with open(creds_path) as f:
                seed_usernames = set(re.findall(r'user: (\S+)', f.read()))

        db_users = {u.username: u for u in Utilisateur.objects.all().order_by('username')}

        lines = []
        lines.append("=== CREDENTIALS ENENI (MIS À JOUR) ===")
        lines.append(f"Mot de passe unique pour tous : {PASSWORD}")
        lines.append("")
        lines.append(f"Total établissements : {Etablissement.objects.count()}")
        lines.append(f"Total utilisateurs dans la DB : {len(db_users)}")
        lines.append(f"  → Issus du seed : {len(seed_usernames & set(db_users.keys()))}")
        lines.append(f"  → Supplémentaires : {len(set(db_users.keys()) - seed_usernames)}")
        lines.append("")
        lines.append("Légende : ✓ = présent dans seed | ✗ = pas dans le seed")
        lines.append("=" * 80)
        lines.append("")

        # ── Enseignants ──
        lines.append(f"{'='*80}")
        lines.append(f"ENSEIGNANTS")
        lines.append(f"{'='*80}")
        enseignants = Enseignant.objects.select_related('utilisateur', 'etablissement').order_by('utilisateur__username')
        for ens in enseignants:
            u = ens.utilisateur
            status = "✓" if u.username in seed_usernames else "✗"
            etab = ens.etablissement.nom if ens.etablissement else "?"
            lines.append(
                f"[{status}] [ENSEIGNANT] {etab} | {u.prenom} | "
                f"user: {u.username} | mdp: {PASSWORD} | matière: {ens.specialite}"
            )

        lines.append("")

        # ── Étudiants ──
        lines.append(f"{'='*80}")
        lines.append(f"ÉTUDIANTS")
        lines.append(f"{'='*80}")
        etudiants = Etudiant.objects.select_related(
            'utilisateur', 'etablissement', 'classe', 'niveau'
        ).order_by('utilisateur__username')
        for etu in etudiants:
            u = etu.utilisateur
            status = "✓" if u.username in seed_usernames else "✗"
            etab = etu.etablissement.nom if etu.etablissement else "?"
            classe = etu.classe.nom if etu.classe else "?"
            num = etu.numero_etudiant or "?"
            lines.append(
                f"[{status}] [ETUDIANT] {etab} | {classe} | {u.prenom} | "
                f"user: {u.username} | mdp: {PASSWORD} | num: {num}"
            )

        lines.append("")

        # ── Administrateurs ──
        lines.append(f"{'='*80}")
        lines.append(f"ADMINISTRATEURS")
        lines.append(f"{'='*80}")
        admins = Utilisateur.objects.filter(
            type_utilisateur__in=['ADMINISTRATEUR', 'ADMIN_PLATEFORME']
        ).order_by('username')
        for u in admins:
            status = "✓" if u.username in seed_usernames else "✗"
            # Chercher si admin d'établissement
            admin_etab = AdminEtablissement.objects.filter(utilisateur=u).select_related('etablissement').first()
            etab = admin_etab.etablissement.nom if admin_etab else "Plateforme"
            lines.append(
                f"[{status}] [ADMIN] {etab} | {u.prenom} | "
                f"user: {u.username} | mdp: {PASSWORD}"
            )

        # Écrire le fichier
        with open(creds_path, 'w') as f:
            f.write("\n".join(lines))

        self.stdout.write(self.style.SUCCESS(f"✓ credentials.txt mis à jour : {creds_path}"))
        self.stdout.write(self.style.SUCCESS(f"  {len(db_users)} utilisateurs (✓ seed + ✗ extra)"))
