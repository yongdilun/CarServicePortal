@echo off
echo Starting Portal Application...

REM Create the database
echo Creating database...
mysql -u root -pydl11222004 < create_database.sql

REM Start the Spring Boot backend
echo Starting Spring Boot backend...
start cmd /k "mvnw spring-boot:run"

REM Navigate to client directory and install dependencies
echo Installing frontend dependencies...
cd client
call npm install

REM Start the React frontend
echo Starting React frontend...
start cmd /k "npm run dev"

echo Portal application is starting. Please wait...
echo Backend will be available at http://localhost:8080
echo Frontend will be available at http://localhost:5173
