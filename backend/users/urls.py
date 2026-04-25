from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, UserMeView, ParticipantsListView, ConstanciaUploadView, FacturaUploadView, BulkConstanciaActionView, UserActionHistoryView

app_name = 'users'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UserMeView.as_view(), name='me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('participants/', ParticipantsListView.as_view(), name='participants-list'),
    path('constancia/<int:id_persona>/upload/', ConstanciaUploadView.as_view(), name='constancia-upload'),
    path('factura/<int:id_persona>/upload/', FacturaUploadView.as_view(), name='factura-upload'),
    path('constancia/bulk-action/', BulkConstanciaActionView.as_view(), name='constancia-bulk'),
    path('history/', UserActionHistoryView.as_view(), name='user-history'),
]
