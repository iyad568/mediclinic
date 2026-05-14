"""
Quick Database Connection Test
Run this script to test if PostgreSQL is connected with the new credentials
"""

print("=== MediClinic Database Connection Test ===")
print()
print("Testing connection to PostgreSQL...")
print("Database: MediClinic")
print("User: mediclinic")
print("Password: iyad1212")
print("Host: localhost:5432")
print()

try:
    # Try to import the database module
    from app.db import engine, DATABASE_URL
    
    print(f"Database URL: {DATABASE_URL}")
    print("Database module imported successfully!")
    
    # Try to create a simple connection
    import asyncio
    
    async def test_connection():
        try:
            async with engine.begin() as conn:
                result = await conn.execute("SELECT version()")
                version = result.scalar()
                print(f"SUCCESS: Connected to PostgreSQL!")
                print(f"Version: {version}")
                return True
        except Exception as e:
            print(f"FAILED: Database connection error: {e}")
            return False
    
    # Run the test
    success = asyncio.run(test_connection())
    
    if success:
        print()
        print("=== CONNECTION SUCCESSFUL ===")
        print("Your database is ready to use!")
    else:
        print()
        print("=== CONNECTION FAILED ===")
        print("Please check:")
        print("1. PostgreSQL is running on localhost:5432")
        print("2. Database 'MediClinic' exists")
        print("3. User 'mediclinic' exists with password 'iyad1212'")
        print("4. User has proper permissions")

except ImportError as e:
    print(f"FAILED: Cannot import database module: {e}")
    print("Make sure you're in the correct directory and have the required packages installed")

except Exception as e:
    print(f"FAILED: Unexpected error: {e}")

print()
print("=== Test Complete ===")
