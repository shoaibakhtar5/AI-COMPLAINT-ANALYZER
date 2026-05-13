"""
Safely remove legacy banking demo records without deleting users or workspaces.

Run from the backend folder:
    python scripts/cleanup_legacy_banking_demo_data.py
    python scripts/cleanup_legacy_banking_demo_data.py --apply

The dry run is the default. Only complaints, upload summaries, and analytics
snapshots matching old banking demo categories/departments/text are targeted.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import SessionLocal  # noqa: E402
from app.models import AnalyticsSnapshot, BulkUpload, Complaint  # noqa: E402


LEGACY_CATEGORIES = {
    "ATM Issue",
    "Card Services",
    "Refund Delay",
    "Unauthorized Transaction",
    "App Login",
    "Support Delay",
    "KYC Delay",
    "Claim Processing",
    "Loan Servicing",
    "Funds Transfer",
    "Wallet Top-up",
    "Policy Renewal",
    "Card Delivery",
}

LEGACY_DEPARTMENTS = {
    "Digital Banking Operations",
    "Card Risk Review",
    "Payments Reconciliation",
    "Fraud Operations",
    "Mobile Platform Engineering",
    "Compliance Operations",
    "Loan Operations",
    "Card Fulfillment",
}

LEGACY_TEXT_MARKERS = (
    "atm",
    "credit card",
    "debit card",
    "loan",
    "kyc",
    "digital banking",
    "mobile banking",
    "unauthorized transaction",
    "account statement",
)


def _contains_legacy_text(value: object) -> bool:
    text = str(value or "").lower()
    return any(marker in text for marker in LEGACY_TEXT_MARKERS)


def _contains_legacy_json(value: object) -> bool:
    try:
        text = json.dumps(value or {}, default=str).lower()
    except TypeError:
        text = str(value or "").lower()
    return any(marker in text for marker in LEGACY_TEXT_MARKERS) or any(
        category.lower() in text for category in LEGACY_CATEGORIES
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Remove legacy banking demo complaints/uploads/analytics snapshots.")
    parser.add_argument("--apply", action="store_true", help="Actually delete matched records. Default is dry-run.")
    args = parser.parse_args()

    with SessionLocal() as db:
        complaints = [
            item
            for item in db.query(Complaint).all()
            if item.category in LEGACY_CATEGORIES
            or item.department in LEGACY_DEPARTMENTS
            or _contains_legacy_text(item.complaint_text)
            or _contains_legacy_text(item.ai_explanation)
        ]
        uploads = [item for item in db.query(BulkUpload).all() if _contains_legacy_json(item.analysis_summary)]
        snapshots = [
            item
            for item in db.query(AnalyticsSnapshot).all()
            if _contains_legacy_json(item.category_distribution) or _contains_legacy_json(item.sentiment_distribution)
        ]

        print("Legacy banking demo cleanup")
        print(f"Complaints matched: {len(complaints)}")
        print(f"Bulk uploads matched: {len(uploads)}")
        print(f"Analytics snapshots matched: {len(snapshots)}")

        if not args.apply:
            print("Dry run only. Re-run with --apply to delete matched records.")
            return 0

        for item in complaints:
            db.delete(item)
        for item in uploads:
            db.delete(item)
        for item in snapshots:
            db.delete(item)
        db.commit()
        print("Cleanup applied. User accounts and organizations were left untouched.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
