import asyncio
from sqlalchemy import text
from app.db import engine

async def add_amount_paid_column():
    """Add amount_paid column to patients table"""
    try:
        async with engine.begin() as conn:
            # Check if column exists
            result = await conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'patients' AND column_name = 'amount_paid'
            """))
            
            if result.fetchone():
                print("amount_paid column already exists")
                return
            
            # Add the column
            await conn.execute(text("""
                ALTER TABLE patients 
                ADD COLUMN amount_paid INTEGER
            """))
            
            print("Successfully added amount_paid column to patients table")
            
    except Exception as e:
        print(f"Error adding column: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(add_amount_paid_column())
