from django.urls import path, include
from inventory.views import MediFinderMedicineSearchAPIView
from api.views import AdminPlatformStatsView, ShopMedicinesListView

urlpatterns = [
    path('auth/', include('accounts.urls')),
    path('shops/', include('shops.urls')),
    path('shops/<int:shop_id>/medicines/', ShopMedicinesListView.as_view(), name='shop_medicines_list'),
    path('medicines/', include('medicines.urls')),
    path('inventory/', include('inventory.urls')),
    path('prescriptions/', include('prescriptions.urls')),
    path('search/medicines/', MediFinderMedicineSearchAPIView.as_view(), name='medifinder_search_medicines'),
    path('admin/stats/', AdminPlatformStatsView.as_view(), name='admin_platform_stats'),
]
