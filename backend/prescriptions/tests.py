from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from medicines.models import Medicine
from shops.models import MedicalShop
from inventory.models import ShopMedicine
from accounts.models import User

class PrescriptionScannerTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.scan_url = reverse('prescription_scan')

        # Create master medicine
        self.medicine = Medicine.objects.create(
            medicine_name='Paracetamol 500mg',
            generic_name='Paracetamol',
            brand_name='Crocin',
            category='Pain Relief',
            dosage='500mg'
        )

        # Create shop and inventory
        self.owner = User.objects.create_user('rxowner@test.com', 'RxOwner@123', role=User.Role.SHOP_OWNER)
        self.shop = MedicalShop.objects.create(
            owner=self.owner,
            shop_name='Rx Test Pharmacy',
            license_number='DL-RX-01',
            phone='9876543210',
            address='KPHB Road 1',
            city='Hyderabad',
            pincode='500072',
            is_verified=True,
            is_active=True
        )

        ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=100,
            price=25.00,
            batch_number='RX-BATCH-01',
            expiry_date=date.today() + timedelta(days=90)
        )

    def test_prescription_scan_valid_image(self):
        fake_image = SimpleUploadedFile(
            "prescription.png",
            b"fake_image_content_binary",
            content_type="image/png"
        )
        response = self.client.post(self.scan_url, {'prescription_file': fake_image}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('prescription_id', response.data)
        self.assertTrue(response.data['is_mock_scan'])
        self.assertIn('disclaimer', response.data)
        self.assertGreater(len(response.data['medicines']), 0)

        # Verify matched medicine
        matched_items = [m for m in response.data['medicines'] if m['matched']]
        self.assertGreaterEqual(len(matched_items), 1)

    def test_prescription_scan_invalid_extension(self):
        fake_script = SimpleUploadedFile(
            "script.txt",
            b"text content",
            content_type="text/plain"
        )
        response = self.client.post(self.scan_url, {'prescription_file': fake_script}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_prescription_scan_oversized_file(self):
        # Create fake file larger than 5MB
        large_content = b"0" * (5 * 1024 * 1024 + 100)
        large_file = SimpleUploadedFile(
            "large_prescription.jpg",
            large_content,
            content_type="image/jpeg"
        )
        response = self.client.post(self.scan_url, {'prescription_file': large_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_safety_disclaimer_content(self):
        fake_image = SimpleUploadedFile(
            "prescription.jpg",
            b"fake_image_content",
            content_type="image/jpeg"
        )
        response = self.client.post(self.scan_url, {'prescription_file': fake_image}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        disclaimer = response.data['disclaimer']
        self.assertIn("does not provide medical advice", disclaimer)
        self.assertIn("replace a doctor's prescription", disclaimer)
