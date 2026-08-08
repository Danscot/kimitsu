from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class EmailAuthBackend(ModelBackend):
    """
    Authenticate using email address instead of username.
    Inherits user_can_authenticate() from ModelBackend so inactive
    users are blocked automatically.
    """

    def authenticate(self, request, email=None, password=None, **kwargs):
        UserModel = get_user_model()

        if not email or not password:
            return None

        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            # Run the hasher anyway to mitigate timing attacks
            UserModel().set_password(password)
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None
