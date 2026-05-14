-- SQL script to fix the consultations table
-- Run this script in your PostgreSQL database

-- Drop the old consultations table if it exists
DROP TABLE IF EXISTS consultations CASCADE;

-- Create the new consultations table with correct schema
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

-- Create indexes for better performance
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_date ON consultations(date);
CREATE INDEX idx_consultations_doctor ON consultations(doctor);

-- Success message
SELECT 'Consultations table created successfully!' as result;
