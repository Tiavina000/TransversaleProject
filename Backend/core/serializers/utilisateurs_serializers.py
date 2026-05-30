from rest_framework import serializers
from core.models import Utilisateur, Etudiant, Enseignant, AdminPlateforme
from .base_serializers import UtilisateurSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    role = serializers.CharField(required=False)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.type_utilisateur
        if user.type_utilisateur == 'ETUDIANT' and hasattr(user, 'etudiant_profile'):
            token['niveau'] = user.etudiant_profile.niveau.nom if user.etudiant_profile.niveau else None
        return token

    def validate(self, attrs):
        username = attrs.get('username')
        role = attrs.get('role')
        establishment_id = self.context['request'].data.get('establishment_id') if 'request' in self.context else None
        
        # 1. Résolution de l'utilisateur
        user = None
        if username and Utilisateur.objects.filter(username=username).exists():
            user = Utilisateur.objects.get(username=username)
        elif username:
            etudiant = Etudiant.objects.filter(numero_etudiant=username).select_related('utilisateur').first()
            if etudiant:
                user = etudiant.utilisateur
                attrs['username'] = user.username

        if not user:
            raise serializers.ValidationError({"detail": "Identifiants incorrects."})

        # 2. Vérification du rôle (si fourni)
        if role and user.type_utilisateur != role:
             raise serializers.ValidationError({"detail": f"Ce compte n'est pas enregistré comme {role}."})

        # 3. Vérification de l'établissement (si fourni)
        if establishment_id:
            if role == 'ETUDIANT':
                if not hasattr(user, 'etudiant_profile') or str(user.etudiant_profile.etablissement_id) != str(establishment_id):
                    raise serializers.ValidationError({"detail": "Cet étudiant n'est pas inscrit dans cet établissement."})
            elif role == 'ENSEIGNANT':
                if not hasattr(user, 'enseignant_profile') or str(user.enseignant_profile.etablissement_id) != str(establishment_id):
                    raise serializers.ValidationError({"detail": "Cet enseignant n'appartient pas à cet établissement."})
            elif role == 'ADMINISTRATEUR':
                from core.models import AdminEtablissement
                admin_etab = AdminEtablissement.objects.filter(utilisateur=user).first()
                if admin_etab and str(admin_etab.etablissement_id) != str(establishment_id):
                    raise serializers.ValidationError({"detail": "Vous n'êtes pas administrateur de cet établissement."})

        # 4. Authentification standard
        data = super().validate(attrs)
        
        user_data = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'prenom': self.user.prenom or self.user.username,
            'role': self.user.type_utilisateur,
            'type_utilisateur': self.user.type_utilisateur,
        }
        
        if self.user.type_utilisateur == 'ETUDIANT' and hasattr(self.user, 'etudiant_profile'):
            profile = self.user.etudiant_profile
            user_data['niveau'] = profile.niveau.nom if profile.niveau else None
            user_data['niveau_id'] = profile.niveau.id if profile.niveau else None
            user_data['numero_etudiant'] = profile.numero_etudiant
            if profile.etablissement:
                user_data['etablissement'] = profile.etablissement.nom
                user_data['etablissement_id'] = profile.etablissement.id
            if profile.classe:
                user_data['classe'] = profile.classe.nom
                user_data['classe_id'] = profile.classe.id
        elif self.user.type_utilisateur == 'ENSEIGNANT' and hasattr(self.user, 'enseignant_profile'):
            profile = self.user.enseignant_profile
            user_data['specialite'] = profile.specialite
            if profile.niveau:
                user_data['niveau'] = profile.niveau.nom
                user_data['niveau_id'] = profile.niveau.id
            if profile.etablissement:
                user_data['etablissement'] = profile.etablissement.nom
                user_data['etablissement_id'] = profile.etablissement.id
            from core.models.pedagogie import Matiere as MatiereModel
            matieres = set()
            matieres_ids = set()
            if profile.specialite:
                m = MatiereModel.objects.filter(nom__iexact=profile.specialite).first()
                if m:
                    matieres.add(m.nom)
                    matieres_ids.add(m.id)
            for ex in profile.examens.all():
                if ex.matiere:
                    matieres.add(ex.matiere.nom)
                    matieres_ids.add(ex.matiere.id)
            user_data['matieres_enseignees'] = list(matieres)
            user_data['matieres_enseignees_ids'] = list(matieres_ids)
            user_data['niveaux_enseignes'] = [profile.niveau.nom] if profile.niveau else []
        
        data['user'] = user_data
        return data


class EtudiantSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)
    utilisateur_id = serializers.IntegerField(write_only=True)
    niveau_nom = serializers.ReadOnlyField(source='niveau.nom')
    etablissement_nom = serializers.ReadOnlyField(source='etablissement.nom')

    class Meta:
        model = Etudiant
        fields = ['id', 'utilisateur', 'utilisateur_id', 'numero_etudiant', 'points_global', 'date_inscription', 'niveau', 'niveau_nom', 'etablissement', 'etablissement_nom']
        read_only_fields = ['id', 'date_inscription', 'niveau_nom', 'etablissement_nom']


class EnseignantSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)
    utilisateur_id = serializers.IntegerField(write_only=True)
    niveau_nom = serializers.ReadOnlyField(source='niveau.nom')

    class Meta:
        model = Enseignant
        fields = ['id', 'utilisateur', 'utilisateur_id', 'specialite', 'date_embauche', 'niveau', 'niveau_nom']
        read_only_fields = ['id']


class AdminPlateformeSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)
    utilisateur_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AdminPlateforme
        fields = ['id', 'utilisateur', 'utilisateur_id', 'niveau_acces']
        read_only_fields = ['id']
