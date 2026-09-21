from rest_framework import serializers
from inventory.models import ShopMedicine
from shops.serializers import MedicalShopSerializer
from medicines.serializers import MedicineSerializer
from datetime import date

class ShopMedicineSerializer(serializers.ModelSerializer):
    shop_details = MedicalShopSerializer(source='shop', read_only=True)
    medicine_details = MedicineSerializer(source='medicine', read_only=True)
    stock_status = serializers.CharField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = ShopMedicine
        fields = (
            'id', 'shop', 'shop_details', 'medicine', 'medicine_details',
            'quantity', 'price', 'batch_number', 'expiry_date',
            'minimum_stock_level', 'is_available', 'stock_status',
            'days_until_expiry', 'is_expired', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'is_available', 'created_at', 'updated_at')

class ShopMedicineCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopMedicine
        fields = (
            'id', 'shop', 'medicine', 'quantity', 'price',
            'batch_number', 'expiry_date', 'minimum_stock_level'
        )

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
