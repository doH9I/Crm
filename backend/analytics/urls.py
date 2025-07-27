from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, AuditLogViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'auditlog', AuditLogViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = router.urls