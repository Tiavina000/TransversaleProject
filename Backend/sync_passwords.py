import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ENENI.settings')
django.setup()

from core.models import Utilisateur, Etudiant, Etablissement, Enseignant

def sync_all():
    # 0. Ensure Establishments exist
    e1, _ = Etablissement.objects.get_or_create(id=1, defaults={'nom': 'Lycée Privé Analakely', 'code_etablissement': 'LPA01', 'email': 'lpa@test.mg'})
    e2, _ = Etablissement.objects.get_or_create(id=2, defaults={'nom': 'Lycée Public Nanisana', 'code_etablissement': 'LPN02', 'email': 'lpn@test.mg'})
    e3, _ = Etablissement.objects.get_or_create(id=3, defaults={'nom': "Université d'Antananarivo", 'code_etablissement': 'UA03', 'email': 'ua@test.mg'})

    # 1. Aina Rakoto (Student) -> Lycée Privé Analakely
    try:
        u1 = Utilisateur.objects.get(etudiant_profile__numero_etudiant='2026001')
        u1.set_password('Student123!')
        u1.save()
    except: print("Aina Rakoto not found")

    # 2. Mamy Razafy (Student)
    try:
        u2 = Utilisateur.objects.get(etudiant_profile__numero_etudiant='2026002')
        u2.set_password('Student123!')
        u2.save()
        print("Updated password for Mamy Razafy (2026002)")
    except: print("Mamy Razafy not found")

    # 3. Rija Andriam (Student)
    try:
        u3 = Utilisateur.objects.get(etudiant_profile__numero_etudiant='2026003')
        u3.set_password('Student123!')
        u3.save()
        print("Updated password for Rija Andriam (2026003)")
    except: print("Rija Andriam not found")

    # 4. Prof. Rakoto (Teacher)
    try:
        u4 = Utilisateur.objects.get(username='rakoto.maths')
        u4.set_password('Password123!')
        u4.save()
        print("Updated password for Prof. Rakoto (rakoto.maths)")
    except: print("Prof. Rakoto not found")

    # 5. Admin Central
    try:
        u5, created = Utilisateur.objects.get_or_create(
            username='admin.eneni',
            defaults={'type_utilisateur': 'ADMINISTRATEUR', 'prenom': 'Admin'}
        )
        u5.set_password('AdminPass2026!')
        u5.save()
        print("Updated password for Admin Central (admin.eneni)")
    except: print("Admin Central error")

if __name__ == '__main__':
    sync_all()
