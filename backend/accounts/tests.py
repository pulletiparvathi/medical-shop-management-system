from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from accounts.models import User
from shops.models import MedicalShop
from medicines.models import Medicine
from inventory.models import ShopMedicine
from shops.utils import calculate_haversine_distance

class AccountsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')

    def test_user_registration_customer(self):
        payload = {
            'full_name': 'Test Customer',
            'email': 'customer@test.com',
            'phone': '9876543210',
            'password': 'Password@123',
            'confirm_password': 'Password@123',
            'role': 'CUSTOMER'
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(User.objects.filter(email='customer@test.com').count(), 1)

    def test_prevent_direct_admin_registration(self):
        payload = {
            'full_name': 'Hacker Admin',
            'email': 'hacker@test.com',
            'password': 'Password@123',
            'confirm_password': 'Password@123',
            'role': 'ADMIN'
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_user_jwt_login(self):
        User.objects.create_user(
            email='owner@test.com',
            password='Password@123',
            full_name='Shop Owner',
            role=User.Role.SHOP_OWNER
        )
        response = self.client.post(self.login_url, {'email': 'owner@test.com', 'password': 'Password@123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data['data'])
        self.assertIn('user', response.data['data'])


class MedicalShopAndInventoryTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin@test.com', 'Admin@123', full_name='Admin')
        self.owner = User.objects.create_user('owner@test.com', 'Owner@123', full_name='Owner', role=User.Role.SHOP_OWNER)
        self.customer = User.objects.create_user('cust@test.com', 'Cust@123', full_name='Customer', role=User.Role.CUSTOMER)

        # Login Owner
        res = self.client.post(reverse('auth_login'), {'email': 'owner@test.com', 'password': 'Owner@123'})
        self.owner_token = res.data['data']['access']

        # Login Admin
        res = self.client.post(reverse('auth_login'), {'email': 'admin@test.com', 'password': 'Admin@123'})
        self.admin_token = res.data['data']['access']

        # Create Verified Shop in Hyderabad KPHB (17.4938, 78.3984)
        self.shop = MedicalShop.objects.create(
            owner=self.owner,
            shop_name='Sri Sai Medicals Test',
            license_number='DL-TEST-001',
            phone='9876543210',
            email='srisai@test.com',
            address='KPHB Road 1',
            area='KPHB',
            city='Hyderabad',
            pincode='500072',
            latitude=17.4938,
            longitude=78.3984,
            is_verified=True,
            is_active=True
        )

        # Create Master Medicine
        self.medicine = Medicine.objects.create(
            medicine_name='Paracetamol Test',
            generic_name='Paracetamol',
            brand_name='Crocin Test',
            category='Pain Relief',
            dosage='500mg',
            dosage_form='Tablet',
            manufacturer='Test Pharma'
        )

    def test_haversine_distance_calculator(self):
        # KPHB (17.4938, 78.3984) to Kukatpally (17.4849, 78.4138)
        dist = calculate_haversine_distance(17.4938, 78.3984, 17.4849, 78.4138)
        self.assertIsNotNone(dist)
        self.assertLess(dist, 5.0)  # Should be around 1.9 km

    def test_inventory_auto_availability_and_stock_status(self):
        today = date.today()
        # Case 1: Available stock
        inv1 = ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=50,
            price=25.00,
            batch_number='BATCH-001',
            expiry_date=today + timedelta(days=100),
            minimum_stock_level=10
        )
        self.assertTrue(inv1.is_available)
        self.assertEqual(inv1.stock_status, 'IN_STOCK')

        # Case 2: Out of stock (quantity = 0)
        inv2 = ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=0,
            price=25.00,
            batch_number='BATCH-002',
            expiry_date=today + timedelta(days=100),
            minimum_stock_level=10
        )
        self.assertFalse(inv2.is_available)
        self.assertEqual(inv2.stock_status, 'OUT_OF_STOCK')

        # Case 3: Expired medicine
        inv3 = ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=50,
            price=25.00,
            batch_number='BATCH-003',
            expiry_date=today - timedelta(days=5),
            minimum_stock_level=10
        )
        self.assertFalse(inv3.is_available)
        self.assertTrue(inv3.is_expired)

    def test_medifinder_search_api(self):
        today = date.today()
        ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=120,
            price=25.00,
            batch_number='BATCH-MED-1',
            expiry_date=today + timedelta(days=180),
            minimum_stock_level=10
        )

        search_url = f"{reverse('medifinder_search_medicines')}?q=Paracetamol&latitude=17.49&longitude=78.39"
        response = self.client.get(search_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 1)
        med_res = response.data['data'][0]
        self.assertEqual(med_res['medicine_name'], 'Paracetamol Test')
        self.assertEqual(len(med_res['shops']), 1)
        self.assertEqual(med_res['shops'][0]['shop_name'], 'Sri Sai Medicals Test')
        self.assertEqual(med_res['shops'][0]['quantity'], 120)
        self.assertIsNotNone(med_res['shops'][0]['distance_km'])

    def test_nearby_shops_api(self):
        nearby_url = f"{reverse('shop-list')}nearby/?latitude=17.49&longitude=78.39&radius=10"
        response = self.client.get(nearby_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(len(response.data['data']), 1)

    def test_search_existing_medicine_case_insensitive(self):
        today = date.today()
        ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=50,
            price=25.00,
            batch_number='BATCH-01',
            expiry_date=today + timedelta(days=90)
        )
        url = f"{reverse('medifinder_search_medicines')}?name=PARACETAMOL"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreater(response.data['count'], 0)

    def test_search_nonexistent_medicine(self):
        url = f"{reverse('medifinder_search_medicines')}?name=NonExistentMedicine123"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 0)
        self.assertEqual(len(response.data['data']), 0)

    def test_search_by_pincode(self):
        today = date.today()
        ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=50,
            price=25.00,
            batch_number='BATCH-PIN-01',
            expiry_date=today + timedelta(days=90)
        )
        # Match pincode 500072
        url_match = f"{reverse('medifinder_search_medicines')}?medicine=paracetamol&pincode=500072"
        res_match = self.client.get(url_match)
        self.assertEqual(res_match.status_code, status.HTTP_200_OK)
        self.assertEqual(res_match.data['count'], 1)

        # Mismatch pincode 999999
        url_mismatch = f"{reverse('medifinder_search_medicines')}?medicine=paracetamol&pincode=999999"
        res_mismatch = self.client.get(url_mismatch)
        self.assertEqual(res_mismatch.status_code, status.HTTP_200_OK)
        self.assertEqual(res_mismatch.data['count'], 0)

    def test_suppress_out_of_stock_and_expired_in_public_search(self):
        today = date.today()
        # Expired batch
        ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=100,
            price=25.00,
            batch_number='BATCH-EXPIRED',
            expiry_date=today - timedelta(days=1)
        )
        # Out of stock batch
        ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=0,
            price=25.00,
            batch_number='BATCH-ZERO',
            expiry_date=today + timedelta(days=90)
        )
        url = f"{reverse('medifinder_search_medicines')}?q=Paracetamol"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Out of stock & expired should NOT be returned in available count
        self.assertEqual(response.data['count'], 0)

    def test_stock_status_logic(self):
        today = date.today()
        inv_in_stock = ShopMedicine(
            shop=self.shop, medicine=self.medicine, quantity=50, price=10.0,
            batch_number='B1', expiry_date=today + timedelta(days=30), minimum_stock_level=10
        )
        self.assertEqual(inv_in_stock.stock_status, 'IN_STOCK')

        inv_low_stock = ShopMedicine(
            shop=self.shop, medicine=self.medicine, quantity=5, price=10.0,
            batch_number='B2', expiry_date=today + timedelta(days=30), minimum_stock_level=10
        )
        self.assertEqual(inv_low_stock.stock_status, 'LOW_STOCK')

        inv_out_stock = ShopMedicine(
            shop=self.shop, medicine=self.medicine, quantity=0, price=10.0,
            batch_number='B3', expiry_date=today + timedelta(days=30), minimum_stock_level=10
        )
        self.assertEqual(inv_out_stock.stock_status, 'OUT_OF_STOCK')

        inv_expired = ShopMedicine(
            shop=self.shop, medicine=self.medicine, quantity=50, price=10.0,
            batch_number='B4', expiry_date=today - timedelta(days=1), minimum_stock_level=10
        )
        self.assertEqual(inv_expired.stock_status, 'EXPIRED')

    def test_authorization_inventory_modification(self):
        today = date.today()
        inv = ShopMedicine.objects.create(
            shop=self.shop,
            medicine=self.medicine,
            quantity=50,
            price=25.00,
            batch_number='BATCH-AUTH',
            expiry_date=today + timedelta(days=90)
        )
        inv_url = reverse('inventory-detail', kwargs={'pk': inv.pk})

        # 1. Anonymous user cannot update
        anon_res = self.client.patch(inv_url, {'quantity': 100})
        self.assertEqual(anon_res.status_code, status.HTTP_401_UNAUTHORIZED)

        # 2. Owner of this shop CAN update
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.owner_token}')
        owner_res = self.client.patch(inv_url, {'quantity': 75})
        self.assertEqual(owner_res.status_code, status.HTTP_200_OK)
        inv.refresh_from_db()
        self.assertEqual(inv.quantity, 75)

        # 3. Different shop owner CANNOT update another shop's inventory
        other_owner = User.objects.create_user('owner2@test.com', 'Owner2@123', full_name='Owner 2', role=User.Role.SHOP_OWNER)
        res_login2 = self.client.post(reverse('auth_login'), {'email': 'owner2@test.com', 'password': 'Owner2@123'})
        other_owner_token = res_login2.data['data']['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {other_owner_token}')
        other_res = self.client.patch(inv_url, {'quantity': 200})
        self.assertIn(other_res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

