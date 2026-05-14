import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ENENI.settings')
django.setup()

from core.models import Utilisateur

def reset_passwords():
    demo_users = {
        'fitia_student': 'Password123!',
        'prof_maths': 'Password123!',
        'admin_lycee': 'AdminPass123!',
        'super_admin': 'MenSuperSecurity2035!',
    }
    
    for username, password in demo_users.items():
        try:
            user = Utilisateur.objects.get(username=username)
            user.set_password(password)
            user.save()
            print(f"Password reset for {username}")
        except Utilisateur.DoesNotExist:
            print(f"User {username} not found")

if __name__ == "__main__":
    reset_passwords()
