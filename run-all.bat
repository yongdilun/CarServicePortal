@echo off
echo ===================================================
echo Starting Auto Service Portal (Backend and Frontend)
echo ===================================================

:: Start the backend in a new window
echo Starting the backend...
start cmd /k "%~dp0run-portal.bat"

:: Wait a moment for the backend to start
timeout /t 5

:: Start the frontend in a new window
echo Starting the frontend...
start cmd /k "%~dp0run-frontend.bat"

echo.
echo Both applications are starting in separate windows.
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Close the application windows when you're done.
echo ===================================================

exit
