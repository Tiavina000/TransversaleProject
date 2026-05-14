import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ENENI.settings')
django.setup()

from core.models import Utilisateur

def list_users():
    users = Utilisateur.objects.all()
    print(f"Found {users.count()} users:")
    for user in users:
        print(f"- {user.username} ({user.type_utilisateur})")

if __name__ == "__main__":
    list_users()
