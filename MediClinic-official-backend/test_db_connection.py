import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Database connection string
DATABASE_URL = "postgresql+asyncpg://mediclinic:iyad1212@localhost:5432/MediClinic"

async def test_database_connection():
    """Test if the database connection works"""
    print("Testing database connection...")
    print(f"Database URL: {DATABASE_URL}")
    
    try:
        # Create engine
        engine = create_async_engine(DATABASE_URL, echo=True)
        
        # Test connection
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print("Database connection successful!")
            print(f"PostgreSQL version: {version}")
            
            # Test if we can create a simple table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS test_connection (
                    id SERIAL PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Insert test data
            await conn.execute(text("""
                INSERT INTO test_connection (id) VALUES (1) 
                ON CONFLICT (id) DO NOTHING
            """))
            
            # Query test data
            result = await conn.execute(text("SELECT COUNT(*) FROM test_connection"))
            count = result.scalar()
            print(f"Test table has {count} records")
            
            # Clean up test table
            await conn.execute(text("DROP TABLE IF EXISTS test_connection"))
            print("Test table cleaned up successfully")
            
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("Please check:")
        print("1. PostgreSQL is running on localhost:5432")
        print("2. Database 'MediClinic' exists")
        print("3. User 'mediclinic' exists with password 'iyad1212'")
        print("4. User has proper permissions")
        
    finally:
        if 'engine' in locals():
            await engine.dispose()
            print("Database connection closed")

if __name__ == "__main__":
    asyncio.run(test_database_connection())
