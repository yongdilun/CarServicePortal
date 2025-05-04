# Database Setup Guide

This guide explains how to set up the database for the Auto Service Portal application.

## Overview

The application uses a MySQL database with the following tables:

1. **CUSTOMER** - Stores customer information
2. **SERVICE** - Stores service types offered
3. **SERVICEOUTLET** - Stores service center locations
4. **STAFF** - Stores staff information
5. **TIME** - Stores time slots for appointments
6. **VEHICLE** - Stores customer vehicles
7. **NOTIFICATION** - Stores system notifications
8. **SERVICEAPPOINTMENT** - Stores service appointments

## Setup Instructions

### Prerequisites

- MySQL server installed and running
- MySQL client tools (mysql command-line client)
- Correct database credentials in `src/main/resources/application.yml`

### Option 1: Using the Setup Scripts

#### Windows

1. Run the `setup-db.bat` script:
   ```
   .\setup-db.bat
   ```

#### Linux/Mac

1. Make the script executable:
   ```
   chmod +x setup-db.sh
   ```
2. Run the script:
   ```
   ./setup-db.sh
   ```

### Option 2: Manual Setup

1. Connect to your MySQL server
2. Create the database if it doesn't exist:
   ```sql
   CREATE DATABASE IF NOT EXISTS portal_db;
   USE portal_db;
   ```
3. Run the SQL script:
   ```
   mysql -u<username> -p<password> portal_db < src/main/resources/schema_complete.sql
   ```

## What Gets Created

The setup script will:

1. Drop existing tables (if any)
2. Create all necessary tables with proper relationships
3. Insert essential system data:
   - Service outlets (3 locations)
   - Unassigned staff record (ID 9999)
   - Basic service types
   - Sample time slots

## Database Schema

### CUSTOMER
- `cust_id` - Primary key
- `cust_name` - Customer name
- `cust_phone` - Phone number
- `cust_email` - Email address
- `cust_address` - Physical address
- `cust_password` - Hashed password

### SERVICE
- `service_id` - Primary key
- `service_type` - Type of service
- `service_desc` - Description
- `service_category` - Category
- `service_price` - Price
- `service_duration` - Duration in minutes

### SERVICEOUTLET
- `outlet_id` - Primary key
- `outlet_name` - Name of outlet
- `outlet_address` - Address
- `outlet_city` - City
- `outlet_state` - State
- `outlet_postal_code` - Postal code

### STAFF
- `staff_id` - Primary key
- `staff_name` - Staff name
- `staff_role` - Role
- `staff_phone` - Phone number
- `staff_password` - Hashed password
- `outlet_id` - Foreign key to SERVICEOUTLET

### TIME
- `time_id` - Primary key
- `time_year` - Year
- `time_quarter` - Quarter
- `time_month` - Month
- `time_day` - Day
- `time_clocktime` - Time

### VEHICLE
- `veh_id` - Primary key
- `veh_plateno` - License plate
- `veh_model` - Model
- `veh_brand` - Brand
- `veh_type` - Type
- `veh_year` - Year
- `cust_id` - Foreign key to CUSTOMER

### NOTIFICATION
- `notification_id` - Primary key
- `user_id` - User ID
- `user_type` - User type (customer/staff)
- `title` - Notification title
- `message` - Notification message
- `type` - Notification type
- `is_read` - Read status
- `created_at` - Creation timestamp
- `link` - Optional link

### SERVICEAPPOINTMENT
- `appointment_id` - Primary key
- `cust_id` - Foreign key to CUSTOMER
- `service_id` - Foreign key to SERVICE
- `outlet_id` - Foreign key to SERVICEOUTLET
- `time_id` - Foreign key to TIME
- `veh_id` - Foreign key to VEHICLE
- `staff_id` - Foreign key to STAFF
- `appointment_cost` - Cost
- `appointment_duration` - Duration
- `appointment_status` - Status
- `estimated_finish_time` - Estimated finish time

## Troubleshooting

If you encounter any issues:

1. Make sure your MySQL server is running
2. Check that your database credentials in `application.yml` are correct
3. Ensure you have the necessary permissions to create/drop tables
4. Check for any error messages in the console output
