from django.shortcuts import render
from rest_framework import viewsets
from .models import Project, Estimate, WorkType
from .serializers import ProjectSerializer, EstimateSerializer, WorkTypeSerializer
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

class EstimateViewSet(viewsets.ModelViewSet):
    queryset = Estimate.objects.all()
    serializer_class = EstimateSerializer
    permission_classes = [IsAuthenticated]

class WorkTypeViewSet(viewsets.ModelViewSet):
    queryset = WorkType.objects.all()
    serializer_class = WorkTypeSerializer
    permission_classes = [IsAuthenticated]
