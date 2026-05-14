import asyncio
import asyncpg
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:iyad1212@localhost:5432/mediclinic"

async def add_date_column():
    """Add date column to appointments table"""
    try:
        # Connect directly to PostgreSQL
        conn = await asyncpg.connect("postgresql://postgres:iyad1212@localhost:5432/mediclinic")
        
        # Check if column exists
        result = await conn.fetch("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'appointments' AND column_name = 'date'
        """)
        
        if not result:
            print("Adding date column to appointments table...")
            await conn.execute("""
                ALTER TABLE appointments 
                ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE
            """)
            print("✅ Successfully added date column to appointments table")
        else:
            print("✅ date column already exists in appointments table")
            
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(add_date_column())
