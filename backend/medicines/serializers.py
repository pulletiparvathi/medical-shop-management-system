from rest_framework import serializers
from medicines.models import Medicine

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = (
            'id', 'medicine_name', 'generic_name', 'brand_name',
            'category', 'dosage', 'dosage_form', 'manufacturer',
            'description', 'prescription_required', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
