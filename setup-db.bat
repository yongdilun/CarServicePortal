@echo off
echo ===================================================
echo Database Setup Script
echo ===================================================
echo This script will set up the database schema and essential data
echo.
echo WARNING: This will delete all existing data in the database!
echo.
set /p confirm=Are you sure you want to continue? (y/n):

if /i "%confirm%" neq "y" (
    echo Operation cancelled.
    goto :end
)

echo.
echo Setting up database...

REM Load environment variables from .env file
for /f "tokens=*" %%a in (.env) do (
    set "%%a"
)

REM Remove any comments (lines starting with #)
for /f "tokens=1,* delims==" %%a in ('set DB_') do (
    if "%%b" == "" (
        set "%%a="
    ) else (
        set "%%a=%%b"
    )
)

REM Set default values if not defined
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=3306
if not defined DB_NAME set DB_NAME=portal_db
if not defined DB_USERNAME set DB_USERNAME=root
if not defined DB_PASSWORD set DB_PASSWORD=

echo Database: %DB_NAME%
echo User: %DB_USERNAME%
echo Host: %DB_HOST%
echo Port: %DB_PORT%

REM Run the SQL script with SSL required
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USERNAME% -p%DB_PASSWORD% --ssl-mode=REQUIRED %DB_NAME% < src\main\resources\schema_complete.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Database setup completed successfully!
) else (
    echo.
    echo Error setting up database. Please check your MySQL connection.
)

echo ===================================================

:end
pause
