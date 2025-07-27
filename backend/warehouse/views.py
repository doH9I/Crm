from django.shortcuts import render
from rest_framework import viewsets
from .models import Tool, Material, ToolMovement, MaterialMovement
from .serializers import ToolSerializer, MaterialSerializer, ToolMovementSerializer, MaterialMovementSerializer
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class ToolViewSet(viewsets.ModelViewSet):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated]

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]

class ToolMovementViewSet(viewsets.ModelViewSet):
    queryset = ToolMovement.objects.all()
    serializer_class = ToolMovementSerializer
    permission_classes = [IsAuthenticated]

class MaterialMovementViewSet(viewsets.ModelViewSet):
    queryset = MaterialMovement.objects.all()
    serializer_class = MaterialMovementSerializer
    permission_classes = [IsAuthenticated]
