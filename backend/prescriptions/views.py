import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from datetime import date

from prescriptions.models import Prescription, PrescriptionMedicine
from prescriptions.serializers import PrescriptionSerializer, PrescriptionMedicineSerializer
from prescriptions.services.ocr_service import get_prescription_scanner_service
from prescriptions.services.medicine_matcher import MedicineMatcherService
from inventory.models import ShopMedicine
from shops.utils import calculate_haversine_distance

ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf']
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit

SAFETY_DISCLAIMER = (
    "This tool extracts information from the uploaded prescription. "
    "It does not provide medical advice or replace a doctor's prescription. "
    "Please verify the extracted medicines, dosage, and instructions with a qualified healthcare professional."
)


class PrescriptionScanAPIView(APIView):
    """
    POST /api/prescriptions/scan/
    Upload doctor prescription file (JPG, PNG, PDF max 5MB).
    Extracts medicine names via OCR service interface and matches against shop inventory database.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uploaded_file = request.FILES.get('prescription_file', None) or request.FILES.get('file', None)
        if not uploaded_file:
            return Response({
                'success': False,
                'message': 'No prescription file provided. Please upload a valid JPG, PNG, or PDF file.',
                'data': []
            }, status=status.HTTP_400_BAD_REQUEST)

        # File extension validation
        file_ext = os.path.splitext(uploaded_file.name)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            return Response({
                'success': False,
                'message': f'Invalid file type "{file_ext}". Allowed types: JPG, JPEG, PNG, PDF.',
                'data': []
            }, status=status.HTTP_400_BAD_REQUEST)

        # File size validation
        if uploaded_file.size > MAX_FILE_SIZE_BYTES:
            return Response({
                'success': False,
                'message': f'File size ({round(uploaded_file.size / (1024*1024), 2)} MB) exceeds the 5 MB limit.',
                'data': []
            }, status=status.HTTP_400_BAD_REQUEST)

        # 1. Create Prescription record
        user = request.user if request.user.is_authenticated else None
        prescription = Prescription.objects.create(
            user=user,
            file_name=uploaded_file.name,
            file_size=uploaded_file.size,
            status='PROCESSING',
            is_mock=True,
            disclaimer=SAFETY_DISCLAIMER
        )

        # 2. Run OCR Extraction Service
        scanner_service = get_prescription_scanner_service()
        try:
            raw_extracted_items = scanner_service.scan(uploaded_file, uploaded_file.name)
        except Exception as e:
            prescription.status = 'FAILED'
            prescription.save()
            return Response({
                'success': False,
                'message': f"Failed to process prescription image: {str(e)}",
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 3. Match extracted names with database and save PrescriptionMedicine records
        today = date.today()
        extracted_results = []
        all_matched_medicines = []

        for item in raw_extracted_items:
            extracted_name = item.get('extracted_name', '')
            normalized_name = item.get('normalized_name', '')
            strength = item.get('strength', '')
            dosage_form = item.get('dosage_form', '')
            confidence = item.get('confidence', 0.90)

            matched_med_obj, verification_status = MedicineMatcherService.find_match(
                raw_name=extracted_name,
                normalized_name=normalized_name
            )

            p_med = PrescriptionMedicine.objects.create(
                prescription=prescription,
                extracted_name=extracted_name,
                normalized_name=normalized_name,
                strength=strength,
                dosage_form=dosage_form,
                confidence=confidence,
                verification_status=verification_status,
                matched_medicine=matched_med_obj
            )

            # Query shop availability for this item
            available_shops = []
            if matched_med_obj:
                all_matched_medicines.append(matched_med_obj.id)
                shop_inventories = ShopMedicine.objects.filter(
                    medicine=matched_med_obj,
                    shop__is_verified=True,
                    shop__is_active=True,
                    is_available=True,
                    quantity__gt=0,
                    expiry_date__gte=today
                ).select_related('shop')

                for inv in shop_inventories:
                    available_shops.append({
                        'shop_id': inv.shop.id,
                        'shop_name': inv.shop.shop_name,
                        'pincode': inv.shop.pincode,
                        'area': inv.shop.area,
                        'city': inv.shop.city,
                        'phone': inv.shop.phone,
                        'available_quantity': inv.quantity,
                        'price': float(inv.price),
                        'stock_status': inv.stock_status
                    })

            extracted_results.append({
                'id': p_med.id,
                'extracted_name': p_med.extracted_name,
                'normalized_name': p_med.normalized_name,
                'strength': p_med.strength,
                'dosage_form': p_med.dosage_form,
                'confidence': p_med.confidence,
                'verification_status': p_med.verification_status,
                'matched': matched_med_obj is not None,
                'matched_medicine_id': matched_med_obj.id if matched_med_obj else None,
                'available_shops_count': len(available_shops),
                'available_shops': available_shops
            })

        # 4. Multi-medicine shop calculation (shops that carry multiple items from this prescription)
        shop_match_map = {}
        total_items = len(extracted_results)

        for res in extracted_results:
            for shop in res['available_shops']:
                s_id = shop['shop_id']
                if s_id not in shop_match_map:
                    shop_match_map[s_id] = {
                        'shop_id': s_id,
                        'shop_name': shop['shop_name'],
                        'pincode': shop['pincode'],
                        'area': shop['area'],
                        'city': shop['city'],
                        'phone': shop['phone'],
                        'matched_medicines': [],
                        'matched_count': 0
                    }
                shop_match_map[s_id]['matched_medicines'].append(res['normalized_name'])
                shop_match_map[s_id]['matched_count'] += 1

        multi_shop_list = list(shop_match_map.values())
        multi_shop_list.sort(key=lambda s: s['matched_count'], reverse=True)

        prescription.status = 'COMPLETED'
        prescription.save()

        return Response({
            'success': True,
            'message': 'Prescription scanned successfully',
            'prescription_id': f"RX-{prescription.id:05d}",
            'status': prescription.status,
            'is_mock_scan': prescription.is_mock,
            'disclaimer': SAFETY_DISCLAIMER,
            'medicines_count': len(extracted_results),
            'medicines': extracted_results,
            'multi_medicine_shops': multi_shop_list
        }, status=status.HTTP_200_OK)


class PrescriptionDetailAPIView(APIView):
    """
    GET /api/prescriptions/{id}/
    Retrieve prescription scan session details.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            prescription = Prescription.objects.prefetch_related('medicines__matched_medicine').get(pk=pk)
        except Prescription.DoesNotExist:
            return Response({
                'success': False,
                'message': f"Prescription with ID {pk} not found.",
                'data': []
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PrescriptionSerializer(prescription)
        return Response({
            'success': True,
            'message': 'Prescription details retrieved',
            'data': serializer.data
        })
