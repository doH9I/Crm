from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'auditlog', AuditLogViewSet)

urlpatterns = router.urls