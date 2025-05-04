#!/bin/bash

echo "==================================================="
echo "Database Setup Script"
echo "==================================================="
echo "This script will set up the database schema and essential data"
echo ""
echo "WARNING: This will delete all existing data in the database!"
echo ""
read -p "Are you sure you want to continue? (y/n): " confirm

if [[ $confirm != [yY] ]]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "Setting up database..."

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Set default values if not defined
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-portal_db}
DB_USERNAME=${DB_USERNAME:-root}
DB_PASSWORD=${DB_PASSWORD:-}

echo "Database: $DB_NAME"
echo "User: $DB_USERNAME"

# Run the SQL script
mysql -u$DB_USERNAME -p$DB_PASSWORD $DB_NAME < src/main/resources/schema_complete.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "Database setup completed successfully!"
else
    echo ""
    echo "Error setting up database. Please check your MySQL connection."
fi

echo "==================================================="

read -p "Press Enter to continue..."
