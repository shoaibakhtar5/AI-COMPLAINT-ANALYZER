from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.predict import predict_complaint
from app.models import Complaint, User
from app.schemas.auth import SignupRequest
from app.services.auth import create_workspace


DEMO_EMAIL = "owner@example.com"
DEMO_PASSWORD = "Admin123"
DEMO_SECRET = "SAMPLE-SECURE-2026"


DEMO_COMPLAINTS = [
    ("Customer 1", "my ATM is not working", "Pending"),
    ("Customer 2", "ATM deducted money but no cash was dispensed from the machine", "Pending"),
    ("Customer 3", "My credit card was charged twice for the same transaction", "In Progress"),
    ("Customer 4", "The banking app login is failing before payment confirmation", "Escalated"),
    ("Customer 5", "Refund for a failed airline booking has not arrived after two weeks", "Pending"),
    ("Customer 6", "Unauthorized transaction report shows a critical debit from my account", "In Progress"),
    ("Customer 7", "Support has not replied to my billing dispute emails", "Pending"),
    ("Customer 8", "Loan application status disappeared from the portal", "Resolved"),
]


def seed_demo_data(db: Session) -> None:
    if db.scalar(select(User).where(User.email == DEMO_EMAIL)):
        return

    user = create_workspace(
        db,
        SignupRequest(
            owner_name="Workspace Owner",
            company_name="Sample Workspace",
            business_email=DEMO_EMAIL,
            password=DEMO_PASSWORD,
            industry="Financial Services",
            monthly_volume="1,000 - 5,000 complaints / month",
            secret_key=DEMO_SECRET,
            role="Operations Admin",
        ),
    )

    for customer, text, status in DEMO_COMPLAINTS:
        prediction = predict_complaint(text)
        db.add(
            Complaint(
                complaint_text=text,
                customer_name=customer,
                customer_email=f"{customer.lower().replace(' ', '.')}@example.com",
                category=prediction["category"],
                sentiment=prediction["sentiment"],
                priority=prediction["priority"],
                confidence_score=float(prediction["confidence"]),
                ai_explanation=prediction["explanation"],
                status=status,
                department=prediction["department"],
                source="Admin Upload" if customer == "shoab" else "Portal",
                organization_id=user.organization_id,
                uploaded_by=user.id,
                assignee="Unassigned",
            )
        )
    db.commit()
