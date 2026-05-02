#!/usr/bin/env python
"""
Script de test pour les APIs REST ENENI
Utilise le module requests pour faire des appels HTTP
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000/api"
HEADERS = {"Content-Type": "application/json"}

# ============================================================================
# TESTS DES UTILISATEURS
# ============================================================================

def test_utilisateurs():
    """Test les endpoints utilisateurs"""
    print("\n🔷 TEST: UTILISATEURS")
    print("=" * 60)
    
    # 1. Lister les utilisateurs
    print("\n1️⃣  GET /api/utilisateurs/ - Lister")
    response = requests.get(f"{BASE_URL}/utilisateurs/")
    print(f"Status: {response.status_code}")
    print(f"Résultats: {response.json()['count']} utilisateurs")
    
    # 2. Créer un utilisateur
    print("\n2️⃣  POST /api/utilisateurs/ - Créer")
    user_data = {
        "username": "john_test",
        "email": "john@test.com",
        "prenom": "John",
        "password": "SecurePass123!",
        "type_utilisateur": "ETUDIANT",
        "langue_preferee": "FR"
    }
    response = requests.post(f"{BASE_URL}/utilisateurs/", json=user_data, headers=HEADERS)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        user_id = response.json()['id']
        print(f"✅ Utilisateur créé avec ID: {user_id}")
        
        # 3. Récupérer l'utilisateur
        print(f"\n3️⃣  GET /api/utilisateurs/{user_id}/ - Détail")
        response = requests.get(f"{BASE_URL}/utilisateurs/{user_id}/")
        print(f"Status: {response.status_code}")
        print(f"Username: {response.json()['username']}")
        
        # 4. Mettre à jour
        print(f"\n4️⃣  PATCH /api/utilisateurs/{user_id}/ - Mettre à jour")
        update_data = {"prenom": "Jonathan"}
        response = requests.patch(
            f"{BASE_URL}/utilisateurs/{user_id}/",
            json=update_data,
            headers=HEADERS
        )
        print(f"Status: {response.status_code}")
        print(f"Nouveau prénom: {response.json()['prenom']}")
        
        # 5. Lister les actifs
        print(f"\n5️⃣  GET /api/utilisateurs/actifs/ - Utilisateurs actifs")
        response = requests.get(f"{BASE_URL}/utilisateurs/actifs/")
        print(f"Status: {response.status_code}")
        print(f"Utilisateurs actifs: {response.json()['count']}")


# ============================================================================
# TESTS DES ÉTUDIANTS
# ============================================================================

def test_etudiants():
    """Test les endpoints étudiants"""
    print("\n🔷 TEST: ÉTUDIANTS")
    print("=" * 60)
    
    # Lister les étudiants
    print("\n1️⃣  GET /api/etudiants/ - Lister")
    response = requests.get(f"{BASE_URL}/etudiants/")
    print(f"Status: {response.status_code}")
    print(f"Résultats: {response.json()['count']} étudiants")
    
    # Top étudiants par points
    print("\n2️⃣  GET /api/etudiants/top_points/?limit=5 - Top 5")
    response = requests.get(f"{BASE_URL}/etudiants/top_points/?limit=5")
    print(f"Status: {response.status_code}")
    if response.json():
        for etudiant in response.json():
            print(f"  - {etudiant['utilisateur']['username']}: {etudiant['points_global']} points")


# ============================================================================
# TESTS DE LA PÉDAGOGIE
# ============================================================================

def test_pedagogie():
    """Test les endpoints pédagogiques"""
    print("\n🔷 TEST: PÉDAGOGIE")
    print("=" * 60)
    
    # 1. Lister les niveaux
    print("\n1️⃣  GET /api/niveaux-scolaires/ - Niveaux")
    response = requests.get(f"{BASE_URL}/niveaux-scolaires/")
    print(f"Status: {response.status_code}")
    print(f"Niveaux: {response.json()['count']}")
    
    # 2. Lister les matières
    print("\n2️⃣  GET /api/matieres/ - Matières")
    response = requests.get(f"{BASE_URL}/matieres/")
    print(f"Status: {response.status_code}")
    print(f"Matières: {response.json()['count']}")
    if response.json()['results']:
        matiere_id = response.json()['results'][0]['id']
        
        # 3. Chapitres d'une matière
        print(f"\n3️⃣  GET /api/matieres/{matiere_id}/chapitres/ - Chapitres")
        response = requests.get(f"{BASE_URL}/matieres/{matiere_id}/chapitres/")
        print(f"Status: {response.status_code}")
        print(f"Chapitres: {len(response.json())} chapitres")


# ============================================================================
# TESTS DES EXAMENS
# ============================================================================

def test_examens():
    """Test les endpoints examens"""
    print("\n🔷 TEST: EXAMENS")
    print("=" * 60)
    
    # 1. Lister les examens
    print("\n1️⃣  GET /api/examens/ - Lister")
    response = requests.get(f"{BASE_URL}/examens/")
    print(f"Status: {response.status_code}")
    print(f"Examens: {response.json()['count']}")
    
    # 2. Examens publiés
    print("\n2️⃣  GET /api/examens/publies/ - Publiés")
    response = requests.get(f"{BASE_URL}/examens/publies/")
    print(f"Status: {response.status_code}")
    print(f"Examens publiés: {response.json()['count']}")
    
    # 3. Créer un examen (nécessite un enseignant)
    print("\n3️⃣  POST /api/examens/ - Créer")
    date_debut = datetime.now() + timedelta(days=7)
    date_fin = date_debut + timedelta(hours=2)
    
    exam_data = {
        "titre": "Examen Mathématiques 2024",
        "enseignant": 1,
        "matiere": 1,
        "niveau": 1,
        "duree_minutes": 120,
        "date_debut": date_debut.isoformat() + "Z",
        "date_fin": date_fin.isoformat() + "Z",
        "est_publie": False,
        "coefficient": 1.0
    }
    response = requests.post(f"{BASE_URL}/examens/", json=exam_data, headers=HEADERS)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        exam = response.json()
        print(f"✅ Examen créé: {exam['titre']} (ID: {exam['id']})")


# ============================================================================
# TESTS DE LA BOUTIQUE
# ============================================================================

def test_boutique():
    """Test les endpoints boutique"""
    print("\n🔷 TEST: BOUTIQUE")
    print("=" * 60)
    
    # 1. Ressources disponibles
    print("\n1️⃣  GET /api/ressources-boutique/disponibles/ - Disponibles")
    response = requests.get(f"{BASE_URL}/ressources-boutique/disponibles/")
    print(f"Status: {response.status_code}")
    print(f"Ressources disponibles: {response.json()['count']}")
    
    # 2. Paniers
    print("\n2️⃣  GET /api/paniers/ - Paniers")
    response = requests.get(f"{BASE_URL}/paniers/")
    print(f"Status: {response.status_code}")
    print(f"Paniers: {response.json()['count']}")
    
    # 3. Commandes
    print("\n3️⃣  GET /api/commandes/ - Commandes")
    response = requests.get(f"{BASE_URL}/commandes/")
    print(f"Status: {response.status_code}")
    print(f"Commandes: {response.json()['count']}")


# ============================================================================
# TESTS AVANCÉS: PAGINATION ET FILTRAGE
# ============================================================================

def test_pagination_filtrage():
    """Test la pagination et le filtrage"""
    print("\n🔷 TEST: PAGINATION & FILTRAGE")
    print("=" * 60)
    
    # 1. Pagination
    print("\n1️⃣  Pagination - Page 2 avec 5 résultats")
    response = requests.get(f"{BASE_URL}/utilisateurs/?page=2&page_size=5")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total: {data['count']}")
    print(f"Page actuelle: {len(data['results'])} résultats")
    print(f"Suivant: {data['next']}")
    
    # 2. Recherche
    print("\n2️⃣  Recherche - Rechercher 'john'")
    response = requests.get(f"{BASE_URL}/utilisateurs/?search=john")
    print(f"Status: {response.status_code}")
    print(f"Résultats: {response.json()['count']}")
    
    # 3. Tri
    print("\n3️⃣  Tri - Trier par date décroissante")
    response = requests.get(f"{BASE_URL}/utilisateurs/?ordering=-date_creation")
    print(f"Status: {response.status_code}")
    if response.json()['results']:
        first = response.json()['results'][0]
        print(f"Premier résultat créé: {first['date_creation']}")
    
    # 4. Combiné
    print("\n4️⃣  Combiné - Recherche + Tri + Pagination")
    url = f"{BASE_URL}/utilisateurs/?search=john&ordering=-date_creation&page_size=15"
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    print(f"Résultats: {len(response.json()['results'])} utilisateurs")


# ============================================================================
# TESTS DES ERREURS
# ============================================================================

def test_erreurs():
    """Test la gestion des erreurs"""
    print("\n🔷 TEST: GESTION DES ERREURS")
    print("=" * 60)
    
    # 1. 404 - Non trouvé
    print("\n1️⃣  GET /api/utilisateurs/99999/ - 404")
    response = requests.get(f"{BASE_URL}/utilisateurs/99999/")
    print(f"Status: {response.status_code}")
    print(f"Erreur: {response.json()}")
    
    # 2. 400 - Données invalides
    print("\n2️⃣  POST /api/utilisateurs/ avec données invalides - 400")
    bad_data = {
        "username": "",  # Champ obligatoire vide
        "email": "invalid-email"  # Email invalide
    }
    response = requests.post(f"{BASE_URL}/utilisateurs/", json=bad_data, headers=HEADERS)
    print(f"Status: {response.status_code}")
    print(f"Erreurs: {response.json()}")


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════════╗
    ║     🚀 Tests des APIs REST - Projet ENENI                    ║
    ║     http://localhost:8000/api/                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    """)
    
    try:
        # Tester la connexion
        print("🔧 Vérification de la connexion...")
        response = requests.get(f"{BASE_URL}/utilisateurs/", timeout=5)
        if response.status_code == 200:
            print("✅ Connexion OK\n")
        else:
            print(f"⚠️  Réponse inattendue: {response.status_code}\n")
        
        # Exécuter les tests
        test_utilisateurs()
        test_etudiants()
        test_pedagogie()
        test_examens()
        test_boutique()
        test_pagination_filtrage()
        test_erreurs()
        
        print("\n" + "=" * 60)
        print("✅ Tests complétés!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur!")
        print("   Assurez-vous que Django est en exécution:")
        print("   python manage.py runserver")
    except Exception as e:
        print(f"❌ Erreur: {e}")
