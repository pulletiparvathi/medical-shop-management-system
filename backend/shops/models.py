from django.db import models
from django.conf import settings

class MedicalShop(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shops'
    )
    shop_name = models.CharField(max_length=200, db_index=True)
    license_number = models.CharField(max_length=100, unique=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    area = models.CharField(max_length=100, db_index=True)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, default='Telangana')
    pincode = models.CharField(max_length=10, db_index=True)
    latitude = models.FloatField(help_text="Latitude coordinate", default=17.4455)
    longitude = models.FloatField(help_text="Longitude coordinate", default=78.3846)
    opening_time = models.TimeField(default='08:00:00')
    closing_time = models.TimeField(default='22:00:00')
    description = models.TextField(blank=True, null=True)
    shop_image = models.URLField(blank=True, null=True, max_length=500)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)  # Requires admin approval
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['shop_name']),
            models.Index(fields=['city']),
            models.Index(fields=['pincode']),
            models.Index(fields=['is_active', 'is_verified']),
        ]

    def __str__(self):
        return f"{self.shop_name} - {self.city} ({'Verified' if self.is_verified else 'Pending'})"
