from rest_framework import serializers
from .models import Report
from .models import AuditLog

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = AuditLog
        fields = '__all__'