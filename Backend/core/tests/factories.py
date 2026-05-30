import datetime
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from core.models import (
    Utilisateur, Enseignant, Etudiant, Etablissement,
    NiveauScolaire, Matiere, Chapitre, Lecon, Examen,
    QuestionExamen, CopieExamen, ReponseExamen, Classe
)


def create_user(username="testuser", password="testpass123",
                prenom="Test", email="test@example.com",
                type_utilisateur="ENSEIGNANT", **kwargs):
    return Utilisateur.objects.create(
        username=username,
        password=make_password(password),
        prenom=prenom,
        email=email,
        type_utilisateur=type_utilisateur,
        **kwargs
    )


_etab_counter = 0

def create_etablissement(nom=None, code=None):
    global _etab_counter
    _etab_counter += 1
    if nom is None:
        nom = f"Ecole {_etab_counter}"
    if code is None:
        code = f"TST{_etab_counter:03d}"
    return Etablissement.objects.create(
        nom=nom,
        adresse="123 Test Ave",
        telephone="+261123456789",
        email="contact@test.school",
        code_etablissement=code,
    )


_niveau_counter = 0

def create_niveau(nom=None, ordre=None):
    global _niveau_counter
    _niveau_counter += 1
    if nom is None:
        nom = f"Niveau {_niveau_counter}"
    if ordre is None:
        ordre = _niveau_counter
    return NiveauScolaire.objects.create(nom=nom, ordre=ordre)


def create_enseignant(utilisateur=None, etablissement=None,
                      niveau=None, specialite="Mathématiques",
                      date_embauche=None):
    if utilisateur is None:
        utilisateur = create_user()
    if etablissement is None:
        etablissement = create_etablissement()
    if niveau is None:
        niveau = create_niveau()
    if date_embauche is None:
        date_embauche = datetime.date(2020, 1, 15)
    return Enseignant.objects.create(
        utilisateur=utilisateur,
        etablissement=etablissement,
        specialite=specialite,
        date_embauche=date_embauche,
        niveau=niveau,
    )


_etudiant_counter = 0

def create_etudiant(utilisateur=None, etablissement=None,
                    niveau=None, classe=None, numero_etudiant=None):
    global _etudiant_counter
    _etudiant_counter += 1
    if utilisateur is None:
        utilisateur = create_user(
            username=f"etudiant{_etudiant_counter}",
            email=f"etudiant{_etudiant_counter}@test.com",
            type_utilisateur="ETUDIANT"
        )
    if etablissement is None:
        etablissement = create_etablissement()
    if niveau is None:
        niveau = create_niveau()
    if numero_etudiant is None:
        numero_etudiant = f"ETU{_etudiant_counter:03d}"
    return Etudiant.objects.create(
        utilisateur=utilisateur,
        etablissement=etablissement,
        niveau=niveau,
        classe=classe,
        numero_etudiant=numero_etudiant,
    )


def create_matiere(nom="Mathématiques", code="MATH01", niveaux=None):
    matiere = Matiere.objects.create(nom=nom, code=code)
    if niveaux:
        matiere.niveaux.add(*niveaux)
    return matiere


_chapitre_counter = 0

def create_chapitre(titre="Chapitre 1", matiere=None, niveau=None,
                    createur=None, order=None):
    global _chapitre_counter
    _chapitre_counter += 1
    if matiere is None:
        matiere = create_matiere()
    if niveau is None:
        niveau = create_niveau()
    if order is None:
        order = _chapitre_counter
    return Chapitre.objects.create(
        titre=titre,
        order=order,
        matiere=matiere,
        niveau=niveau,
        createur=createur,
    )


_lecon_counter = 0

def create_lecon(titre="Lecon 1", chapitre=None, createur=None,
                 order=None, est_publie=True):
    global _lecon_counter
    _lecon_counter += 1
    if chapitre is None:
        chapitre = create_chapitre()
    if order is None:
        order = _lecon_counter
    return Lecon.objects.create(
        titre=titre,
        order=order,
        chapitre=chapitre,
        contenue_texte="<p>Contenu de la leçon</p>",
        duree_estimee=30,
        createur=createur,
        est_publie=est_publie,
    )


def create_examen(titre="Examen 1", enseignant=None, matiere=None,
                  niveau=None, est_publie=False, type_examen="QCM"):
    if enseignant is None:
        enseignant = create_enseignant()
    if matiere is None:
        matiere = create_matiere()
    if niveau is None:
        niveau = create_niveau()
    now = timezone.now()
    return Examen.objects.create(
        titre=titre,
        enseignant=enseignant,
        matiere=matiere,
        niveau=niveau,
        duree_minutes=60,
        date_debut=now,
        date_fin=now + datetime.timedelta(hours=2),
        est_publie=est_publie,
        type_examen=type_examen,
    )


def create_classe(nom="6ème A", niveau=None, etablissement=None):
    if niveau is None:
        niveau = create_niveau()
    if etablissement is None:
        etablissement = create_etablissement()
    return Classe.objects.create(
        nom=nom, niveau=niveau, etablissement=etablissement
    )
