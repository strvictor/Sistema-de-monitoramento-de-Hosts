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
    path('list-hosts/', list_hosts, name='list_hosts'),
    path('delete-host/<int:host_id>', delete_host, name='delete_host'),
    path('update-host/<int:host_id>', update_host, name='update_host'),
    path('latency-loadtime<int:host_id>', latency_loadtime, name='latency-loadtime'),
    path('status-code/<int:host_id>', status_code, name='status-code'),
    path('settings/', user_settings, name='user_settings'),
    path('location-server/', get_location_server, name='get_location_server'),
    path('ssl-certificate/<int:host_id>', ssl_certificate_info, name='ssl_certificate_info'),
]