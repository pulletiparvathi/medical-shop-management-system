from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from shops.models import MedicalShop
from shops.serializers import MedicalShopSerializer, MedicalShopAdminUpdateSerializer
from shops.utils import calculate_haversine_distance
from accounts.permissions import IsAdminUserRole, IsShopOwnerRole

class MedicalShopViewSet(viewsets.ModelViewSet):
    queryset = MedicalShop.objects.all()
    serializer_class = MedicalShopSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsShopOwnerRole()]
        elif self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['destroy', 'approve', 'reject', 'toggle_active']:
            return [permissions.IsAuthenticated(), IsAdminUserRole()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        queryset = MedicalShop.objects.all()

        # Admin sees all shops
        if user.is_authenticated and user.is_admin:
            status_param = self.request.query_params.get('status', None)
            if status_param == 'pending':
                queryset = queryset.filter(is_verified=False)
            elif status_param == 'verified':
                queryset = queryset.filter(is_verified=True)
            return queryset

        # Shop owner querying their own profile in dashboard
        if user.is_authenticated and user.is_shop_owner and self.request.query_params.get('my_shops') == 'true':
            return queryset.filter(owner=user)

        # Customers / Public default: only verified and active shops
        queryset = queryset.filter(is_verified=True, is_active=True)

        # Filtering options
        q = self.request.query_params.get('q', None)
        pincode = self.request.query_params.get('pincode', None)
        city = self.request.query_params.get('city', None)
        area = self.request.query_params.get('area', None)

        if q:
            q = q.strip()
            queryset = queryset.filter(
                Q(shop_name__icontains=q) |
                Q(area__icontains=q) |
                Q(city__icontains=q) |
                Q(pincode__icontains=q) |
                Q(address__icontains=q)
            )

        if pincode:
            pincode = pincode.strip()
            queryset = queryset.filter(pincode__icontains=pincode)

        if city:
            city = city.strip()
            queryset = queryset.filter(city__iexact=city)

        if area:
            area = area.strip()
            queryset = queryset.filter(area__icontains=area)

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, is_verified=False)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'message': 'Shops retrieved successfully',
            'data': serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'message': 'Shop details retrieved',
            'data': serializer.data
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def nearby(self, request):
        """
        API endpoint to find nearby verified medical shops based on latitude and longitude.
        GET /api/shops/nearby/?latitude=17.49&longitude=78.39&radius=20
        """
        lat = request.query_params.get('latitude', None)
        lon = request.query_params.get('longitude', None)
        radius_km = float(request.query_params.get('radius', 50))  # Default 50 km

        if lat is None or lon is None:
            return Response({
                'success': False,
                'message': 'Latitude and longitude parameters are required',
                'errors': {'latitude': ['Required'], 'longitude': ['Required']}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            client_lat = float(lat)
            client_lon = float(lon)
        except ValueError:
            return Response({
                'success': False,
                'message': 'Invalid latitude or longitude format',
                'errors': {'latitude': ['Must be float'], 'longitude': ['Must be float']}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get all active and verified shops
        shops = MedicalShop.objects.filter(is_verified=True, is_active=True)
        nearby_shops = []

        for shop in shops:
            dist = calculate_haversine_distance(client_lat, client_lon, shop.latitude, shop.longitude)
            if dist is not None and dist <= radius_km:
                shop_data = MedicalShopSerializer(shop).data
                shop_data['distance_km'] = dist
                nearby_shops.append(shop_data)

        # Sort shops by distance ascending
        nearby_shops.sort(key=lambda x: x['distance_km'])

        return Response({
            'success': True,
            'message': f'Found {len(nearby_shops)} nearby shops within {radius_km} km',
            'data': nearby_shops
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def approve(self, request, pk=None):
        shop = self.get_object()
        shop.is_verified = True
        shop.is_active = True
        shop.save()
        return Response({
            'success': True,
            'message': f'Shop "{shop.shop_name}" approved successfully',
            'data': MedicalShopSerializer(shop).data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def reject(self, request, pk=None):
        shop = self.get_object()
        shop.is_verified = False
        shop.save()
        return Response({
            'success': True,
            'message': f'Shop "{shop.shop_name}" verification rejected',
            'data': MedicalShopSerializer(shop).data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def toggle_active(self, request, pk=None):
        shop = self.get_object()
        shop.is_active = not shop.is_active
        shop.save()
        status_str = "activated" if shop.is_active else "disabled"
        return Response({
            'success': True,
            'message': f'Shop "{shop.shop_name}" {status_str} successfully',
            'data': MedicalShopSerializer(shop).data
        })
