@echo off
echo ===================================================
echo Starting Auto Service Portal (Production Mode)
echo ===================================================
echo This will NOT initialize the database
echo.

echo Starting the backend with prod profile...
start cmd /k ".\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod"

echo.
echo Waiting for 5 seconds for the backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting the frontend...
cd client
start cmd /k "npm run dev"
cd ..

echo.
echo Both applications are starting in separate windows.
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Close the application windows when you're done.
echo ===================================================
