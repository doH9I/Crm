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
from analytics.utils import audit_log_action
from analytics.utils import create_notification

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        audit_log_action(self.request.user, 'create', instance)
        create_notification(self.request.user, 'Добавлен сотрудник', f'Пользователь {instance.username} добавлен', 'success', link=f'/users/{instance.id}')

    def perform_update(self, serializer):
        instance = serializer.save()
        audit_log_action(self.request.user, 'update', instance)

    def perform_destroy(self, instance):
        audit_log_action(self.request.user, 'delete', instance)
        create_notification(self.request.user, 'Удалён сотрудник', f'Пользователь {instance.username} удалён', 'warning', link='/users')
        instance.delete()

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
