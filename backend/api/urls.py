from django.urls import path
from api.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('create-account/', create_account, name='create_account'),
    path('user-data/', get_user_data, name='get_user_data'),
    path('frequency-data/', frequency_data, name='frequency_data'),
    path('create-host/', create_host, name='create_host'),
    path('list-hosts/', list_hosts, name='create-host'),

]