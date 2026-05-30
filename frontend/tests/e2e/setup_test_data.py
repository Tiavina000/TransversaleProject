import sys
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
User = get_user_model()
from core.models import Enseignant, Etudiant, Etablissement, NiveauScolaire, Matiere, Classe

TEACHER_USERNAME = 'testteacher_e2e'
TEACHER_PASSWORD = 'TestTeacher2024!'
STUDENT_NUMERO = 'E2E2024001'
STUDENT_PASSWORD = 'Student2024!'
ADMIN_USERNAME = 'testadmin_e2e'
ADMIN_PASSWORD = 'Admin2024!'

# Clean up all test data from previous runs
User.objects.filter(username__in=[TEACHER_USERNAME, STUDENT_NUMERO, ADMIN_USERNAME]).delete()
Etudiant.objects.filter(numero_etudiant=STUDENT_NUMERO).delete()
Enseignant.objects.filter(utilisateur__username=TEACHER_USERNAME).delete()

etablissement, created = Etablissement.objects.get_or_create(
    nom='Établissement Test E2E',
    defaults={'type': 'LYCEE'}
)

niveau, created = NiveauScolaire.objects.get_or_create(
    nom='2nde',
    defaults={'ordre': 10, 'description': 'Classe de Seconde - Test'}
)

# Remove old Classe entries to avoid MultipleObjectsReturned
Classe.objects.filter(nom='2nde A', etablissement=etablissement).delete()
classe = Classe.objects.create(
    nom='2nde A', niveau=niveau, etablissement=etablissement
)

# Teacher
teacher_user = User.objects.create(
    username=TEACHER_USERNAME,
    email='testteacher@eneni.mg',
    prenom='Test',
    type_utilisateur='ENSEIGNANT',
    password=make_password(TEACHER_PASSWORD),
    est_actif=True,
)
enseignant, _ = Enseignant.objects.get_or_create(
    utilisateur=teacher_user,
    defaults={
        'etablissement': etablissement,
        'niveau': niveau,
        'specialite': 'Mathématiques',
        'date_embauche': '2024-01-01',
    }
)

matiere, _ = Matiere.objects.get_or_create(
    nom='Mathématiques',
    defaults={'description': 'Mathématiques - Test', 'coefficient': 4}
)

# Student
student_user = User.objects.create(
    username=STUDENT_NUMERO,
    email='student@test.mg',
    prenom='Student',
    type_utilisateur='ETUDIANT',
    password=make_password(STUDENT_PASSWORD),
    est_actif=True,
)
etudiant, _ = Etudiant.objects.get_or_create(
    utilisateur=student_user,
    defaults={
        'etablissement': etablissement,
        'niveau': niveau,
        'classe': classe,
        'numero_etudiant': STUDENT_NUMERO,
        'points_global': 50,
    }
)

# Admin
admin_user = User.objects.create(
    username=ADMIN_USERNAME,
    email='admin@eneni.mg',
    prenom='Admin',
    type_utilisateur='ADMINISTRATEUR',
    password=make_password(ADMIN_PASSWORD),
    est_actif=True,
)

print(f'OK: Utilisateur enseignant créé : {TEACHER_USERNAME}')
print(f'OK: Utilisateur étudiant créé : {STUDENT_NUMERO}')
print(f'OK: Utilisateur admin créé : {ADMIN_USERNAME}')
print(f'OK: Etablissement : {etablissement.nom} (id={etablissement.id})')
print(f'OK: Niveau : {niveau.nom} (id={niveau.id})')
print(f'OK: Matière : {matiere.nom} (id={matiere.id})')
print(f'OK: Enseignant id={enseignant.id}')
print(f'OK: Etudiant id={etudiant.id}')
sys.exit(0)
