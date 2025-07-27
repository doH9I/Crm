from django.shortcuts import render
from rest_framework import viewsets
from .models import Report
from .serializers import ReportSerializer
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
