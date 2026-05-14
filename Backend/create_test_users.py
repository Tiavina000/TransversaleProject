import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ENENI.settings')
django.setup()

from core.models import Utilisateur, Etudiant, NiveauScolaire

def create_test_users():
    # 1. Ensure levels exist
    niveau, _ = NiveauScolaire.objects.get_or_create(nom='Terminale', defaults={'ordre': 12})
    
    # 2. Create Student with known credentials
    # Username: student_test, PW: password123, Numero: 2026001
    user_stu, created = Utilisateur.objects.get_or_create(
        username='student_test',
        defaults={
            'prenom': 'Student',
            'email': 'student@test.mg',
            'type_utilisateur': 'ETUDIANT'
        }
    )
    user_stu.set_password('password123')
    user_stu.save()
    
    Etudiant.objects.get_or_create(
        utilisateur=user_stu,
        defaults={
            'numero_etudiant': '2026001',
            'niveau': niveau
        }
    )
    
    # 3. Create Admin
    user_adm, created = Utilisateur.objects.get_or_create(
        username='admin_test',
        defaults={
            'prenom': 'Admin',
            'email': 'admin@test.mg',
            'type_utilisateur': 'ADMINISTRATEUR'
        }
    )
    user_adm.set_password('admin123')
    user_adm.save()

    print("Test users created:")
    print("- Student: student_test (or 2026001) / password123")
    print("- Admin: admin_test / admin123")

if __name__ == '__main__':
    create_test_users()
