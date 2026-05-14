from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Authentification via email ou username.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        role = kwargs.get('role')
        
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
            
        try:
            # On cherche par username, email OU numero_etudiant
            query = Q(username__iexact=username) | Q(email__iexact=username) | Q(etudiant_profile__numero_etudiant__iexact=username)
            
            # Si un rôle est spécifié, on filtre aussi par rôle
            if role:
                user_query = UserModel.objects.filter(query, type_utilisateur=role)
            else:
                user_query = UserModel.objects.filter(query)
                
            user = user_query.first()
            
            if not user:
                return None
                
        except Exception:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
