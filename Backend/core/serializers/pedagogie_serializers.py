from rest_framework import serializers
from django.db.models import Count
from core.models import (
    NiveauScolaire, Matiere, Chapitre, Lecon, FichierMultimedia, SessionEtude,
    Classe, Etudiant, Enseignant
)
from core.models.pedagogie import ProgressionChapitre


class SessionEtudeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionEtude
        fields = '__all__'


class NiveauScolaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = NiveauScolaire
        fields = ['id', 'nom', 'ordre', 'description']
        read_only_fields = ['id']


class MatiereSerializer(serializers.ModelSerializer):
    niveaux = NiveauScolaireSerializer(many=True, read_only=True)
    niveaux_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, 
        queryset=NiveauScolaire.objects.all(),
        source='niveaux'
    )

    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'code', 'description', 'niveaux', 'niveaux_ids', 'ordre']
        read_only_fields = ['id']


class FichierMultimediaSerializer(serializers.ModelSerializer):
    nom = serializers.ReadOnlyField(source='titre')
    taille = serializers.SerializerMethodField()
    type = serializers.ReadOnlyField(source='format')
    isDownloadable = serializers.ReadOnlyField(source='est_telechargeable')
    url = serializers.ReadOnlyField(source='url_fichier')

    class Meta:
        model = FichierMultimedia
        fields = [
            'id', 'type_fichier', 'titre', 'url_fichier', 'taille_no',
            'lecon', 'format', 'metadata', 'nom', 'taille', 'type', 'isDownloadable', 'url'
        ]
        read_only_fields = ['id']

    def get_taille(self, obj):
        return f"{obj.taille_no} MB"


class LeconSerializer(serializers.ModelSerializer):
    fichiers = FichierMultimediaSerializer(many=True, read_only=True)
    matiere = serializers.ReadOnlyField(source='chapitre.matiere.nom')
    niveau = serializers.ReadOnlyField(source='chapitre.niveau.nom')
    content_html = serializers.ReadOnlyField(source='contenue_texte')
    description = serializers.ReadOnlyField(source='objectifs')
    enseignant = serializers.SerializerMethodField()
    video_url_display = serializers.SerializerMethodField()

    class Meta:
        model = Lecon
        fields = [
            'id', 'titre', 'order', 'chapitre', 'matiere', 'niveau',
            'description', 'enseignant', 'video_url', 'video_url_display',
            'contenue_texte', 'content_html', 'duree_estimee', 'objectifs',
            'fichiers', 'est_publie', 'createur'
        ]
        read_only_fields = ['id', 'createur']
        validators = []
        extra_kwargs = {
            'order': {'required': False},
        }

    def get_enseignant(self, obj):
        if obj.createur:
            return {
                'nom': f"{obj.createur.utilisateur.prenom or obj.createur.utilisateur.username}",
                'photo': None,
                'specialite': obj.createur.specialite or obj.chapitre.matiere.nom
            }
        return {
            'nom': 'Prof. Rakoto',
            'photo': None,
            'specialite': obj.chapitre.matiere.nom
        }

    def get_video_url_display(self, obj):
        if obj.video_url:
            return obj.video_url
        video = obj.fichiers.filter(type_fichier='VIDEO').first()
        return video.url_fichier if video else None


class ChapitreSerializer(serializers.ModelSerializer):
    lecons = LeconSerializer(many=True, read_only=True)

    class Meta:
        model = Chapitre
        fields = [
            'id', 'titre', 'order', 'matiere', 'niveau',
            'description', 'lecons'
        ]
        read_only_fields = ['id']
        validators = []
        extra_kwargs = {
            'order': {'required': False},
        }


class ChapitreDetailSerializer(serializers.ModelSerializer):
    """Serializer complet avec les leçons imbriquées"""
    matiere = MatiereSerializer(read_only=True)
    niveau = NiveauScolaireSerializer(read_only=True)
    lecons = serializers.SerializerMethodField()

    class Meta:
        model = Chapitre
        fields = [
            'id', 'titre', 'order', 'matiere', 'niveau',
            'description', 'lecons'
        ]

    def get_lecons(self, obj):
        lecons = obj.lecons.all()
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.type_utilisateur == 'ETUDIANT':
            from django.db.models import Q
            q_filter = Q(est_publie=True)
            if hasattr(request.user, 'etudiant_profile') and request.user.etudiant_profile.etablissement:
                q_filter &= Q(createur__etablissement=request.user.etudiant_profile.etablissement)
            lecons = lecons.filter(q_filter)
        return LeconSerializer(lecons, many=True, context=self.context).data


class EtudiantMinimalSerializer(serializers.ModelSerializer):
    prenom = serializers.CharField(source='utilisateur.prenom')
    nom_utilisateur = serializers.CharField(source='utilisateur.username')
    email = serializers.CharField(source='utilisateur.email')

    class Meta:
        model = Etudiant
        fields = ['id', 'prenom', 'nom_utilisateur', 'email', 'numero_etudiant']


class ClasseDetailSerializer(serializers.ModelSerializer):
    niveau_nom = serializers.CharField(source='niveau.nom')
    etablissement_nom = serializers.CharField(source='etablissement.nom')
    eleves = serializers.SerializerMethodField()
    professeurs = serializers.SerializerMethodField()

    class Meta:
        model = Classe
        fields = [
            'id', 'nom', 'niveau', 'niveau_nom',
            'etablissement', 'etablissement_nom',
            'eleves', 'professeurs'
        ]

    def get_eleves(self, obj):
        request = self.context.get('request')
        is_teacher = (
            request
            and hasattr(request.user, 'enseignant_profile')
            and request.user.type_utilisateur == 'ENSEIGNANT'
        )

        if is_teacher:
            enseignant = request.user.enseignant_profile
            chapitres = Chapitre.objects.filter(createur=enseignant, niveau=obj.niveau)
            chapitre_ids = list(chapitres.values_list('id', flat=True))
            total = len(chapitre_ids)

            etudiant_ids = [e.id for e in obj.etudiants.all()]
            progressions = ProgressionChapitre.objects.filter(
                etudiant_id__in=etudiant_ids,
                chapitre_id__in=chapitre_ids,
                est_valide=True
            ).values('etudiant_id').annotate(count=Count('id'))
            valides_map = {p['etudiant_id']: p['count'] for p in progressions}

            result = []
            for etudiant in obj.etudiants.all():
                valides = valides_map.get(etudiant.id, 0)
                result.append({
                    'id': etudiant.id,
                    'prenom': etudiant.utilisateur.prenom,
                    'nom_utilisateur': etudiant.utilisateur.username,
                    'email': etudiant.utilisateur.email,
                    'numero_etudiant': etudiant.numero_etudiant,
                    'total_chapitres': total,
                    'chapitres_valides': valides,
                    'chapitres_en_attente': total - valides,
                })
            return result

        # Non-enseignant: retour simple sans stats
        return EtudiantMinimalSerializer(obj.etudiants.all(), many=True).data

    def get_professeurs(self, obj):
        enseignants = Enseignant.objects.filter(
            etablissement=obj.etablissement,
            niveau=obj.niveau
        ).select_related('utilisateur')
        result = []
        for ens in enseignants:
            matieres = set()
            if ens.specialite:
                matieres.add(ens.specialite)
            for ex in ens.examens.filter(niveau=obj.niveau).select_related('matiere'):
                if ex.matiere:
                    matieres.add(ex.matiere.nom)
            result.append({
                'id': ens.id,
                'nom': f"{ens.utilisateur.prenom} {ens.utilisateur.username.replace('prof.', '').split('.')[0].capitalize() if hasattr(ens.utilisateur, 'username') else ens.utilisateur.prenom}",
                'specialite': ens.specialite,
                'matieres_enseignees': list(matieres) if matieres else [ens.specialite] if ens.specialite else [],
            })
        return result
