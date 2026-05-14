import asyncio
import asyncpg
from datetime import datetime

DATABASE_URL = "postgresql+asyncpg://postgres:iyad1212@localhost:5432/mediclinic"

async def test_date_fix():
    """Test the date comparison fix"""
    try:
        conn = await asyncpg.connect("postgresql://postgres:iyad1212@localhost:5432/mediclinic")
        
        # Test string to date conversion
        date_str = "2026-04-13"
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        print(f"=== DATE CONVERSION TEST ===")
        print(f"Input string: '{date_str}' (type: {type(date_str)})")
        print(f"Converted to: {date_obj} (type: {type(date_obj)})")
        
        # Test SQL query with proper date type
        result = await conn.fetch("""
            SELECT id, date, time, patient_id 
            FROM appointments 
            WHERE date = $1
        """, date_obj)
        
        print(f"\n=== SQL QUERY RESULT ===")
        print(f"Found {len(result)} appointments for {date_obj}")
        for row in result:
            print(f"ID: {row['id']}, Date: {row['date']}, Time: {row['time']}")
        
        await conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_date_fix())
