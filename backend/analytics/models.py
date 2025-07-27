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
