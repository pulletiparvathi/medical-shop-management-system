from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, F, Sum, FloatField, ExpressionWrapper
from datetime import date, timedelta
from inventory.models import ShopMedicine
from inventory.serializers import ShopMedicineSerializer, ShopMedicineCreateUpdateSerializer
from medicines.models import Medicine
from shops.models import MedicalShop
from shops.utils import calculate_haversine_distance
from accounts.permissions import IsShopOwnerRole, IsAdminUserRole, IsShopOwnerOrAdmin

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = ShopMedicine.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ShopMedicineCreateUpdateSerializer
        return ShopMedicineSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsShopOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        queryset = ShopMedicine.objects.select_related('shop', 'medicine').all()

        # Filter by shop ID if provided
        shop_id = self.request.query_params.get('shop_id', None)
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)

        # Shop owner filtering for their dashboard
        if user.is_authenticated and user.is_shop_owner and not user.is_admin:
            owner_shops = MedicalShop.objects.filter(owner=user).values_list('id', flat=True)
            queryset = queryset.filter(shop_id__in=owner_shops)

        # Customer default view: only verified, active shops & available stock
        if not user.is_authenticated or user.is_customer:
            queryset = queryset.filter(
                shop__is_verified=True,
                shop__is_active=True,
                is_available=True,
                quantity__gt=0,
                expiry_date__gte=date.today()
            )

        # Search filter
        q = self.request.query_params.get('q', None)
        if q:
            queryset = queryset.filter(
                Q(medicine__medicine_name__icontains=q) |
                Q(medicine__generic_name__icontains=q) |
                Q(medicine__brand_name__icontains=q) |
                Q(medicine__category__icontains=q) |
                Q(batch_number__icontains=q)
            )

        return queryset

    def perform_create(self, serializer):
        # Verify shop belongs to request.user if shop owner
        user = self.request.user
        shop = serializer.validated_data['shop']
        if user.is_shop_owner and not user.is_admin and shop.owner != user:
            raise permissions.PermissionDenied("You can only add inventory to your own registered shop.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        shop = serializer.instance.shop
        if user.is_shop_owner and not user.is_admin and shop.owner != user:
            raise permissions.PermissionDenied("You cannot modify another shop's inventory.")
        serializer.save()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'message': 'Inventory items retrieved',
            'data': serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'message': 'Inventory item details retrieved',
            'data': serializer.data
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsShopOwnerOrAdmin])
    def dashboard_stats(self, request):
        """
        Summary statistics for Shop Owner or Admin dashboard.
        """
        user = request.user
        queryset = ShopMedicine.objects.all()

        shop_id = request.query_params.get('shop_id', None)
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        elif user.is_shop_owner and not user.is_admin:
            owner_shops = MedicalShop.objects.filter(owner=user).values_list('id', flat=True)
            queryset = queryset.filter(shop_id__in=owner_shops)

        today = date.today()
        total_medicines = queryset.count()
        available_medicines = queryset.filter(quantity__gt=0, expiry_date__gte=today).count()
        low_stock = queryset.filter(quantity__gt=0, quantity__lte=F('minimum_stock_level'), expiry_date__gte=today).count()
        out_of_stock = queryset.filter(quantity=0).count()
        expired_medicines = queryset.filter(expiry_date__lt=today).count()

        # Calculate total inventory monetary value: sum(quantity * price)
        total_value = 0.0
        for item in queryset:
            total_value += float(item.quantity * item.price)

        return Response({
            'success': True,
            'message': 'Dashboard statistics calculated',
            'data': {
                'total_medicines': total_medicines,
                'available_medicines': available_medicines,
                'low_stock': low_stock,
                'out_of_stock': out_of_stock,
                'expired_medicines': expired_medicines,
                'total_inventory_value': round(total_value, 2)
            }
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsShopOwnerOrAdmin])
    def low_stock(self, request):
        """
        Retrieve low stock (quantity <= minimum_stock_level) & out of stock items.
        """
        user = request.user
        queryset = ShopMedicine.objects.select_related('shop', 'medicine').filter(
            quantity__lte=F('minimum_stock_level')
        )

        shop_id = request.query_params.get('shop_id', None)
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        elif user.is_shop_owner and not user.is_admin:
            owner_shops = MedicalShop.objects.filter(owner=user).values_list('id', flat=True)
            queryset = queryset.filter(shop_id__in=owner_shops)

        serializer = ShopMedicineSerializer(queryset, many=True)
        return Response({
            'success': True,
            'message': f'Found {queryset.count()} low stock or out-of-stock items',
            'data': serializer.data
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsShopOwnerOrAdmin])
    def expiring(self, request):
        """
        Retrieve medicines expiring within specified timeframe (30, 60, 90 days or expired).
        """
        user = request.user
        days_param = request.query_params.get('days', '30')
        queryset = ShopMedicine.objects.select_related('shop', 'medicine').all()

        shop_id = request.query_params.get('shop_id', None)
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        elif user.is_shop_owner and not user.is_admin:
            owner_shops = MedicalShop.objects.filter(owner=user).values_list('id', flat=True)
            queryset = queryset.filter(shop_id__in=owner_shops)

        today = date.today()
        if days_param == 'expired':
            queryset = queryset.filter(expiry_date__lt=today)
        else:
            try:
                days = int(days_param)
            except ValueError:
                days = 30
            target_date = today + timedelta(days=days)
            queryset = queryset.filter(expiry_date__gte=today, expiry_date__lte=target_date)

        serializer = ShopMedicineSerializer(queryset, many=True)
        return Response({
            'success': True,
            'message': f'Retrieved expiring medicines ({days_param} threshold)',
            'data': serializer.data
        })

class MediFinderMedicineSearchAPIView(APIView):
    """
    Public REST API endpoint designed for MediFinder integration and customer search.
    Supports query parameters:
    - name / medicine / q: medicine name, generic name, brand name, category, or area/pincode
    - pincode: 6-digit postal code filter
    - area: area / locality filter
    - city: city filter
    - latitude / lat: client latitude coordinate
    - longitude / lon / lng: client longitude coordinate
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Support flexible parameter naming for MediFinder integration
        query = (
            request.query_params.get('q', '') or
            request.query_params.get('medicine', '') or
            request.query_params.get('name', '')
        ).strip()

        pincode = request.query_params.get('pincode', '').strip()
        area = request.query_params.get('area', '').strip()
        city = request.query_params.get('city', '').strip()

        client_lat_raw = (
            request.query_params.get('latitude', None) or
            request.query_params.get('lat', None)
        )
        client_lon_raw = (
            request.query_params.get('longitude', None) or
            request.query_params.get('lon', None) or
            request.query_params.get('lng', None)
        )

        DEFAULT_LAT = 17.4938
        DEFAULT_LON = 78.3984

        try:
            client_lat = float(client_lat_raw) if client_lat_raw is not None else DEFAULT_LAT
            client_lon = float(client_lon_raw) if client_lon_raw is not None else DEFAULT_LON
        except (ValueError, TypeError):
            client_lat = DEFAULT_LAT
            client_lon = DEFAULT_LON

        today = date.today()

        # Query active, verified shops with available stock (>0) and valid non-expired batch
        inventories = ShopMedicine.objects.filter(
            shop__is_verified=True,
            shop__is_active=True,
            is_available=True,
            quantity__gt=0,
            expiry_date__gte=today
        ).select_related('medicine', 'shop')

        if query:
            inventories = inventories.filter(
                Q(medicine__medicine_name__icontains=query) |
                Q(medicine__generic_name__icontains=query) |
                Q(medicine__brand_name__icontains=query) |
                Q(medicine__category__icontains=query) |
                Q(shop__pincode__icontains=query) |
                Q(shop__area__icontains=query) |
                Q(shop__city__icontains=query) |
                Q(shop__shop_name__icontains=query)
            )

        if pincode:
            inventories = inventories.filter(shop__pincode__icontains=pincode)

        if area:
            inventories = inventories.filter(shop__area__icontains=area)

        if city:
            inventories = inventories.filter(shop__city__iexact=city)

        # Group inventories by medicine ID
        medicine_dict = {}
        flat_results = []

        for item in inventories:
            med = item.medicine
            shop = item.shop
            distance_km = calculate_haversine_distance(
                client_lat, client_lon, shop.latitude, shop.longitude
            )

            shop_info = {
                'shop_id': shop.id,
                'shop_name': shop.shop_name,
                'phone': shop.phone,
                'email': shop.email,
                'address': shop.address,
                'area': shop.area,
                'city': shop.city,
                'pincode': shop.pincode,
                'latitude': shop.latitude,
                'longitude': shop.longitude,
                'opening_time': shop.opening_time.strftime('%H:%M:%S'),
                'closing_time': shop.closing_time.strftime('%H:%M:%S'),
                'quantity': item.quantity,
                'price': float(item.price),
                'batch_number': item.batch_number,
                'expiry_date': item.expiry_date.strftime('%Y-%m-%d'),
                'distance_km': distance_km
            }

            flat_item = {
                'medicine_id': med.id,
                'medicine_name': med.medicine_name,
                'generic_name': med.generic_name,
                'brand_name': med.brand_name,
                'category': med.category,
                'dosage': med.dosage,
                'dosage_form': med.dosage_form,
                'manufacturer': med.manufacturer,
                'prescription_required': med.prescription_required,
                'price': float(item.price),
                'available_quantity': item.quantity,
                'in_stock': True,
                'stock_status': item.stock_status,
                'batch_number': item.batch_number,
                'expiry_date': item.expiry_date.strftime('%Y-%m-%d'),
                'shop': shop_info
            }
            flat_results.append(flat_item)

            if med.id not in medicine_dict:
                medicine_dict[med.id] = {
                    'medicine_id': med.id,
                    'medicine_name': med.medicine_name,
                    'generic_name': med.generic_name,
                    'brand_name': med.brand_name,
                    'category': med.category,
                    'dosage': med.dosage,
                    'dosage_form': med.dosage_form,
                    'manufacturer': med.manufacturer,
                    'prescription_required': med.prescription_required,
                    'shops': []
                }

            medicine_dict[med.id]['shops'].append(shop_info)

        grouped_data = list(medicine_dict.values())
        for med_data in grouped_data:
            med_data['shops'].sort(key=lambda s: (s['distance_km'] if s['distance_km'] is not None else 99999))

        flat_results.sort(key=lambda item: (item['shop']['distance_km'] if item['shop']['distance_km'] is not None else 99999))

        return Response({
            'success': True,
            'message': f'Found {len(grouped_data)} matching medicine records',
            'count': len(flat_results),
            'data': grouped_data,
            'results': flat_results
        })
