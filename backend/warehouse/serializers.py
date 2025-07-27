from rest_framework import serializers
from .models import Tool, Material, ToolMovement, MaterialMovement

class ToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tool
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class ToolMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolMovement
        fields = '__all__'

class MaterialMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialMovement
        fields = '__all__'