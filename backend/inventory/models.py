from django.db import models
from django.utils import timezone
from datetime import date
from shops.models import MedicalShop
from medicines.models import Medicine

class ShopMedicine(models.Model):
    shop = models.ForeignKey(
        MedicalShop,
        on_delete=models.CASCADE,
        related_name='inventory_items'
    )
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name='shop_inventories'
    )
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField(db_index=True)
    minimum_stock_level = models.PositiveIntegerField(default=10)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['medicine__medicine_name', 'expiry_date']
        unique_together = ['shop', 'medicine', 'batch_number']
        indexes = [
            models.Index(fields=['quantity']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['is_available']),
        ]

    def save(self, *args, **kwargs):
        # Auto compute availability rule: quantity > 0 and expiry_date >= today
        today = date.today()
        if self.quantity <= 0 or (self.expiry_date and self.expiry_date < today):
            self.is_available = False
        else:
            self.is_available = True
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return self.expiry_date < date.today() if self.expiry_date else False

    @property
    def days_until_expiry(self):
        if not self.expiry_date:
            return 9999
        return (self.expiry_date - date.today()).days

    @property
    def stock_status(self):
        if self.is_expired:
            return 'EXPIRED'
        elif self.quantity == 0:
            return 'OUT_OF_STOCK'
        elif self.quantity <= self.minimum_stock_level:
            return 'LOW_STOCK'
        return 'IN_STOCK'

    def __str__(self):
        return f"{self.shop.shop_name} - {self.medicine.medicine_name} ({self.quantity} left) @ ₹{self.price}"
