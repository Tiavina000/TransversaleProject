import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ENENI.settings')
django.setup()

from django.contrib.auth import authenticate
from core.models import Utilisateur

def test_login():
    username = 'fitia_student'
    password = 'Password123!'
    
    print(f"Testing login for {username}...")
    user = authenticate(username=username, password=password)
    
    if user:
        print(f"Success! Authenticated as {user.username} ({user.type_utilisateur})")
    else:
        print("Failed to authenticate.")
        # Check if user exists
        try:
            u = Utilisateur.objects.get(username=username)
            print(f"User {username} exists, but authentication failed. Check password.")
        except Utilisateur.DoesNotExist:
            print(f"User {username} does not exist in the database.")

if __name__ == "__main__":
    test_login()
