"""
Standalone script to fix the consultations table
Run this directly with Python
"""
import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db import engine

async def fix_consultations_table():
    """Create the correct consultations table"""
    try:
        print("Connecting to database...")
        async with engine.begin() as conn:
            print("Dropping old consultations table if exists...")
            await conn.execute(text("DROP TABLE IF EXISTS consultations CASCADE"))
            
            print("Creating new consultations table...")
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
            
            print("Creating indexes...")
            await conn.execute(text("CREATE INDEX idx_consultations_patient_id ON consultations(patient_id)"))
            await conn.execute(text("CREATE INDEX idx_consultations_date ON consultations(date)"))
            await conn.execute(text("CREATE INDEX idx_consultations_doctor ON consultations(doctor)"))
            
        print("Consultations table fixed successfully!")
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Starting consultations table fix...")
    success = asyncio.run(fix_consultations_table())
    if success:
        print("Fix completed successfully!")
    else:
        print("Fix failed!")
