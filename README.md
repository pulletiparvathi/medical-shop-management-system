# Medical Shop Management & Medicine Inventory System

A production-style, full-stack **Medical Shop Management & Medicine Inventory Platform** built with **Django REST Framework (DRF)**, **PostgreSQL**, **JWT Authentication**, and a responsive **React** single-page application.

This platform empowers pharmacy owners to manage their shop profiles, track medicine inventories with stock thresholds and 30/60/90-day batch expiry warnings, and exposes high-performance location-aware REST APIs ready for integration with third-party applications like **MediFinder**.

---

## 🌟 Key Features

### 🔐 Authentication & Role-Based Authorization
- **JWT Authentication**: Access and refresh tokens via `rest_framework_simplejwt`.
- **Three User Roles**:
  - **ADMIN**: Platform administration, shop verification approvals/rejections, user management, and platform analytics.
  - **SHOP OWNER**: Registered medical shop profile management, medicine inventory CRUD, stock threshold alerts, and batch expiry tracking.
  - **CUSTOMER**: Real-time medicine search across pharmacies, stock availability verification, and location-based nearby shop discovery.

### 🏥 Medical Shop & Inventory Engine
- **Master Medicine Catalog**: Centralized database of medicines (Paracetamol, Dolo 650, Azithromycin, etc.). Shops reference master records to avoid duplicate data entry.
- **Auto Stock Status Rules**:
  - 🟢 **Available**: `quantity > minimum_stock_level` and `expiry_date >= today`.
  - 🟡 **Low Stock**: `0 < quantity <= minimum_stock_level`.
  - 🔴 **Out of Stock**: `quantity == 0` or `expiry_date < today`.
- **Batch Expiry Management**: Automatic detection and filtering of expired medicines, plus warning alerts for items expiring within 30, 60, or 90 days.

### 📍 Location & Nearby Shop System
- **Haversine Distance Calculator**: Computes exact distances in kilometers (`distance_km`) between client coordinates (`latitude`, `longitude`) and registered pharmacies.
- **MediFinder Compatible APIs**: Exposes `/api/search/medicines/` with structured JSON responses for seamless third-party aggregator integration.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.14+, Django 5.1, Django REST Framework 3.17, SimpleJWT, Django ORM
- **Database**: PostgreSQL 14+ (with automatic SQLite fallback for rapid local dev/testing)
- **Frontend**: React 18, Vite 5, JavaScript (ES6+), Bootstrap 5, Bootstrap Icons, Axios, React Router 6
- **Architecture**: Decoupled Full-Stack Architecture (`backend/`, `frontend/`, `database/`)

---

## 📁 Project Architecture

```
medical-shop-system/
├── backend/
│   ├── config/             # Django settings, root URLs, WSGI/ASGI, custom exception handler
│   ├── accounts/           # Custom User model, auth views, JWT serializers, permissions
│   ├── shops/              # MedicalShop model, shop approval, Haversine nearby calculator
│   ├── medicines/          # Master Medicine catalog model, serializers, views
│   ├── inventory/          # ShopMedicine inventory model, low stock & expiry endpoints
│   ├── api/                # API router aggregations & admin stats view
│   ├── manage.py
│   └── db.sqlite3          # Local SQLite DB (when USE_SQLITE=True)
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, StatCard, StatusBadge, ProtectedRoute, ConfirmModal
│   │   ├── pages/          # Customer, Shop Owner, and Admin pages
│   │   ├── services/       # Axios API client, authService, shopService, inventoryService
│   │   ├── context/        # AuthContext for state & JWT management
│   │   └── index.css       # Custom design system tokens & Bootstrap overrides
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql          # PostgreSQL DDL Schema documentation
│   └── seed_data.py        # Database seed script for test accounts, shops & medicines
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in `backend/` (or copy `.env.example`):

```env
# Django Configuration
SECRET_KEY=django-insecure-medical-shop-management-secret-key-2026
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration (Set USE_SQLITE=False for PostgreSQL)
USE_SQLITE=True
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=medical_shop_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432

# JWT Security
JWT_SECRET_KEY=medical-shop-jwt-secret-key-2026
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=120
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 🚀 Installation & Setup

### 1. Backend Setup

```bash
# Navigate to project root
cd medical-shop-system

# Run Django migrations
python backend/manage.py makemigrations accounts shops medicines inventory
python backend/manage.py migrate

# Seed database with sample accounts, 5 medical shops, 20 medicines, and 35+ inventory items
python database/seed_data.py

# Run Django unit tests
python backend/manage.py test accounts

# Start Django DRF development server (Port 8000)
python backend/manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite React development server (Port 5173)
npm run dev
```

---

## 🔑 Default Seed Credentials for Testing

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medicalshop.com` | `Admin@123` | Approve/Reject Shops, User Mgmt, Master Catalog |
| **Shop Owner 1** | `owner1@medicalshop.com` | `Owner@123` | Owns *Sri Sai Medicals* & *Apollo Pharmacy Kukatpally* |
| **Shop Owner 2** | `owner2@medicalshop.com` | `Owner@123` | Owns *MedPlus Pharmacy Miyapur* & *Care Pharmacy* |
| **Shop Owner 3** | `owner3@medicalshop.com` | `Owner@123` | Owns *Wellness Meds Madhapur* (Pending Approval) |
| **Customer** | `customer@example.com` | `Customer@123` | Medicine Search, Shop Directory, Nearby Finder |

---

## 📡 REST API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register Customer or Shop Owner | Public |
| `POST` | `/api/auth/login/` | Obtain JWT Access & Refresh Tokens | Public |
| `POST` | `/api/auth/refresh/` | Refresh JWT Access Token | Public |
| `GET/PUT`| `/api/auth/profile/` | Retrieve or Update Current Profile | Authenticated |

### Medical Shops & Location Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/` | List Verified Active Shops (or Owner/Admin filter) | Public |
| `POST` | `/api/shops/` | Register New Medical Shop | Shop Owner |
| `GET` | `/api/shops/{id}/` | Retrieve Medical Shop Profile | Public |
| `GET` | `/api/shops/nearby/?latitude=...&longitude=...` | Haversine Distance Search | Public |
| `GET` | `/api/shops/{id}/medicines/` | List Medicines Stocked by Shop | Public |
| `POST` | `/api/shops/{id}/approve/` | Approve Pending Shop Verification | Admin |
| `POST` | `/api/shops/{id}/reject/` | Reject Shop Verification | Admin |

### Inventory & MediFinder Search Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inventory/` | List Shop Inventory Records | Authenticated / Public |
| `POST` | `/api/inventory/` | Add Medicine Stock to Shop | Shop Owner / Admin |
| `GET` | `/api/inventory/dashboard_stats/` | Dashboard Counters & Valuation | Shop Owner / Admin |
| `GET` | `/api/inventory/low_stock/` | Retrieve Low Stock & Out of Stock Items | Shop Owner / Admin |
| `GET` | `/api/inventory/expiring/?days=30` | Batch Expiry Warnings (30/60/90 days) | Shop Owner / Admin |
| `GET` | `/api/search/medicines/?q=paracetamol&latitude=17.49&longitude=78.39` | **MediFinder** Structured Search | Public |

---

## 🌐 MediFinder Integration Specification

External applications (like **MediFinder**) can query the public endpoint:

`GET /api/search/medicines/?q=paracetamol&latitude=17.4938&longitude=78.3984`

**Sample JSON Response**:

```json
{
  "success": true,
  "message": "Found 1 matching medicine records for \"paracetamol\"",
  "data": [
    {
      "medicine_id": 1,
      "medicine_name": "Paracetamol",
      "generic_name": "Paracetamol",
      "brand_name": "Crocin Advance",
      "category": "Pain Relief",
      "dosage": "500mg",
      "dosage_form": "Tablet",
      "manufacturer": "GlaxoSmithKline",
      "prescription_required": false,
      "shops": [
        {
          "shop_id": 1,
          "shop_name": "Sri Sai Medicals",
          "phone": "040-23051122",
          "email": "srisai@medicalshop.com",
          "address": "Plot 42, Phase 1, KPHB Colony",
          "area": "KPHB",
          "city": "Hyderabad",
          "pincode": "500072",
          "latitude": 17.4938,
          "longitude": 78.3984,
          "opening_time": "08:00:00",
          "closing_time": "22:30:00",
          "quantity": 120,
          "price": 25.0,
          "batch_number": "BATCH-101",
          "expiry_date": "2027-06-30",
          "distance_km": 0.8
        }
      ]
    }
  ]
}
```

---

## 🧪 Running Automated Tests

Run backend Django unit tests to verify auth rules, inventory logic, Haversine calculator, and search endpoints:

```bash
python backend/manage.py test accounts
```
