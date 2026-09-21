from django.db import models

class Medicine(models.Model):
    DOSAGE_FORMS = (
        ('Tablet', 'Tablet'),
        ('Capsule', 'Capsule'),
        ('Syrup', 'Syrup'),
        ('Injection', 'Injection'),
        ('Ointment', 'Ointment'),
        ('Drops', 'Drops'),
        ('Inhaler', 'Inhaler'),
        ('Powder', 'Powder'),
        ('Other', 'Other'),
    )

    medicine_name = models.CharField(max_length=200, db_index=True)
    generic_name = models.CharField(max_length=200, db_index=True)
    brand_name = models.CharField(max_length=200, db_index=True)
    category = models.CharField(max_length=100, db_index=True)
    dosage = models.CharField(max_length=50)  # e.g., 500mg, 10ml
    dosage_form = models.CharField(max_length=50, choices=DOSAGE_FORMS, default='Tablet')
    manufacturer = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    prescription_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['medicine_name']
        indexes = [
            models.Index(fields=['medicine_name']),
            models.Index(fields=['generic_name']),
            models.Index(fields=['brand_name']),
            models.Index(fields=['category']),
        ]
        unique_together = ['medicine_name', 'dosage', 'dosage_form']

    def __str__(self):
        return f"{self.medicine_name} ({self.brand_name}) - {self.dosage} {self.dosage_form}"
