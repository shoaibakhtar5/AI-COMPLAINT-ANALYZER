from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.uploads import BulkUploadDetail, BulkUploadOut
from app.services import uploads as service


router = APIRouter(prefix="/uploads", tags=["Bulk Uploads"])


@router.get("", response_model=list[BulkUploadOut])
def list_uploads(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.list_uploads(db, user)


@router.post("", response_model=BulkUploadOut, status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        stored_path = await service.save_upload_file(file)
        return service.process_upload(db, user, file.filename or stored_path.name, stored_path)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=422, detail=f"Upload could not be processed: {exc}") from exc


@router.get("/{upload_id}", response_model=BulkUploadDetail)
def get_upload(upload_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        return service.get_upload_detail(db, user, upload_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
