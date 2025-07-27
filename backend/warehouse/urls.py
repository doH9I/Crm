from rest_framework.routers import DefaultRouter
from .views import ToolViewSet, MaterialViewSet, ToolMovementViewSet, MaterialMovementViewSet

router = DefaultRouter()
router.register(r'tools', ToolViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'tool-movements', ToolMovementViewSet)
router.register(r'material-movements', MaterialMovementViewSet)

urlpatterns = router.urls