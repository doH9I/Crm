from django.shortcuts import render
from rest_framework import viewsets
from .models import User, Role, WorkTime
from .serializers import UserSerializer, RoleSerializer, WorkTimeSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from django.core.files.uploadedfile import InMemoryUploadedFile

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='import_excel')
    def import_excel(self, request):
        file: InMemoryUploadedFile = request.FILES.get('file')
        if not file:
            return Response({'error': 'Файл не найден'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_excel(file)
            for _, row in df.iterrows():
                user, created = User.objects.get_or_create(username=row.get('username'))
                user.first_name = row.get('first_name', '')
                user.last_name = row.get('last_name', '')
                user.email = row.get('email', '')
                user.salary = row.get('salary', 0)
                user.phone = row.get('phone', '')
                user.save()
            return Response({'status': 'ok'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

class WorkTimeViewSet(viewsets.ModelViewSet):
    queryset = WorkTime.objects.all()
    serializer_class = WorkTimeSerializer
    permission_classes = [IsAuthenticated]
