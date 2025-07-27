from django.contrib import admin
from .models import Report
from .models import AuditLog
from .models import Notification

admin.site.register(Report)
admin.site.register(AuditLog)
admin.site.register(Notification)
