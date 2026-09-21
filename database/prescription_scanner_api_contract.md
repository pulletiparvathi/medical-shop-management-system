# AI Doctor Prescription Scanner API Contract

This document provides the API specifications for the **Prescription Scanner Module** designed to extract medicine information from prescription images/documents and match them against the **Medical Shop Management & Medicine Inventory** backend.

---

## Safety & Medical Compliance Requirement

> [!IMPORTANT]
> The Prescription Scanner is **strictly an information extraction and medicine availability lookup tool**.
> It does **NOT** provide medical diagnoses, generate prescriptions, or recommend treatments.
> 
> All API responses include the mandatory safety disclaimer:
> *"This tool extracts information from the uploaded prescription. It does not provide medical advice or replace a doctor's prescription. Please verify the extracted medicines, dosage, and instructions with a qualified healthcare professional."*

---

## 1. Scan Prescription Endpoint

### `POST /api/prescriptions/scan/`

Uploads a doctor prescription image or PDF document to extract medicines and check pharmacy availability.

* **Content-Type**: `multipart/form-data`
* **Authentication**: Optional (Supports both guest users and authenticated patients)
* **Allowed Extensions**: `.jpg`, `.jpeg`, `.png`, `.pdf`
* **Max File Size**: 5 MB (5,242,880 bytes)

#### Form Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `prescription_file` | File | Yes | Image or PDF document file of doctor's prescription |

#### Sample Request (`cURL`)

```bash
curl -X POST "http://127.0.0.1:8000/api/prescriptions/scan/" \
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>" \
  -F "prescription_file=@prescription_sample.jpg"
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "message": "Prescription scanned successfully",
  "prescription_id": "RX-00001",
  "status": "COMPLETED",
  "is_mock_scan": true,
  "disclaimer": "This tool extracts information from the uploaded prescription. It does not provide medical advice or replace a doctor's prescription. Please verify the extracted medicines, dosage, and instructions with a qualified healthcare professional.",
  "medicines_count": 3,
  "medicines": [
    {
      "id": 1,
      "extracted_name": "Paracetamol 500mg",
      "normalized_name": "Paracetamol",
      "strength": "500mg",
      "dosage_form": "Tablet",
      "confidence": 0.95,
      "verification_status": "VERIFIED",
      "matched": true,
      "matched_medicine_id": 1,
      "available_shops_count": 2,
      "available_shops": [
        {
          "shop_id": 1,
          "shop_name": "Sri Sai Medicals",
          "pincode": "500072",
          "area": "KPHB",
          "city": "Hyderabad",
          "phone": "9876543210",
          "available_quantity": 150,
          "price": 25.0,
          "stock_status": "IN_STOCK"
        }
      ]
    }
  ],
  "multi_medicine_shops": [
    {
      "shop_id": 1,
      "shop_name": "Sri Sai Medicals",
      "pincode": "500072",
      "area": "KPHB",
      "city": "Hyderabad",
      "phone": "9876543210",
      "matched_medicines": ["Paracetamol", "Cetirizine"],
      "matched_count": 2
    }
  ]
}
```

---

## 2. Retrieve Prescription Details

### `GET /api/prescriptions/{id}/`

Retrieves previously scanned prescription details by session ID.

```json
{
  "success": true,
  "message": "Prescription details retrieved",
  "data": {
    "id": 1,
    "file_name": "prescription_sample.jpg",
    "file_size": 245120,
    "status": "COMPLETED",
    "is_mock": true,
    "disclaimer": "This tool extracts information...",
    "created_at": "2026-09-20T14:30:00Z",
    "medicines": []
  }
}
```

---

## 3. Modular AI/OCR Provider Architecture

The OCR engine is designed around the `BasePrescriptionScannerService` abstract Python interface in `prescriptions/services/ocr_service.py`.

```python
class BasePrescriptionScannerService(ABC):
    @abstractmethod
    def scan(self, file_obj, filename: str) -> list[dict]:
        pass
```

### Swapping Mock for Production OCR/AI (e.g., Google Gemini / Cloud Vision)
To connect a real AI Vision provider in production:
1. Implement `GeminiVisionPrescriptionScanner(BasePrescriptionScannerService)` in `prescriptions/services/ocr_service.py`.
2. Update `get_prescription_scanner_service()` to return `GeminiVisionPrescriptionScanner()` when `USE_REAL_OCR=True`.
3. **Zero frontend or API route changes required**.
