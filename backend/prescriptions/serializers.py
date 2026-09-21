from rest_framework import serializers
from prescriptions.models import Prescription, PrescriptionMedicine
from medicines.serializers import MedicineSerializer

class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    matched_medicine_details = MedicineSerializer(source='matched_medicine', read_only=True)

    class Meta:
        model = PrescriptionMedicine
        fields = [
            'id', 'extracted_name', 'normalized_name', 'strength',
            'dosage_form', 'confidence', 'verification_status',
            'matched_medicine', 'matched_medicine_details', 'created_at'
        ]

class PrescriptionSerializer(serializers.ModelSerializer):
    medicines = PrescriptionMedicineSerializer(many=True, read_only=True)

    class Meta:
        model = Prescription
        fields = [
            'id', 'file_name', 'file_size', 'status',
            'is_mock', 'disclaimer', 'created_at', 'medicines'
        ]
