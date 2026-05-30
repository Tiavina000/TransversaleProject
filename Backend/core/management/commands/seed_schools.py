from django.core.management.base import BaseCommand
from core.models import Etablissement


SCHOOLS = [
    # ── Lycées Publics d'Antananarivo ──
    {"nom": "Lycée Jules Ferry", "type": "LYCEE", "code": "LYC-JF-TANA"},
    {"nom": "Lycée Moderne Ampefiloha", "type": "LYCEE", "code": "LYC-AMP-TANA"},
    {"nom": "Lycée Andohalo", "type": "LYCEE", "code": "LYC-AND-TANA"},
    {"nom": "Lycée Analakely", "type": "LYCEE", "code": "LYC-ANA-TANA"},
    {"nom": "Lycée Antanimena", "type": "LYCEE", "code": "LYC-ANT-TANA"},
    {"nom": "Lycée Faravohitra", "type": "LYCEE", "code": "LYC-FAR-TANA"},
    {"nom": "Lycée Manjakaray", "type": "LYCEE", "code": "LYC-MAN-TANA"},
    {"nom": "Lycée Isotry", "type": "LYCEE", "code": "LYC-ISO-TANA"},
    {"nom": "Lycée Mahamasina", "type": "LYCEE", "code": "LYC-MAH-TANA"},
    {"nom": "Lycée Nanisana", "type": "LYCEE", "code": "LYC-NAN-TANA"},
    {"nom": "Lycée Alasora", "type": "LYCEE", "code": "LYC-ALA-TANA"},
    {"nom": "Lycée Ambohimanarina", "type": "LYCEE", "code": "LYC-AMR-TANA"},
    {"nom": "Lycée Ankatso", "type": "LYCEE", "code": "LYC-ANK-TANA"},
    {"nom": "Lycée Itaosy", "type": "LYCEE", "code": "LYC-ITA-TANA"},
    {"nom": "Lycée Tanjombato", "type": "LYCEE", "code": "LYC-TANJ-TANA"},
    {"nom": "Lycée Andranonahoatra", "type": "LYCEE", "code": "LYC-ANDH-TANA"},
    {"nom": "Lycée Soavimasoandro", "type": "LYCEE", "code": "LYC-SOA-TANA"},
    {"nom": "Lycée Ambohidratrimo", "type": "LYCEE", "code": "LYC-AMBD-TANA"},
    {"nom": "Lycée Antsahabe", "type": "LYCEE", "code": "LYC-ANTS-TANA"},
    {"nom": "Lycée Andraisoro", "type": "LYCEE", "code": "LYC-ADRS-TANA"},

    # ── CEG Publics d'Antananarivo ──
    {"nom": "CEG Ampefiloha", "type": "CEG", "code": "CEG-AMP-TANA"},
    {"nom": "CEG Andohalo", "type": "CEG", "code": "CEG-AND-TANA"},
    {"nom": "CEG Analakely", "type": "CEG", "code": "CEG-ANA-TANA"},
    {"nom": "CEG Antanimena", "type": "CEG", "code": "CEG-ANT-TANA"},
    {"nom": "CEG Faravohitra", "type": "CEG", "code": "CEG-FAR-TANA"},
    {"nom": "CEG Manjakaray", "type": "CEG", "code": "CEG-MAN-TANA"},
    {"nom": "CEG Isotry", "type": "CEG", "code": "CEG-ISO-TANA"},
    {"nom": "CEG Mahamasina", "type": "CEG", "code": "CEG-MAH-TANA"},
    {"nom": "CEG Nanisana", "type": "CEG", "code": "CEG-NAN-TANA"},
    {"nom": "CEG Alasora", "type": "CEG", "code": "CEG-ALA-TANA"},
    {"nom": "CEG Ambohimanarina", "type": "CEG", "code": "CEG-AMR-TANA"},
    {"nom": "CEG Ankatso", "type": "CEG", "code": "CEG-ANK-TANA"},
    {"nom": "CEG Itaosy", "type": "CEG", "code": "CEG-ITA-TANA"},
    {"nom": "CEG Tanjombato", "type": "CEG", "code": "CEG-TANJ-TANA"},
    {"nom": "CEG Ambohidratrimo", "type": "CEG", "code": "CEG-AMBD-TANA"},
    {"nom": "CEG Antsahabe", "type": "CEG", "code": "CEG-ANTS-TANA"},
    {"nom": "CEG Andranonahoatra", "type": "CEG", "code": "CEG-ANDH-TANA"},
    {"nom": "CEG Soavimasoandro", "type": "CEG", "code": "CEG-SOA-TANA"},
    {"nom": "CEG Anosizato", "type": "CEG", "code": "CEG-ANOS-TANA"},
    {"nom": "CEG Ambavahadikely", "type": "CEG", "code": "CEG-AMBAV-TANA"},
    {"nom": "CEG Bemasoandro", "type": "CEG", "code": "CEG-BEMA-TANA"},
    {"nom": "CEG Ambodivona", "type": "CEG", "code": "CEG-AMBOD-TANA"},
    {"nom": "CEG Antanimandro", "type": "CEG", "code": "CEG-ANTM-TANA"},
    {"nom": "CEG Ambohimanga", "type": "CEG", "code": "CEG-AMBM-TANA"},
    {"nom": "CEG Ambohipo", "type": "CEG", "code": "CEG-AMBOH-TANA"},
    {"nom": "CEG Ankadifotsy", "type": "CEG", "code": "CEG-ANKF-TANA"},

    # ── EPP Publics d'Antananarivo ──
    {"nom": "EPP Ampefiloha", "type": "EPP", "code": "EPP-AMP-TANA"},
    {"nom": "EPP Andohalo", "type": "EPP", "code": "EPP-AND-TANA"},
    {"nom": "EPP Analakely", "type": "EPP", "code": "EPP-ANA-TANA"},
    {"nom": "EPP Antanimena", "type": "EPP", "code": "EPP-ANT-TANA"},
    {"nom": "EPP Faravohitra", "type": "EPP", "code": "EPP-FAR-TANA"},
    {"nom": "EPP Manjakaray", "type": "EPP", "code": "EPP-MAN-TANA"},
    {"nom": "EPP Isotry", "type": "EPP", "code": "EPP-ISO-TANA"},
    {"nom": "EPP Mahamasina", "type": "EPP", "code": "EPP-MAH-TANA"},
    {"nom": "EPP Nanisana", "type": "EPP", "code": "EPP-NAN-TANA"},
    {"nom": "EPP Alasora", "type": "EPP", "code": "EPP-ALA-TANA"},
    {"nom": "EPP Ambohimanarina", "type": "EPP", "code": "EPP-AMR-TANA"},
    {"nom": "EPP Ankatso", "type": "EPP", "code": "EPP-ANK-TANA"},
    {"nom": "EPP Itaosy", "type": "EPP", "code": "EPP-ITA-TANA"},
    {"nom": "EPP Tanjombato", "type": "EPP", "code": "EPP-TANJ-TANA"},
    {"nom": "EPP Ambohidratrimo", "type": "EPP", "code": "EPP-AMBD-TANA"},
    {"nom": "EPP Andranonahoatra", "type": "EPP", "code": "EPP-ANDH-TANA"},
    {"nom": "EPP Soavimasoandro", "type": "EPP", "code": "EPP-SOA-TANA"},
    {"nom": "EPP Anosizato", "type": "EPP", "code": "EPP-ANOS-TANA"},
    {"nom": "EPP Ambavahadikely", "type": "EPP", "code": "EPP-AMBAV-TANA"},
    {"nom": "EPP Antanimandro", "type": "EPP", "code": "EPP-ANTM-TANA"},
    {"nom": "EPP Ambohipo", "type": "EPP", "code": "EPP-AMBOH-TANA"},
    {"nom": "EPP Ankadifotsy", "type": "EPP", "code": "EPP-ANKF-TANA"},
    {"nom": "EPP Bemasoandro", "type": "EPP", "code": "EPP-BEMA-TANA"},
    {"nom": "EPP Ambodivona", "type": "EPP", "code": "EPP-AMBOD-TANA"},
    {"nom": "EPP Ambonitsena", "type": "EPP", "code": "EPP-AMBN-TANA"},
    {"nom": "EPP Ambohimanga", "type": "EPP", "code": "EPP-AMBM-TANA"},
    {"nom": "EPP Ambohipotsy", "type": "EPP", "code": "EPP-AMBP-TANA"},
]


class Command(BaseCommand):
    help = "Seed the database with public schools of Antananarivo"

    def handle(self, *args, **options):
        created_count = 0
        existing_count = 0

        for school in SCHOOLS:
            _, created = Etablissement.objects.update_or_create(
                code_etablissement=school["code"],
                defaults={
                    "nom": school["nom"],
                    "type": school["type"],
                    "adresse": "Antananarivo, Madagascar",
                    "telephone": "+261000000000",
                    "email": f"{school['code'].lower()}@education.mg",
                },
            )
            if created:
                created_count += 1
            else:
                existing_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"✓ {created_count} écoles créées, {existing_count} déjà existantes"
        ))
