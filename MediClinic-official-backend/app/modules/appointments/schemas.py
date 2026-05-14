from pydantic import BaseModel
from typing import Optional
from datetime import date

class AppointmentCreate(BaseModel):
    patient_name: str
    phone_number: str
    date: date  # NEW: Add date field
    time: str
    type: str
    duration: int
    patient_id: Optional[int] = None
    payment_amount: Optional[float] = None


class Appointment(BaseModel):
    id: int
    patient_id: int
    date: date  # NEW: Add date field
    time: str
    duration: int
    type: str
    payment_amount: Optional[float] = None

    class Config:
        from_attributes = True