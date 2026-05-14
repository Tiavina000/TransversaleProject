import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ENENI.settings')
django.setup()

from core.models import Utilisateur, Etudiant, Etablissement, Enseignant

def final_sync():
    # 1. Clean establishments
    Etablissement.objects.all().delete()
    
    e1 = Etablissement.objects.create(id=1, nom='Lycée Privé Analakely', code_etablissement='LPA01', email='lpa@test.mg')
    e2 = Etablissement.objects.create(id=2, nom='Lycée Public Nanisana', code_etablissement='LPN02', email='lpn@test.mg')
    e3 = Etablissement.objects.create(id=3, nom="Université d'Antananarivo", code_etablissement='UA03', email='ua@test.mg')
    
    print(f"Created: {e1.id}:{e1.nom}, {e2.id}:{e2.nom}, {e3.id}:{e3.nom}")

    # 2. Sync Aina Rakoto (2026001) -> e1
    try:
        u1 = Utilisateur.objects.get(etudiant_profile__numero_etudiant='2026001')
        u1.set_password('Student123!')
        u1.save()
        profile = u1.etudiant_profile
        profile.etablissement = e1
        profile.save()
        print("Aina Rakoto linked to ID 1")
    except Exception as e: print(f"Aina error: {e}")

    # 3. Sync Mamy Razafy (2026002) -> e2
    try:
        u2 = Utilisateur.objects.get(etudiant_profile__numero_etudiant='2026002')
        u2.set_password('Student123!')
        u2.save()
        profile = u2.etudiant_profile
        profile.etablissement = e2
        profile.save()
        print("Mamy Razafy linked to ID 2")
    except Exception as e: print(f"Mamy error: {e}")

if __name__ == '__main__':
    final_sync()
