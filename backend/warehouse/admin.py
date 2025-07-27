from django.contrib import admin
from .models import Tool, Material, ToolMovement, MaterialMovement

admin.site.register(Tool)
admin.site.register(Material)
admin.site.register(ToolMovement)
admin.site.register(MaterialMovement)
