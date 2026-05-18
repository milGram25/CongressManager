from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserMeView,
    ParticipantsListView,
    ConstanciaUploadView, ConstanciaTemplateGenerateView, BulkConstanciaActionView,
    FacturaUploadView, BulkFacturaActionView,
    SolicitarFacturaView, MisFacturasView, MisConstanciasView,
    FacturasPendientesAdminView,
    UserActionHistoryView,
    AllUsersView, RoleAssignView, RoleRemoveView,
    EnviarCodigoVerificacionView, VerificarCodigoView,
)

app_name = 'users'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UserMeView.as_view(), name='me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('participants/', ParticipantsListView.as_view(), name='participants-list'),
    path('constancia/<int:id_persona>/upload/', ConstanciaUploadView.as_view(), name='constancia-upload'),
    path('constancia/<int:id_persona>/generate-template/', ConstanciaTemplateGenerateView.as_view(), name='constancia-generate-template'),
    path('constancia/bulk-action/', BulkConstanciaActionView.as_view(), name='constancia-bulk'),
    path('factura/<int:id_persona>/upload/', FacturaUploadView.as_view(), name='factura-upload'),
    path('factura/bulk-action/', BulkFacturaActionView.as_view(), name='factura-bulk'),
    path('facturas/solicitar/', SolicitarFacturaView.as_view(), name='factura-solicitar'),
    path('facturas/mis/', MisFacturasView.as_view(), name='facturas-mis'),
    path('constancias/mis/', MisConstanciasView.as_view(), name='constancias-mis'),
    path('facturas/pendientes/', FacturasPendientesAdminView.as_view(), name='facturas-pendientes-admin'),
    path('history/', UserActionHistoryView.as_view(), name='user-history'),
    path('all/', AllUsersView.as_view(), name='all-users'),
    path('<int:id_persona>/role/assign/', RoleAssignView.as_view(), name='role-assign'),
    path('<int:id_persona>/role/remove/', RoleRemoveView.as_view(), name='role-remove'),
    path('estudiante/validar/enviar-codigo/', EnviarCodigoVerificacionView.as_view(), name='enviar-codigo'),
    path('estudiante/validar/verificar-codigo/', VerificarCodigoView.as_view(), name='verificar-codigo'),
]
