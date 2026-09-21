from abc import ABC, abstractmethod
import random

class BasePrescriptionScannerService(ABC):
    """
    Abstract interface for prescription OCR & AI extraction services.
    Real providers (Google Gemini Vision, Cloud Vision, AWS Textract, Azure Document Intelligence, OpenAI)
    can implement this interface without modifying frontend or endpoint logic.
    """
    @abstractmethod
    def scan(self, file_obj, filename="prescription.png"):
        """
        Extract medicine items from a prescription image or document file.
        Returns a list of dicts with keys:
        [
            {
                "extracted_name": "Paracetamol 500mg",
                "normalized_name": "Paracetamol",
                "strength": "500mg",
                "dosage_form": "Tablet",
                "confidence": 0.95,
                "needs_verification": False
            }
        ]
        """
        pass


class MockPrescriptionScanner(BasePrescriptionScannerService):
    """
    Mock/Demo OCR scanner for development & testing.
    Simulates Realistic extraction from doctor prescriptions.
    """
    DEMO_PRESETS = [
        [
            {"extracted_name": "Paracetamol 500mg", "normalized_name": "Paracetamol", "strength": "500mg", "dosage_form": "Tablet", "confidence": 0.95},
            {"extracted_name": "Cetirizine 10mg", "normalized_name": "Cetirizine", "strength": "10mg", "dosage_form": "Tablet", "confidence": 0.92},
            {"extracted_name": "Azithromycin 500mg", "normalized_name": "Azithromycin", "strength": "500mg", "dosage_form": "Tablet", "confidence": 0.88},
        ],
        [
            {"extracted_name": "Crocin 650", "normalized_name": "Crocin", "strength": "650mg", "dosage_form": "Tablet", "confidence": 0.96},
            {"extracted_name": "Amoxicillin 500mg", "normalized_name": "Amoxicillin", "strength": "500mg", "dosage_form": "Capsule", "confidence": 0.91},
            {"extracted_name": "Pantoprazole 40mg", "normalized_name": "Pantoprazole", "strength": "40mg", "dosage_form": "Tablet", "confidence": 0.89},
        ],
        [
            {"extracted_name": "Dolo 650mg", "normalized_name": "Dolo", "strength": "650mg", "dosage_form": "Tablet", "confidence": 0.97},
            {"extracted_name": "Montair LC", "normalized_name": "Montair", "strength": "10mg", "dosage_form": "Tablet", "confidence": 0.93},
            {"extracted_name": "Parac... 500mg", "normalized_name": "Paracetamol", "strength": "500mg", "dosage_form": "Tablet", "confidence": 0.68},
        ]
    ]

    def scan(self, file_obj, filename="prescription.png"):
        # Select a realistic preset based on filename or hash
        filename_lower = filename.lower()
        if "dolo" in filename_lower or "crocin" in filename_lower:
            preset = self.DEMO_PRESETS[1]
        elif "montair" in filename_lower or "unclear" in filename_lower:
            preset = self.DEMO_PRESETS[2]
        else:
            preset = self.DEMO_PRESETS[0]

        extracted_items = []
        for item in preset:
            extracted_items.append({
                "extracted_name": item["extracted_name"],
                "normalized_name": item["normalized_name"],
                "strength": item["strength"],
                "dosage_form": item["dosage_form"],
                "confidence": item["confidence"],
                "needs_verification": item["confidence"] < 0.85
            })

        return extracted_items


def get_prescription_scanner_service() -> BasePrescriptionScannerService:
    """
    Factory function returning the configured OCR scanner service instance.
    Defaults to MockPrescriptionScanner for local dev.
    """
    return MockPrescriptionScanner()
