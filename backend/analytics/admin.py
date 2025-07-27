from django.contrib import admin
from .models import Report
from .models import AuditLog
from .models import Notification
from .models import Comment

admin.site.register(Report)
admin.site.register(AuditLog)
admin.site.register(Notification)
admin.site.register(Comment)
