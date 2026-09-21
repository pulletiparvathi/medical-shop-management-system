# MediFinder Integration & REST API Contract

This document provides the complete API specification and contract for the **MediFinder** third-party application to connect to the **Medical Shop Management & Medicine Inventory Platform**.

---

## 🏛️ System Architecture Overview

```
                      MediFinder Application
                                │
                                │ REST API (HTTP/JSON)
                                ▼
                   Medical Shop Django REST API
                                │
                        Business Logic
                                │
                       PostgreSQL Database
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
  Sri Sai Medicals       Apollo Pharmacy        MedPlus Pharmacy
     (KPHB 500072)     (Kukatpally 500072)     (Miyapur 500049)
```

> **Important**: MediFinder must **never** connect directly to the PostgreSQL database. MediFinder communicates strictly through these public REST APIs.

---

## 📡 1. Main Search API Endpoint

### Request Specification

- **Endpoint**: `GET /api/search/medicines/`
- **Authentication**: `Public` (No Auth Token required)
- **Supported Query Parameters**:

| Parameter | Type | Required | Description / Example |
| :--- | :--- | :--- | :--- |
| `name` / `medicine` / `q` | `string` | Optional | Search by Medicine Name, Generic Name, Brand Name, or Category (e.g. `paracetamol`, `azithromycin`, `dolo`) |
| `pincode` | `string` | Optional | Filter shops matching 6-digit postal code (e.g. `500072`, `500049`) |
| `area` | `string` | Optional | Filter shops by locality/area (e.g. `KPHB`, `Kukatpally`, `Miyapur`) |
| `city` | `string` | Optional | Filter shops by city (e.g. `Hyderabad`) |
| `latitude` / `lat` | `float` | Optional | Client latitude for distance calculation (e.g. `17.4849`) |
| `longitude` / `lon` / `lng` | `float` | Optional | Client longitude for distance calculation (e.g. `78.4138`) |

---

### Sample API Requests

#### A. Search by Medicine Name
```http
GET /api/search/medicines/?medicine=paracetamol HTTP/1.1
Host: 127.0.0.1:8000
```

#### B. Search by Medicine Name & Pincode
```http
GET /api/search/medicines/?name=paracetamol&pincode=500072 HTTP/1.1
Host: 127.0.0.1:8000
```

#### C. Search by Location (Coordinates)
```http
GET /api/search/medicines/?medicine=azithromycin&latitude=17.4849&longitude=78.4138 HTTP/1.1
Host: 127.0.0.1:8000
```

---

### Standard JSON Response Payload

```json
{
  "success": true,
  "message": "Found 1 matching medicine records",
  "count": 2,
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
          "distance_km": 1.9
        }
      ]
    }
  ],
  "results": [
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
      "price": 25.0,
      "available_quantity": 120,
      "in_stock": true,
      "stock_status": "IN_STOCK",
      "batch_number": "BATCH-101",
      "expiry_date": "2027-06-30",
      "shop": {
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
        "distance_km": 1.9
      }
    }
  ]
}
```

---

## 🔒 2. Stock Rules & Batch Expiry Compliance

The Medical Shop API enforces strict inventory rules before returning stock to MediFinder:

1. **Available Stock**: Only items where `quantity > 0` AND `expiry_date >= today` AND `shop.is_verified == True` AND `shop.is_active == True` are returned.
2. **Expired Batch Suppression**: If `expiry_date < today`, the medicine is considered `EXPIRED` and is **never** exposed as available stock to MediFinder consumers.
3. **Stock Status Values**:
   - `IN_STOCK`: `quantity > minimum_stock_level` and unexpired.
   - `LOW_STOCK`: `0 < quantity <= minimum_stock_level` and unexpired.
   - `OUT_OF_STOCK`: `quantity == 0`.
   - `EXPIRED`: `expiry_date < today`.

---

## 🌐 3. CORS Configuration for MediFinder

In `backend/config/settings.py`:

```python
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173'
).split(',')
```

To connect MediFinder in development or production, add MediFinder's domain to `backend/.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://medifinder-app.com
```

---

## 🛑 4. HTTP Status Codes

| Code | Status | Meaning |
| :--- | :--- | :--- |
| `200` | OK | Request succeeded, matching medicines returned |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid parameter syntax |
| `401` | Unauthorized | Missing JWT authentication header for shop owner endpoints |
| `403` | Forbidden | Insufficient permissions (e.g. modifying another shop's inventory) |
| `404` | Not Found | Requested shop or medicine ID does not exist |
| `500` | Internal Error | Server-side exception |
