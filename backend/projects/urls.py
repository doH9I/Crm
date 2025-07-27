from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, EstimateViewSet, WorkTypeViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'estimates', EstimateViewSet)
router.register(r'worktypes', WorkTypeViewSet)

urlpatterns = router.urls