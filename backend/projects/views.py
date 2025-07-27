from django.shortcuts import render
from rest_framework import viewsets
from .models import Project, Estimate, WorkType
from .serializers import ProjectSerializer, EstimateSerializer, WorkTypeSerializer
from rest_framework.permissions import IsAuthenticated
from analytics.utils import audit_log_action

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        audit_log_action(self.request.user, 'create', instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        audit_log_action(self.request.user, 'update', instance)

    def perform_destroy(self, instance):
        audit_log_action(self.request.user, 'delete', instance)
        instance.delete()

class EstimateViewSet(viewsets.ModelViewSet):
    queryset = Estimate.objects.all()
    serializer_class = EstimateSerializer
    permission_classes = [IsAuthenticated]

class WorkTypeViewSet(viewsets.ModelViewSet):
    queryset = WorkType.objects.all()
    serializer_class = WorkTypeSerializer
    permission_classes = [IsAuthenticated]
