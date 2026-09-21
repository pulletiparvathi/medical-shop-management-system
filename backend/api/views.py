from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, F
from datetime import date
from accounts.models import User
from accounts.permissions import IsAdminUserRole
from shops.models import MedicalShop
from medicines.models import Medicine
from inventory.models import ShopMedicine
from inventory.serializers import ShopMedicineSerializer

class AdminPlatformStatsView(APIView):
    """
    GET /api/admin/stats/
    Comprehensive platform statistics for Admin Dashboard.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        today = date.today()

        total_users = User.objects.count()
        users_by_role = {
            'admins': User.objects.filter(role=User.Role.ADMIN).count(),
            'shop_owners': User.objects.filter(role=User.Role.SHOP_OWNER).count(),
            'customers': User.objects.filter(role=User.Role.CUSTOMER).count(),
        }

        total_shops = MedicalShop.objects.count()
        verified_shops = MedicalShop.objects.filter(is_verified=True).count()
        pending_shops = MedicalShop.objects.filter(is_verified=False).count()
        disabled_shops = MedicalShop.objects.filter(is_active=False).count()

        total_medicines = Medicine.objects.count()
        total_inventory_items = ShopMedicine.objects.count()
        low_stock_items = ShopMedicine.objects.filter(quantity__gt=0, quantity__lte=F('minimum_stock_level')).count()
        out_of_stock_items = ShopMedicine.objects.filter(quantity=0).count()
        expired_items = ShopMedicine.objects.filter(expiry_date__lt=today).count()

        return Response({
            'success': True,
            'message': 'Admin stats retrieved successfully',
            'data': {
                'total_users': total_users,
                'users_by_role': users_by_role,
                'total_shops': total_shops,
                'verified_shops': verified_shops,
                'pending_shops': pending_shops,
                'disabled_shops': disabled_shops,
                'total_medicines': total_medicines,
                'total_inventory_items': total_inventory_items,
                'low_stock_items': low_stock_items,
                'out_of_stock_items': out_of_stock_items,
                'expired_items': expired_items,
            }
        })

class ShopMedicinesListView(APIView):
    """
    GET /api/shops/{shop_id}/medicines/
    Retrieve medicines stocked by a specific medical shop.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, shop_id):
        try:
            shop = MedicalShop.objects.get(pk=shop_id)
        except MedicalShop.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Shop not found',
                'errors': {'shop_id': ['Invalid shop ID']}
            }, status=status.HTTP_404_NOT_FOUND)

        queryset = ShopMedicine.objects.filter(shop=shop).select_related('medicine')
        
        # If non-owner/customer, show only available items
        user = request.user
        if not user.is_authenticated or (user.is_customer or (user.is_shop_owner and shop.owner != user and not user.is_admin)):
            queryset = queryset.filter(is_available=True, quantity__gt=0, expiry_date__gte=date.today())

        serializer = ShopMedicineSerializer(queryset, many=True)
        return Response({
            'success': True,
            'message': f'Medicines for shop "{shop.shop_name}" retrieved',
            'data': serializer.data
        })
