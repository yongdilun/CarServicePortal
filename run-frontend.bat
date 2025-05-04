@echo off
echo ===================================================
echo Starting Auto Service Portal Frontend
echo ===================================================

:: Set the client directory - update this path if needed
set CLIENT_DIR=%~dp0client

:: Navigate to the client directory
cd %CLIENT_DIR%

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo NPM install failed. Please check the errors above.
        pause
        exit /b %ERRORLEVEL%
    )
)

:: Run the React application
echo Starting the React application...
echo.
echo You can access the frontend at http://localhost:5173
echo.
echo Press Ctrl+C to stop the application
echo ===================================================
echo.

:: Run the application
call npm run dev

:: If the application stops, pause to see any error messages
pause
