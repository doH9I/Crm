from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, AuditLogViewSet, NotificationViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'auditlog', AuditLogViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = router.urls