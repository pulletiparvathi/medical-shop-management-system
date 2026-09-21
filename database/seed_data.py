import os
import sys
from pathlib import Path
from datetime import date, timedelta
import random

# Setup Django Environment
BASE_DIR = Path(__file__).resolve().parent.parent / 'backend'
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from accounts.models import User
from shops.models import MedicalShop
from medicines.models import Medicine
from inventory.models import ShopMedicine

def run_seed():
    print("[+] Starting database seeding...")

    # 1. Seed Users
    admin_user, created = User.objects.get_or_create(
        email='admin@medicalshop.com',
        defaults={
            'full_name': 'System Administrator',
            'phone': '9998887770',
            'role': User.Role.ADMIN,
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('Admin@123')
        admin_user.save()
        print(" -> Created Admin: admin@medicalshop.com / Admin@123")

    owners = []
    owner_data = [
        ('owner1@medicalshop.com', 'Srikanth Reddy', '9876543210', 'Owner@123'),
        ('owner2@medicalshop.com', 'Ananya Sharma', '9876543211', 'Owner@123'),
        ('owner3@medicalshop.com', 'Rajesh Verma', '9876543212', 'Owner@123'),
    ]

    for email, name, phone, pwd in owner_data:
        u, c = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': name,
                'phone': phone,
                'role': User.Role.SHOP_OWNER
            }
        )
        if c:
            u.set_password(pwd)
            u.save()
            print(f" -> Created Shop Owner: {email} / {pwd}")
        owners.append(u)

    cust_user, created = User.objects.get_or_create(
        email='customer@example.com',
        defaults={
            'full_name': 'Rahul Kumar',
            'phone': '9123456789',
            'role': User.Role.CUSTOMER
        }
    )
    if created:
        cust_user.set_password('Customer@123')
        cust_user.save()
        print(" -> Created Customer: customer@example.com / Customer@123")

    # 2. Seed Medical Shops (Hyderabad locations)
    shops_data = [
        {
            'owner': owners[0],
            'shop_name': 'Sri Sai Medicals',
            'license_number': 'DL-HYD-2024-001',
            'phone': '040-23051122',
            'email': 'srisai@medicalshop.com',
            'address': 'Plot 42, Phase 1, KPHB Colony',
            'area': 'KPHB',
            'city': 'Hyderabad',
            'state': 'Telangana',
            'pincode': '500072',
            'latitude': 17.4938,
            'longitude': 78.3984,
            'opening_time': '08:00:00',
            'closing_time': '22:30:00',
            'description': 'Trusted pharmacy with 24/7 emergency medicine availability.',
            'shop_image': 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500',
            'is_verified': True,
            'is_active': True,
        },
        {
            'owner': owners[0],
            'shop_name': 'Apollo Pharmacy Kukatpally',
            'license_number': 'DL-HYD-2024-002',
            'phone': '040-23052233',
            'email': 'kukatpally@apollopharmacy.com',
            'address': 'Main Road, Near Metro Pillar A75',
            'area': 'Kukatpally',
            'city': 'Hyderabad',
            'state': 'Telangana',
            'pincode': '500072',
            'latitude': 17.4849,
            'longitude': 78.4138,
            'opening_time': '07:30:00',
            'closing_time': '23:00:00',
            'description': 'Chain pharmacy with genuine medicines and health supplements.',
            'shop_image': 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=500',
            'is_verified': True,
            'is_active': True,
        },
        {
            'owner': owners[1],
            'shop_name': 'MedPlus Pharmacy Miyapur',
            'license_number': 'DL-HYD-2024-003',
            'phone': '040-23053344',
            'email': 'miyapur@medplusindia.com',
            'address': 'X Roads, Opposite Bus Depot',
            'area': 'Miyapur',
            'city': 'Hyderabad',
            'state': 'Telangana',
            'pincode': '500049',
            'latitude': 17.4969,
            'longitude': 78.3614,
            'opening_time': '08:00:00',
            'closing_time': '22:00:00',
            'description': 'Quality medicines at affordable discounts.',
            'shop_image': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500',
            'is_verified': True,
            'is_active': True,
        },
        {
            'owner': owners[1],
            'shop_name': 'Care Pharmacy Gachibowli',
            'license_number': 'DL-HYD-2024-004',
            'phone': '040-23054455',
            'email': 'caregachibowli@medicalshop.com',
            'address': 'DLF Cybercity Road, Gachibowli',
            'area': 'Gachibowli',
            'city': 'Hyderabad',
            'state': 'Telangana',
            'pincode': '500032',
            'latitude': 17.4435,
            'longitude': 78.3772,
            'opening_time': '08:00:00',
            'closing_time': '23:30:00',
            'description': 'Premium healthcare products, prescription medicines & surgical items.',
            'shop_image': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500',
            'is_verified': True,
            'is_active': True,
        },
        {
            'owner': owners[2],
            'shop_name': 'Wellness Meds Madhapur',
            'license_number': 'DL-HYD-2024-005',
            'phone': '040-23055566',
            'email': 'wellnessmadhapur@medicalshop.com',
            'address': '100 Feet Road, Ayyappa Society',
            'area': 'Madhapur',
            'city': 'Hyderabad',
            'state': 'Telangana',
            'pincode': '500081',
            'latitude': 17.4483,
            'longitude': 78.3915,
            'opening_time': '09:00:00',
            'closing_time': '21:30:00',
            'description': 'New medical shop undergoing registration validation.',
            'shop_image': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500',
            'is_verified': False,  # Pending approval testing
            'is_active': True,
        }
    ]

    shops = []
    for sd in shops_data:
        s, c = MedicalShop.objects.get_or_create(
            license_number=sd['license_number'],
            defaults=sd
        )
        if c:
            print(f" -> Created Medical Shop: {s.shop_name} ({s.area})")
        shops.append(s)

    # 3. Seed Master Medicines Catalog (20 Items)
    medicines_list = [
        ("Paracetamol", "Paracetamol", "Crocin Advance", "Pain Relief", "500mg", "Tablet", "GlaxoSmithKline", "Effective relief for fever and body pain.", False),
        ("Paracetamol 650", "Paracetamol", "Dolo 650", "Pain Relief", "650mg", "Tablet", "Micro Labs", "Antipyretic and analgesic tablet.", False),
        ("Azithromycin", "Azithromycin", "Azithral 500", "Antibiotics", "500mg", "Tablet", "Alembic Pharma", "Broad-spectrum antibiotic for bacterial infections.", True),
        ("Amoxicillin", "Amoxicillin", "Mox 500", "Antibiotics", "500mg", "Capsule", "Sun Pharma", "Penicillin-type antibiotic.", True),
        ("Cetirizine", "Cetirizine Hydrochloride", "Cetzine 10mg", "Antihistamine", "10mg", "Tablet", "Dr. Reddys", "Relief from allergic symptoms and sneezing.", False),
        ("Metformin", "Metformin Hydrochloride", "Glycomet 500", "Diabetes", "500mg", "Tablet", "USV Ltd", "Oral anti-diabetic medication.", True),
        ("Omeprazole", "Omeprazole", "Omez 20mg", "Gastrointestinal", "20mg", "Capsule", "Dr. Reddys", "Reduces stomach acid production.", False),
        ("Ibuprofen", "Ibuprofen", "Brufen 400", "Pain Relief", "400mg", "Tablet", "Abbott India", "Nonsteroidal anti-inflammatory drug (NSAID).", False),
        ("Atorvastatin", "Atorvastatin", "Atorva 10", "Cardiovascular", "10mg", "Tablet", "Zydus Cadila", "Lowers cholesterol levels.", True),
        ("Pantoprazole", "Pantoprazole", "Pan 40", "Gastrointestinal", "40mg", "Tablet", "Alkem Labs", "Treatment for acid reflux and peptic ulcers.", False),
        ("Montelukast", "Montelukast", "Montair LC", "Respiratory", "10mg", "Tablet", "Cipla", "Treatment for asthma and allergic rhinitis.", True),
        ("Amlodipine", "Amlodipine Besylate", "Stamlo 5", "Cardiovascular", "5mg", "Tablet", "Dr. Reddys", "Manages high blood pressure.", True),
        ("Vitamin C Chewable", "Ascorbic Acid", "Limcee", "Vitamins", "500mg", "Tablet", "Abbott", "Immunity booster chewable tablet.", False),
        ("Vitamin D3", "Cholecalciferol", "60K D3 Caps", "Vitamins", "60000IU", "Capsule", "Sun Pharma", "Bone strength supplement.", False),
        ("Cough Syrup", "Dextromethorphan + Chlorpheniramine", "Benadryl DR", "Cough & Cold", "100ml", "Syrup", "Johnson & Johnson", "Relief for dry cough.", False),
        ("Telmisartan", "Telmisartan", "Telma 40", "Cardiovascular", "40mg", "Tablet", "Glenmark", "Antihypertensive medication.", True),
        ("Ranitidine", "Ranitidine", "Rantac 150", "Gastrointestinal", "150mg", "Tablet", "JB Chemicals", "Acidity relief.", False),
        ("Dispirin", "Aspirin", "Dispirin", "Pain Relief", "325mg", "Tablet", "Reckitt Benckiser", "Fast soluble headache tablet.", False),
        ("Eye Drops", "Carboxymethylcellulose", "Refresh Tears", "Eye Care", "10ml", "Drops", "Allergan", "Lubricating dry eye drops.", False),
        ("Antiseptic Cream", "Chlorhexidine Gluconate", "BoroPlus", "Skin Care", "50g", "Ointment", "Emami", "Soothing skin repair ointment.", False),
    ]

    medicines = []
    for name, gen, brand, cat, dos, form, mfr, desc, rx in medicines_list:
        m, c = Medicine.objects.get_or_create(
            medicine_name=name,
            dosage=dos,
            dosage_form=form,
            defaults={
                'generic_name': gen,
                'brand_name': brand,
                'category': cat,
                'manufacturer': mfr,
                'description': desc,
                'prescription_required': rx,
            }
        )
        if c:
            print(f" -> Created Master Medicine: {m.medicine_name} ({m.brand_name})")
        medicines.append(m)

    # 4. Seed Shop Inventory Records (Connecting Shops & Medicines)
    today = date.today()
    batch_counter = 100

    print("[+] Creating inventory batches for shops...")
    active_shops = shops[:4]  # Active verified shops

    # Clear old inventory for fresh seed
    ShopMedicine.objects.all().delete()

    for med in medicines:
        # Guarantee every medicine is stocked in at least 2 active shops with good stock
        assigned_shops = random.sample(active_shops, random.randint(2, 4))
        for shop in assigned_shops:
            batch_counter += 1
            batch_no = f"BATCH-{batch_counter}"
            qty = random.randint(25, 250)
            price = round(random.uniform(15.0, 350.0), 2)
            exp_date = today + timedelta(days=random.randint(90, 500))

            ShopMedicine.objects.create(
                shop=shop,
                medicine=med,
                batch_number=batch_no,
                quantity=qty,
                price=price,
                expiry_date=exp_date,
                minimum_stock_level=10,
                is_available=True
            )

    print("[+] Database seeding completed successfully!")

if __name__ == '__main__':
    run_seed()
