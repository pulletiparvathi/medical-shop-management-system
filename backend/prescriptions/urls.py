from django.urls import path
from prescriptions.views import PrescriptionScanAPIView, PrescriptionDetailAPIView

urlpatterns = [
    path('scan/', PrescriptionScanAPIView.as_view(), name='prescription_scan'),
    path('<int:pk>/', PrescriptionDetailAPIView.as_view(), name='prescription_detail'),
]
