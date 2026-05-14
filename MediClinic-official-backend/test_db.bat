@echo off
echo Testing PostgreSQL Database Connection...
echo.
echo Connection Details:
echo Host: localhost:5432
echo Database: MediClinic
echo User: mediclinic
echo Password: iyad1212
echo.
echo To test this connection manually:
echo 1. Open pgAdmin or psql
echo 2. Connect with: postgresql://mediclinic:iyad1212@localhost:5432/MediClinic
echo 3. Run: SELECT version();
echo.
echo If connection fails, check:
echo - PostgreSQL service is running
echo - Database 'MediClinic' exists
echo - User 'mediclinic' has correct permissions
echo - Password is exactly 'iyad1212'
echo.
pause
