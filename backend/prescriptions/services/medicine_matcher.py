import re
from django.db.models import Q
from medicines.models import Medicine

class MedicineMatcherService:
    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Clean and normalize raw extracted medicine string.
        Strips extra whitespace, converts to lowercase, removes dosage patterns for base matching.
        """
        if not text:
            return ""
        cleaned = text.strip()
        cleaned = re.sub(r'[\(\)\[\]]', '', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned)
        return cleaned

    @classmethod
    def find_match(cls, raw_name: str, normalized_name: str = "") -> tuple[Medicine | None, str]:
        """
        Find a safe database match for an extracted medicine name.
        Returns tuple: (Medicine object or None, status: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'UNMATCHED')
        """
        query_str = cls.normalize_text(normalized_name or raw_name)
        if not query_str or len(query_str) < 3:
            return None, 'UNMATCHED'

        # Remove strength suffixes like 500mg, 10mg, 650mg for base name query
        base_name = re.sub(r'\b\d+\s*(mg|g|ml|mcg)\b', '', query_str, flags=re.IGNORECASE).strip()
        if not base_name:
            base_name = query_str

        # 1. Exact match on medicine_name, generic_name, or brand_name (case-insensitive)
        exact_match = Medicine.objects.filter(
            Q(medicine_name__iexact=query_str) |
            Q(generic_name__iexact=query_str) |
            Q(brand_name__iexact=query_str) |
            Q(medicine_name__iexact=base_name) |
            Q(generic_name__iexact=base_name) |
            Q(brand_name__iexact=base_name)
        ).first()

        if exact_match:
            return exact_match, 'VERIFIED'

        # 2. Contains match (prefix/icontains) if base_name is distinctive (> 3 chars)
        contains_match = Medicine.objects.filter(
            Q(medicine_name__icontains=base_name) |
            Q(generic_name__icontains=base_name) |
            Q(brand_name__icontains=base_name)
        ).first()

        if contains_match:
            return contains_match, 'NEEDS_VERIFICATION'

        return None, 'UNMATCHED'
