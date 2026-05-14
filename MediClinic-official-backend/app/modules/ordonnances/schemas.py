from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class OrdonnanceBase(BaseModel):
    content: str
    doctor: str
    date: datetime

class OrdonnanceCreate(OrdonnanceBase):
    patient_id: int

class OrdonnanceUpdate(BaseModel):
    content: Optional[str] = None
    doctor: Optional[str] = None
    date: Optional[datetime] = None

class OrdonnanceResponse(BaseModel):
    id: int
    patient_id: int
    content: str
    doctor: str
    date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
