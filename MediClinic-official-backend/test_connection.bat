@echo off
echo === MediClinic Database Connection Test ===
echo.
echo This will start the FastAPI server which will test the database connection
echo.
echo Connection Details:
echo - Database: MediClinic
echo - User: mediclinic  
echo - Password: iyad1212
echo - Host: localhost:5432
echo.
echo Starting server...
echo.

REM Try to run the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

pause
