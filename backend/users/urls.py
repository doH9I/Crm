from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RoleViewSet, WorkTimeViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'worktimes', WorkTimeViewSet)

urlpatterns = router.urls