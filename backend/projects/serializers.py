from rest_framework import serializers
from .models import Project, Estimate, WorkType
from users.models import User
from users.serializers import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    manager = UserSerializer(read_only=True)
    manager_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='manager', write_only=True, required=False)

    class Meta:
        model = Project
        fields = ['id', 'name', 'customer', 'budget', 'start_date', 'end_date', 'status', 'description', 'manager', 'manager_id']

class EstimateSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), source='project', write_only=True)

    class Meta:
        model = Estimate
        fields = ['id', 'project', 'project_id', 'name', 'total', 'created_at']

class WorkTypeSerializer(serializers.ModelSerializer):
    estimate = EstimateSerializer(read_only=True)
    estimate_id = serializers.PrimaryKeyRelatedField(queryset=Estimate.objects.all(), source='estimate', write_only=True)
    assigned_to = UserSerializer(many=True, read_only=True)
    assigned_to_ids = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='assigned_to', write_only=True, many=True)

    class Meta:
        model = WorkType
        fields = ['id', 'estimate', 'estimate_id', 'name', 'description', 'cost', 'assigned_to', 'assigned_to_ids']