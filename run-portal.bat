@echo off
echo ===================================================
echo Starting Auto Service Portal Application
echo ===================================================

:: Set the project directory - update this path if needed
set PROJECT_DIR=%~dp0

:: Navigate to the project directory
cd %PROJECT_DIR%

:: Check if the target directory exists
if not exist "target" (
    echo Building the application with Maven...
    call mvnw clean package -DskipTests
    if %ERRORLEVEL% neq 0 (
        echo Maven build failed. Please check the errors above.
        pause
        exit /b %ERRORLEVEL%
    )
)

:: Run the Spring Boot application
echo Starting the Spring Boot application...
echo.
echo You can access the application at http://localhost:8080
echo.
echo Press Ctrl+C to stop the application
echo ===================================================
echo.

:: Run the application
call mvnw spring-boot:run

:: If the application stops, pause to see any error messages
pause
