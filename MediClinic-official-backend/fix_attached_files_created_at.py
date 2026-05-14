#!/usr/bin/env python3
"""
Migration script to fix attached_files.created_at column type from Date to DateTime
"""

import asyncio
from sqlalchemy import text
from app.db import engine

async def fix_created_at_column():
    """Fix the created_at column type in attached_files table"""
    
    async with engine.begin() as conn:
        try:
            # Check if column exists and its type
            result = await conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'attached_files' AND column_name = 'created_at'
            """))
            column_info = result.fetchone()
            
            if column_info:
                print(f"Current column info: {column_info}")
                
                if 'date' in column_info[1].lower():
                    print("Converting created_at from Date to DateTime...")
                    
                    # For PostgreSQL, we need to alter the column
                    await conn.execute(text("""
                        ALTER TABLE attached_files 
                        ALTER COLUMN created_at TYPE TIMESTAMP
                    """))
                    
                    await conn.commit()
                    print("Successfully converted created_at to TIMESTAMP")
                else:
                    print("created_at is already DateTime type")
            else:
                print("created_at column not found")
                
        except Exception as e:
            print(f"Error fixing column: {e}")
            await conn.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(fix_created_at_column())
