from django.contrib import admin
from .models import Report
from .models import AuditLog

admin.site.register(Report)
admin.site.register(AuditLog)
