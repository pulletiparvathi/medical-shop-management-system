from django.urls import path, include
from rest_framework.routers import DefaultRouter
from shops.views import MedicalShopViewSet

router = DefaultRouter()
router.register(r'', MedicalShopViewSet, basename='shop')

urlpatterns = [
    path('', include(router.urls)),
]
