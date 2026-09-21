from rest_framework import serializers
from shops.models import MedicalShop
from accounts.serializers import UserSerializer

class MedicalShopSerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source='owner', read_only=True)
    available_medicines_count = serializers.SerializerMethodField()
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = MedicalShop
        fields = (
            'id', 'owner', 'owner_details', 'shop_name', 'license_number',
            'phone', 'email', 'address', 'area', 'city', 'state', 'pincode',
            'latitude', 'longitude', 'opening_time', 'closing_time',
            'description', 'shop_image', 'is_active', 'is_verified',
            'available_medicines_count', 'distance_km', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'owner', 'is_verified', 'created_at', 'updated_at')

    def get_available_medicines_count(self, obj):
        # Count available items in shop inventory
        return obj.inventory_items.filter(is_available=True, quantity__gt=0).count()

class MedicalShopAdminUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for Admin to update verification & status of shops.
    """
    class Meta:
        model = MedicalShop
        fields = ('is_verified', 'is_active')
