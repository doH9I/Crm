from .models import AuditLog
from django.contrib.contenttypes.models import ContentType
from .models import Notification

def audit_log_action(user, action, instance, changes=None, extra=None):
    AuditLog.objects.create(
        user=user if user and user.is_authenticated else None,
        action=action,
        object_type=instance.__class__.__name__,
        object_id=str(getattr(instance, 'id', '')),
        object_repr=str(instance),
        changes=changes,
        extra=extra,
    )

def create_notification(user, title, message, level='info', link=''):
    Notification.objects.create(user=user, title=title, message=message, level=level, link=link)