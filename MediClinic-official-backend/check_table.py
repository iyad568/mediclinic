"""
Script to check the actual structure of the consultations table
"""
import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db import engine

async def check_table_structure():
    """Check the actual structure of the consultations table"""
    try:
        print("Checking consultations table structure...")
        async with engine.begin() as conn:
            # Check if table exists
            result = await conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'consultations'
                );
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("Consultations table does not exist!")
                return
            
            print("Consultations table exists. Getting column information...")
            
            # Get column information
            result = await conn.execute(text("""
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default
                FROM information_schema.columns 
                WHERE table_name = 'consultations'
                ORDER BY ordinal_position;
            """))
            
            columns = result.fetchall()
            
            print(f"\nFound {len(columns)} columns in consultations table:")
            print("=" * 80)
            
            for column in columns:
                print(f"Column: {column[0]:<25} Type: {column[1]:<20} Nullable: {column[2]:<8} Default: {column[3] or 'None'}")
            
            print("=" * 80)
            
            # Check for specific columns we expect
            expected_columns = [
                'id', 'patient_id', 'name', 'age', 'sex', 'weight', 'height', 'contact',
                'complaint', 'when_started', 'how_often', 'getting_better', 'triggers', 'makes_better',
                'medications', 'fever', 'pain', 'nausea', 'cough', 'dizziness', 'fatigue',
                'allergies', 'chronic_conditions', 'surgeries', 'family_history',
                'diagnosis', 'date', 'doctor', 'created_at', 'updated_at'
            ]
            
            existing_columns = [col[0] for col in columns]
            
            print(f"\nExpected: {len(expected_columns)} columns")
            print(f"Actual:   {len(existing_columns)} columns")
            
            missing_columns = set(expected_columns) - set(existing_columns)
            extra_columns = set(existing_columns) - set(expected_columns)
            
            if missing_columns:
                print(f"\nMissing columns: {missing_columns}")
            
            if extra_columns:
                print(f"Extra columns: {extra_columns}")
            
            if not missing_columns and not extra_columns:
                print("\nPerfect! All expected columns are present.")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_table_structure())
