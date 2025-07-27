from django.db import models
from users.models import User

class Project(models.Model):
    name = models.CharField(max_length=255)
    customer = models.CharField(max_length=255)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default='В работе')
    description = models.TextField(blank=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_projects')

    def __str__(self):
        return self.name

class Estimate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='estimates')
    name = models.CharField(max_length=255)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.name} - {self.name}"

class WorkType(models.Model):
    estimate = models.ForeignKey(Estimate, on_delete=models.CASCADE, related_name='work_types')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    assigned_to = models.ManyToManyField(User, blank=True, related_name='work_types')

    def __str__(self):
        return self.name
