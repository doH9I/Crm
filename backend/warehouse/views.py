from django.shortcuts import render
from rest_framework import viewsets
from .models import Tool, Material, ToolMovement, MaterialMovement
from .serializers import ToolSerializer, MaterialSerializer, ToolMovementSerializer, MaterialMovementSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from django.core.files.uploadedfile import InMemoryUploadedFile

# Create your views here.

class ToolViewSet(viewsets.ModelViewSet):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated]

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='import_excel')
    def import_excel(self, request):
        file: InMemoryUploadedFile = request.FILES.get('file')
        if not file:
            return Response({'error': 'Файл не найден'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_excel(file)
            for _, row in df.iterrows():
                material, created = Material.objects.get_or_create(name=row.get('name'))
                material.quantity = row.get('quantity', 0)
                material.unit = row.get('unit', '')
                material.min_stock = row.get('min_stock', 0)
                material.save()
            return Response({'status': 'ok'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ToolMovementViewSet(viewsets.ModelViewSet):
    queryset = ToolMovement.objects.all()
    serializer_class = ToolMovementSerializer
    permission_classes = [IsAuthenticated]

class MaterialMovementViewSet(viewsets.ModelViewSet):
    queryset = MaterialMovement.objects.all()
    serializer_class = MaterialMovementSerializer
    permission_classes = [IsAuthenticated]
