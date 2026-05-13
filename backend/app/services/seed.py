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
    ("Customer 1", "Product arrived damaged and cannot be used", "Solved"),
    ("Customer 2", "Delivery was delayed and tracking has not updated", "Solved"),
    ("Customer 3", "Subscription was charged twice for the same billing period", "Solved"),
    ("Customer 4", "App is crashing during login and blocks access", "Solved"),
    ("Customer 5", "Refund has not been received after returning the item", "Solved"),
    ("Customer 6", "Wrong item was delivered and support has not replied", "Solved"),
    ("Customer 7", "Customer support is not responding to my open ticket", "Solved"),
    ("Customer 8", "Service request is still pending after the promised date", "Solved"),
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
            industry="Customer Operations",
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
                source="Portal",
                organization_id=user.organization_id,
                uploaded_by=user.id,
                assignee="Unassigned",
            )
        )
    db.commit()
