from django.db import models

# Create your models here.

class Tool(models.Model):
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=0)
    condition = models.CharField(max_length=100, default='Исправен')
    location = models.CharField(max_length=255, blank=True)
    last_check = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name

class Material(models.Model):
    name = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    min_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.name

class ToolMovement(models.Model):
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    from_location = models.CharField(max_length=255, blank=True)
    to_location = models.CharField(max_length=255, blank=True)
    user = models.CharField(max_length=255, blank=True)
    note = models.TextField(blank=True)

class MaterialMovement(models.Model):
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    movement_type = models.CharField(max_length=50)  # приход/расход
    project = models.CharField(max_length=255, blank=True)
    note = models.TextField(blank=True)
