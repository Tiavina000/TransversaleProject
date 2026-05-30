#!/usr/bin/env python3
"""
Ré-assigne des prénoms uniques à chaque utilisateur dans credentials.txt,
avec au maximum 4 personnes partageant le même prénom dans un même établissement.
Ajoute également le nom de l'établissement à chaque ligne.
"""

import re
import random
from collections import defaultdict, Counter

random.seed(42)

# ── 1. Liste des écoles depuis seed_schools.py (dans l'ordre de création) ──
SCHOOLS_LIST = [
    # 20 Lycées
    "Lycée Jules Ferry", "Lycée Moderne Ampefiloha", "Lycée Andohalo",
    "Lycée Analakely", "Lycée Antanimena", "Lycée Faravohitra",
    "Lycée Manjakaray", "Lycée Isotry", "Lycée Mahamasina",
    "Lycée Nanisana", "Lycée Alasora", "Lycée Ambohimanarina",
    "Lycée Ankatso", "Lycée Itaosy", "Lycée Tanjombato",
    "Lycée Andranonahoatra", "Lycée Soavimasoandro", "Lycée Ambohidratrimo",
    "Lycée Antsahabe", "Lycée Andraisoro",
    # 26 CEGs
    "CEG Ampefiloha", "CEG Andohalo", "CEG Analakely",
    "CEG Antanimena", "CEG Faravohitra", "CEG Manjakaray",
    "CEG Isotry", "CEG Mahamasina", "CEG Nanisana",
    "CEG Alasora", "CEG Ambohimanarina", "CEG Ankatso",
    "CEG Itaosy", "CEG Tanjombato", "CEG Ambohidratrimo",
    "CEG Antsahabe", "CEG Andranonahoatra", "CEG Soavimasoandro",
    "CEG Anosizato", "CEG Ambavahadikely", "CEG Bemasoandro",
    "CEG Ambodivona", "CEG Antanimandro", "CEG Ambohimanga",
    "CEG Ambohipo", "CEG Ankadifotsy",
    # 27 EPPs
    "EPP Ampefiloha", "EPP Andohalo", "EPP Analakely",
    "EPP Antanimena", "EPP Faravohitra", "EPP Manjakaray",
    "EPP Isotry", "EPP Mahamasina", "EPP Nanisana",
    "EPP Alasora", "EPP Ambohimanarina", "EPP Ankatso",
    "EPP Itaosy", "EPP Tanjombato", "EPP Ambohidratrimo",
    "EPP Andranonahoatra", "EPP Soavimasoandro", "EPP Anosizato",
    "EPP Ambavahadikely", "EPP Antanimandro", "EPP Ambohipo",
    "EPP Ankadifotsy", "EPP Bemasoandro", "EPP Ambodivona",
    "EPP Ambonitsena", "EPP Ambohimanga", "EPP Ambohipotsy",
]

# IDs 10-11: 2 écoles "AUTRE" (supplémentaires)
EXTRA_SCHOOLS = ["École Privée Mixte Antananarivo", "École Primaire Catholique Tana"]

# Build mapping: etab_id → school_name
# IDs 10, 11 → EXTRA_SCHOOLS[0], EXTRA_SCHOOLS[1]
# IDs 12-31 → SCHOOLS_LIST[0:20] (20 Lycées)
# IDs 32-57 → SCHOOLS_LIST[20:46] (26 CEGs)
# IDs 58-84 → SCHOOLS_LIST[46:73] (27 EPPs)

ETAB_ID_TO_SCHOOL = {}
for i, name in enumerate(EXTRA_SCHOOLS):
    ETAB_ID_TO_SCHOOL[10 + i] = name
for i, name in enumerate(SCHOOLS_LIST[:20]):
    ETAB_ID_TO_SCHOOL[12 + i] = name
for i, name in enumerate(SCHOOLS_LIST[20:46]):
    ETAB_ID_TO_SCHOOL[32 + i] = name
for i, name in enumerate(SCHOOLS_LIST[46:73]):
    ETAB_ID_TO_SCHOOL[58 + i] = name

# ── 2. Pool de prénoms malgaches (200+) pour garantir max 4 par établissement ──
ALL_PRENOMS = [
    "Miora", "Sarobidy", "Soa", "Feno", "Tiana", "Noro", "Lalaina", "Voahangy",
    "Mirana", "Tantely", "Nantenaina", "Rondro", "Mamy", "Tahiry", "Fara", "Holy",
    "Toky", "Maminirina", "Rado", "Fidy", "Hery", "Tafika", "Nandrianina", "Manda",
    "Fandresena", "Rindra", "Nirina", "Tao", "Rija", "Haja", "Manoa", "Tiavina",
    "Miangaly", "Tahina", "Nambinina", "Herimalala", "Randria", "Faniry", "Mendrika",
    "Aina", "Ando", "Avotra", "Bako", "Bema", "Bodo", "Dada", "Dera",
    "Dina", "Doda", "Domoina", "Donné", "Elia", "Falinera", "Famindrana", "Fanamby",
    "Fanantenana", "Fanja", "Fano", "Fara", "Faratiana", "Fenohery", "Fenohasina",
    "Fetra", "Fetraniaina", "Fiderana", "Fidy", "Fihobiana", "Fijaliana", "Fikambanana",
    "Filahy", "Finaritra", "Firaisana", "Fitaraina", "Fitahiana", "Fitia", "Fomba",
    "Hajatiana", "Hanta", "Harilala", "Harimalala", "Hasina", "Hasintiana", "Henintsoa",
    "Henitiana", "Heriala", "Herilala", "Herimalala", "Herimampionona", "Herinirina",
    "Heriniaina", "Heritiana", "Hery", "Hoby", "Holiniaina", "Honore",
    "Hortance", "Ida", "Ilo", "Ima", "Imita", "Irinah", "Irmah", "Ismael",
    "Jaona", "Jean", "Jeannot", "Joela", "Joelina", "Josette", "Josiane", "Juliette",
    "Kanto", "Karem", "Karine", "Katia", "Koto", "Lala", "Lalatiana", "Lalao",
    "Lalatiana", "Lalita", "Landry", "Lanto", "Lantoniaina", "Lilia", "Lita", "Liva",
    "Lovasoa", "Lucien", "Lucie", "Lydia", "Maharavo", "Mahasoa", "Mamihaja", "Maminirina",
    "Mamy", "Manda", "Manitra", "Manoa", "Manohisoa", "Manombaka", "Mampionona", "Mamy",
    "Manantena", "Manjaka", "Manjakaray", "Manjakasoa", "Manoa", "Manoela", "Manou", "Marcel",
    "Marguerite", "Marie", "Martine", "Mathilde", "Mendrika", "Miary", "Mihaja", "Mihary",
    "Miharisoa", "Mija", "Mika", "Milton", "Miora", "Mirana", "Mirindra", "Modeste",
    "Monica", "Monique", "Naina", "Nambinina", "Nandrianina", "Nanie", "Nantenaina",
    "Nantsoina", "Napoleon", "Narindra", "Narson", "Nathalie", "Nekena", "Nicole", "Nirina",
    "Nivo", "Noeline", "Noro", "Norotiana", "Odette", "Olga", "Olivier", "Olombelona",
    "Onintsoa", "Organiste", "Orly", "Pascal", "Patricia", "Patrick", "Paul", "Paulin",
    "Perle", "Philippe", "Pierre", "Poopy", "Prisca", "Rado", "Raini", "Rajaonarison",
    "Rakoto", "Rakotomalala", "Rakotomanga", "Rakotonirina", "Rakotoson", "Rakotozafy",
    "Rala", "Randria", "Randrianarison", "Randrianasolo", "Rasoa", "Ratsimbazafy",
    "Ravo", "Razafy", "Razanamaro", "Razanandrasana", "Riana", "Rija", "Rindra",
    "Rivosoa", "Robert", "Roger", "Rondro", "Rose", "Rosine", "Rova", "Rufin",
    "Saïd", "Sambatra", "Sanda", "Sandratra", "Sandrine", "Sandra", "Sarobidy", "Serge",
    "Sitraka", "Soa", "Soafara", "Soaliana", "Soanirina", "Soatiana", "Solange", "Solofo",
    "Stacy", "Stéphane", "Suzanne", "Sylvain", "Sylvie", "Tafika", "Tahiana", "Tahina",
    "Tahiry", "Tahisoa", "Tantely", "Tantelinirina", "Tao", "Tata", "Théophile", "Thérèse",
    "Tiana", "Tianarivo", "Tiavina", "Tina", "Todisoa", "Toky", "Tojo", "Tolotra",
    "Tolojanahary", "Tsanta", "Tsantatiana", "Tsarafara", "Tsaralaza", "Tsiaro", "Tsilavina",
    "Tsimandahatry", "Tsimihety", "Tsinjo", "Tsinjoniaina", "Tsiry", "Voahangy",
    "Voahirana", "Voahary", "Voajanahary", "Voakaty", "Voakena", "Voalala", "Voangy",
    "Vonjy", "Vonjiniaina", "Vonona", "Vony", "Yvette", "Zafy", "Zaka", "Zara",
    "Zay", "Zo", "Zoly", "Zosimo", "Zozime",
]

def get_etab_id_from_etu(username):
    """Extract etab ID from student username etu.X.Y.Z"""
    m = re.match(r'etu\.(\d+)\.', username)
    return int(m.group(1)) if m else None

def get_etab_id_from_prof(username):
    """Extract etab ID from prof username prof.nom.prenom.X.subject"""
    parts = username.split('.')
    if len(parts) >= 4:
        try:
            return int(parts[3])
        except ValueError:
            # Try parts[4] if parts[3] has letters
            if len(parts) >= 5:
                try:
                    return int(parts[4])
                except ValueError:
                    pass
    return None

def get_etab_id_from_admin(username):
    """Extract etab ID from admin username admin.X"""
    m = re.match(r'admin\.(\d+)', username)
    return int(m.group(1)) if m else None

# ── 3. Read credentials file ──
with open("/home/tiavina/Téléchargements/ENENI-main/credentials.txt", "r") as f:
    lines = f.readlines()

# Parse each data line
# Store: (original_line, role, etab_id, etab_name, prenom, new_prenom, rest_of_line)
entries = []

current_section = None
for line in lines:
    stripped = line.rstrip('\n')
    if stripped.startswith("ENSEIGNANTS"):
        current_section = 'ENSEIGNANT'
        continue
    elif stripped.startswith("ADMINISTRATEURS"):
        current_section = 'ADMINISTRATEUR'
        continue
    elif stripped.startswith("ÉLÈVES"):
        current_section = 'ETUDIANT'
        continue
    if stripped.startswith("=") or stripped.startswith("---") or stripped.startswith("=== CREDENTIALS") or stripped.startswith("Mot de passe") or stripped.startswith("Total") or stripped.startswith("  →") or stripped == "":
        continue
    
    # Parse data line
    # Format: [✓] [✓] data | user: XXX | ...
    m = re.match(r'^(\[[✓✗]\]\s+\[[✓✗]\]\s+)(.*)', stripped)
    if not m:
        continue
    
    prefix = m.group(1)
    rest = m.group(2)
    
    # Extract username
    um = re.search(r'user:\s*(\S+)', rest)
    if not um:
        continue
    username = um.group(1)
    
    # Determine role and etab_id
    role = current_section
    etab_id = None
    
    if "etu." in username:
        etab_id = get_etab_id_from_etu(username)
        role = 'ETUDIANT'
    elif "prof." in username:
        etab_id = get_etab_id_from_prof(username)
        role = 'ENSEIGNANT'
    elif "admin." in username:
        etab_id = get_etab_id_from_admin(username)
        role = 'ADMINISTRATEUR'
    
    # Get school name
    etab_name = ETAB_ID_TO_SCHOOL.get(etab_id, f"Établissement #{etab_id}") if etab_id else "Inconnu"
    
    # Extract current first name
    # Format after prefix: either "Classe | Prenom | user:..." or just "Prenom | user:..."
    name_part = rest.split("| user:")[0].strip()
    # name_part could be "1ère A | Fara" or just "Fara"
    if " | " in name_part:
        parts = name_part.split(" | ")
        prenom = parts[-1].strip()  # Last part before user is the first name
        # Rest is everything except the prenom
        before_prenom = rest[:rest.rindex(prenom)]
    else:
        prenom = name_part.strip()
        before_prenom = rest[:rest.index(prenom)]
    
    entries.append({
        'prefix': prefix,
        'before_prenom': before_prenom,
        'prenom': prenom,
        'rest_after': rest[len(before_prenom) + len(prenom):],
        'role': role,
        'etab_id': etab_id,
        'etab_name': etab_name,
    })

print(f"Parsed {len(entries)} entries")
print(f"  Students: {sum(1 for e in entries if e['role'] == 'ETUDIANT')}")
print(f"  Teachers: {sum(1 for e in entries if e['role'] == 'ENSEIGNANT')}")
print(f"  Admins: {sum(1 for e in entries if e['role'] == 'ADMINISTRATEUR')}")

# ── 4. Assign new unique first names per establishment ──
# Group by (etab_id, role)
from collections import defaultdict

groups = defaultdict(list)
for i, e in enumerate(entries):
    key = (e['etab_id'], e['role'])
    groups[key].append(i)

print(f"\nUnique (etab, role) groups: {len(groups)}")

# For each group, assign new first names ensuring max 4 per name
name_pool = list(ALL_PRENOMS)
random.shuffle(name_pool)

new_names_count = 0
used_names_global = set()

for (etab_id, role), indices in sorted(groups.items()):
    # Shuffle for randomness
    random.shuffle(indices)
    n = len(indices)
    
    # We need at most 4 people per name
    unique_names_needed = (n + 3) // 4  # ceil(n/4)
    
    # Take fresh names from the pool
    if len(name_pool) < unique_names_needed:
        # Refill and reshuffle
        name_pool = list(ALL_PRENOMS)
        random.shuffle(name_pool)
        print(f"  Warning: refilled pool for etab {etab_id}, role {role}")
    
    assigned_names = name_pool[:unique_names_needed]
    name_pool = name_pool[unique_names_needed:]
    
    # Distribute names: each name up to 4 times
    name_assignments = []
    for idx, name in enumerate(assigned_names):
        count = min(4, n - len(name_assignments))
        name_assignments.extend([name] * count)
    
    random.shuffle(name_assignments)
    
    # Assign
    for i, idx in enumerate(indices):
        old_name = entries[idx]['prenom']
        new_name = name_assignments[i]
        entries[idx]['prenom'] = new_name
        if old_name != new_name:
            new_names_count += 1
        used_names_global.add(new_name)

print(f"Changed {new_names_count} names")

# ── 5. Verify no more than 4 share the same name per establishment ──
name_counts = defaultdict(lambda: defaultdict(int))
violations = 0
for e in entries:
    name_counts[(e['etab_id'], e['role'])][e['prenom']] += 1

for (etab_id, role), names in name_counts.items():
    for name, count in names.items():
        if count > 4:
            violations += 1
            print(f"  VIOLATION: etab {etab_id}, {role}: {name} appears {count} times")

if violations == 0:
    print("✓ No violations - max 4 per name per establishment")
else:
    print(f"✗ {violations} violations found!")

# ── 6. Write output file ──
output_lines = []
output_lines.append("=== CREDENTIALS ENENI (AVEC PRÉNOMS UNIQUES) ===")
output_lines.append("Mot de passe unique pour tous : pass1234")
output_lines.append("")
# Count
from collections import Counter
role_counts = Counter(e['role'] for e in entries)
output_lines.append(f"Total utilisateurs : {len(entries)}")
output_lines.append(f"  → Élèves : {role_counts.get('ETUDIANT', 0)}")
output_lines.append(f"  → Enseignants : {role_counts.get('ENSEIGNANT', 0)}")
output_lines.append(f"  → Administrateurs : {role_counts.get('ADMINISTRATEUR', 0)}")
output_lines.append(f"  → Établissements : {len(set(e['etab_id'] for e in entries if e['etab_id']))}")
output_lines.append("")
output_lines.append("=" * 80)

# ENSEIGNANTS
output_lines.append("")
output_lines.append("=" * 80)
output_lines.append("ENSEIGNANTS")
output_lines.append("=" * 80)
output_lines.append("")
for e in entries:
    if e['role'] != 'ENSEIGNANT':
        continue
    line = f"{e['prefix']}{e['before_prenom']}{e['prenom']}{e['rest_after']} | établissement: {e['etab_name']}"
    output_lines.append(line)

# ADMINISTRATEURS
output_lines.append("")
output_lines.append("=" * 80)
output_lines.append("ADMINISTRATEURS")
output_lines.append("=" * 80)
output_lines.append("")
for e in entries:
    if e['role'] != 'ADMINISTRATEUR':
        continue
    line = f"{e['prefix']}{e['before_prenom']}{e['prenom']}{e['rest_after']} | établissement: {e['etab_name']}"
    output_lines.append(line)

# ÉLÈVES
output_lines.append("")
output_lines.append("=" * 80)
output_lines.append("ÉLÈVES")
output_lines.append("=" * 80)

current_classe = None
for e in entries:
    if e['role'] != 'ETUDIANT':
        continue
    # Extract class from before_prenom (e.g., "1ère A | ")
    before = e['before_prenom'].strip()
    if before.endswith("|"):
        classe = before[:-1].strip()
    else:
        classe = before
    
    if " | " in before:
        classe = before.split(" | ")[0].strip()
    else:
        classe = "Inconnu"
    
    if classe != current_classe:
        output_lines.append("")
        output_lines.append(f"--- {classe} ---")
        output_lines.append("")
        current_classe = classe
    
    line = f"{e['prefix']}{e['before_prenom']}{e['prenom']}{e['rest_after']} | établissement: {e['etab_name']}"
    output_lines.append(line)

with open("/home/tiavina/Téléchargements/ENENI-main/credentials.txt", "w") as f:
    f.write("\n".join(output_lines))
    f.write("\n")

print(f"\n✓ Fichier écrit: credentials.txt ({len(output_lines)} lignes)")
