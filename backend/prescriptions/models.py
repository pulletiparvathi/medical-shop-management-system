from django.db import models
from django.conf import settings
from medicines.models import Medicine

class Prescription(models.Model):
    STATUS_CHOICES = [
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prescriptions'
    )
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="File size in bytes")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROCESSING')
    is_mock = models.BooleanField(default=True, help_text="True if processed via Mock/Demo OCR service")
    disclaimer = models.TextField(
        default="This tool extracts information from the uploaded prescription. "
                "It does not provide medical advice or replace a doctor's prescription. "
                "Please verify the extracted medicines, dosage, and instructions with a qualified healthcare professional."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription #{self.id} - {self.file_name} ({self.status})"


class PrescriptionMedicine(models.Model):
    VERIFICATION_CHOICES = [
        ('VERIFIED', 'Verified'),
        ('NEEDS_VERIFICATION', 'Needs Verification'),
        ('UNMATCHED', 'Unmatched'),
    ]

    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name='medicines'
    )
    extracted_name = models.CharField(max_length=255)
    normalized_name = models.CharField(max_length=255)
    strength = models.CharField(max_length=100, blank=True, default='')
    dosage_form = models.CharField(max_length=100, blank=True, default='')
    confidence = models.FloatField(default=0.90, help_text="Extraction/OCR confidence score (0.00 to 1.00)")
    verification_status = models.CharField(max_length=30, choices=VERIFICATION_CHOICES, default='NEEDS_VERIFICATION')
    matched_medicine = models.ForeignKey(
        Medicine,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prescription_matches'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.normalized_name} ({self.strength}) - {self.verification_status}"
