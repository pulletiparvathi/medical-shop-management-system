from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from medicines.models import Medicine
from medicines.serializers import MedicineSerializer
from accounts.permissions import IsShopOwnerOrAdmin, IsAdminUserRole

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsShopOwnerOrAdmin()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUserRole()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Medicine.objects.all()
        q = self.request.query_params.get('q', None)
        if q:
            queryset = queryset.filter(
                Q(medicine_name__icontains=q) |
                Q(generic_name__icontains=q) |
                Q(brand_name__icontains=q) |
                Q(category__icontains=q)
            )

        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__iexact=category)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'message': 'Medicines master catalog retrieved',
            'data': serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'message': 'Medicine details retrieved',
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'success': True,
            'message': 'Medicine master record created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
