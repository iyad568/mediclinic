"""
Script to create/update the consultations table with the correct schema
"""
import asyncio
from sqlalchemy import text
from app.db import engine

async def create_consultations_table():
    """Create the consultations table with the correct schema"""
    async with engine.begin() as conn:
        try:
            # Drop the old consultations table if it exists with wrong structure
            print("Checking if old consultations table exists...")
            result = await conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'consultations'
                );
            """))
            table_exists = result.scalar()
            
            if table_exists:
                print("Old consultations table found, dropping it...")
                await conn.execute(text("DROP TABLE IF EXISTS consultations CASCADE"))
                print("Old table dropped successfully")
            
            # Create the new consultations table with correct schema
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
            
            # Create indexes for better performance
            print("Creating indexes...")
            await conn.execute(text("""
                CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
                CREATE INDEX idx_consultations_date ON consultations(date);
                CREATE INDEX idx_consultations_doctor ON consultations(doctor);
            """))
            
            print("Consultations table created successfully!")
            
        except Exception as e:
            print(f"Error creating consultations table: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(create_consultations_table())
