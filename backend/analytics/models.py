from django.db import models

# Create your models here.

class Report(models.Model):
    REPORT_TYPES = [
        ('project', 'Проект'),
        ('employee', 'Сотрудник'),
        ('warehouse', 'Склад'),
        ('custom', 'Произвольный'),
    ]
    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField()
    file = models.FileField(upload_to='reports/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.get_report_type_display()})"


class AuditLog(models.Model):
    ACTIONS = [
        ('create', 'Создание'),
        ('update', 'Изменение'),
        ('delete', 'Удаление'),
        ('login', 'Вход'),
        ('export', 'Экспорт'),
        ('import', 'Импорт'),
    ]
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTIONS)
    object_type = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100)
    object_repr = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    changes = models.JSONField(blank=True, null=True)
    extra = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} {self.get_action_display()} {self.object_type} {self.object_repr} ({self.timestamp})"


class Notification(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    level = models.CharField(max_length=20, default='info')  # info, warning, error, success
    link = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.user})"
