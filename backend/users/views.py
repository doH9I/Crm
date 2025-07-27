from django.shortcuts import render
from rest_framework import viewsets
from .models import User, Role, WorkTime
from .serializers import UserSerializer, RoleSerializer, WorkTimeSerializer
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

class WorkTimeViewSet(viewsets.ModelViewSet):
    queryset = WorkTime.objects.all()
    serializer_class = WorkTimeSerializer
    permission_classes = [IsAuthenticated]
