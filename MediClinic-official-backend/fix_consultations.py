"""
Temporary script to fix consultations table - run this with the FastAPI app
Add this to your main.py temporarily and run the server, then access /fix-consultations
"""

from fastapi import APIRouter
from sqlalchemy import text
from app.db import engine
import asyncio

fix_router = APIRouter()

@fix_router.get("/fix-consultations")
async def fix_consultations_table():
    """Create the correct consultations table"""
    try:
        async with engine.begin() as conn:
            # Drop old table if exists
            await conn.execute(text("DROP TABLE IF EXISTS consultations CASCADE"))
            
            # Create new table
            await conn.execute(text("""
                CREATE TABLE consultations (
                    id SERIAL PRIMARY KEY,
                    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                    
                    -- Basic Personal Information
                    name VARCHAR(255) NOT NULL,
                    age VARCHAR(50) NOT NULL,
                    sex VARCHAR(50),
                    weight VARCHAR(50),
                    height VARCHAR(50),
                    contact VARCHAR(255),
                    
                    -- Main Complaint
                    complaint TEXT NOT NULL,
                    
                    -- History of the problem
                    when_started VARCHAR(255),
                    how_often VARCHAR(255),
                    getting_better VARCHAR(255),
                    triggers VARCHAR(255),
                    makes_better VARCHAR(255),
                    
                    -- Current Medications
                    medications TEXT,
                    
                    -- Symptoms Checklist
                    fever BOOLEAN DEFAULT FALSE,
                    pain BOOLEAN DEFAULT FALSE,
                    nausea BOOLEAN DEFAULT FALSE,
                    cough BOOLEAN DEFAULT FALSE,
                    dizziness BOOLEAN DEFAULT FALSE,
                    fatigue BOOLEAN DEFAULT FALSE,
                    
                    -- Medical History
                    allergies TEXT,
                    chronic_conditions TEXT,
                    surgeries TEXT,
                    
                    -- Family Medical History
                    family_history TEXT,
                    
                    -- Consultation Details
                    diagnosis TEXT,
                    date TIMESTAMP NOT NULL,
                    doctor VARCHAR(255) NOT NULL,
                    
                    -- Timestamps
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE
                );
            """))
            
            # Create indexes
            await conn.execute(text("""
                CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
                CREATE INDEX idx_consultations_date ON consultations(date);
                CREATE INDEX idx_consultations_doctor ON consultations(doctor);
            """))
            
        return {"message": "Consultations table fixed successfully!"}
        
    except Exception as e:
        return {"error": f"Failed to fix consultations table: {str(e)}"}

# Add this temporary import to main.py:
# from fix_consultations import fix_router
# app.include_router(fix_router)
