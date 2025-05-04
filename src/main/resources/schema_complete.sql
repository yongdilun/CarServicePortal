-- Auto-generated schema and data export
-- Generated on: 2025-05-04

-- Drop tables if they exist (in reverse order to avoid foreign key constraints)
DROP TABLE IF EXISTS SERVICEAPPOINTMENT;
DROP TABLE IF EXISTS NOTIFICATION;
DROP TABLE IF EXISTS VEHICLE;
DROP TABLE IF EXISTS TIME;
DROP TABLE IF EXISTS STAFF;
DROP TABLE IF EXISTS SERVICEOUTLET;
DROP TABLE IF EXISTS SERVICE;
DROP TABLE IF EXISTS CUSTOMER;

-- Create tables
-- CUSTOMER table
CREATE TABLE IF NOT EXISTS CUSTOMER (
    cust_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    cust_name VARCHAR(100) NOT NULL UNIQUE,
    cust_phone VARCHAR(15) NOT NULL,
    cust_email VARCHAR(100) NOT NULL UNIQUE,
    cust_address VARCHAR(255) NOT NULL,
    cust_password VARCHAR(255) NOT NULL
);

-- SERVICE table
CREATE TABLE IF NOT EXISTS SERVICE (
    service_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    service_type VARCHAR(50) NOT NULL,
    service_desc VARCHAR(255) NOT NULL,
    service_category VARCHAR(50) NOT NULL,
    service_price DOUBLE DEFAULT 0.0,
    service_duration INTEGER DEFAULT 60
);

-- SERVICEOUTLET table
CREATE TABLE IF NOT EXISTS SERVICEOUTLET (
    outlet_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    outlet_name VARCHAR(100) NOT NULL,
    outlet_address VARCHAR(255) NOT NULL,
    outlet_city VARCHAR(50) NOT NULL,
    outlet_state VARCHAR(50) NOT NULL,
    outlet_postal_code VARCHAR(10) NOT NULL
);

-- STAFF table
CREATE TABLE IF NOT EXISTS STAFF (
    staff_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    staff_role VARCHAR(50) NOT NULL,
    staff_phone VARCHAR(15) NOT NULL,
    staff_password VARCHAR(255) NOT NULL,
    outlet_id INTEGER,
    FOREIGN KEY (outlet_id) REFERENCES SERVICEOUTLET(outlet_id)
);

-- TIME table
CREATE TABLE IF NOT EXISTS TIME (
    time_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    time_year SMALLINT NOT NULL,
    time_quarter SMALLINT NOT NULL,
    time_month SMALLINT NOT NULL,
    time_day SMALLINT NOT NULL,
    time_clocktime TIME NOT NULL
);

-- VEHICLE table
CREATE TABLE IF NOT EXISTS VEHICLE (
    veh_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    veh_plateno VARCHAR(15) NOT NULL UNIQUE,
    veh_model VARCHAR(50) NOT NULL,
    veh_brand VARCHAR(50) NOT NULL,
    veh_type VARCHAR(30) NOT NULL,
    veh_year SMALLINT NOT NULL,
    cust_id INTEGER,
    FOREIGN KEY (cust_id) REFERENCES CUSTOMER(cust_id)
);

-- NOTIFICATION table
CREATE TABLE IF NOT EXISTS NOTIFICATION (
    notification_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_type VARCHAR(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    link VARCHAR(200)
);

-- Create indexes for NOTIFICATION table
CREATE INDEX idx_notification_user ON NOTIFICATION(user_id, user_type);
CREATE INDEX idx_notification_created_at ON NOTIFICATION(created_at);

-- SERVICEAPPOINTMENT table
CREATE TABLE IF NOT EXISTS SERVICEAPPOINTMENT (
    appointment_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    cust_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    outlet_id INTEGER NOT NULL,
    time_id INTEGER NOT NULL,
    veh_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    appointment_cost DECIMAL(10,2) NOT NULL,
    appointment_duration INTEGER NOT NULL,
    appointment_status VARCHAR(20) NOT NULL,
    estimated_finish_time TIME,
    FOREIGN KEY (cust_id) REFERENCES CUSTOMER(cust_id),
    FOREIGN KEY (service_id) REFERENCES SERVICE(service_id),
    FOREIGN KEY (outlet_id) REFERENCES SERVICEOUTLET(outlet_id),
    FOREIGN KEY (time_id) REFERENCES TIME(time_id),
    FOREIGN KEY (veh_id) REFERENCES VEHICLE(veh_id),
    FOREIGN KEY (staff_id) REFERENCES STAFF(staff_id)
);

-- Insert essential system data

-- Insert service outlets (required for staff)
INSERT INTO SERVICEOUTLET (outlet_id, outlet_name, outlet_address, outlet_city, outlet_state, outlet_postal_code)
VALUES (1, 'Downtown Service Center', '123 Main St', 'New York', 'NY', '10001')
ON DUPLICATE KEY UPDATE outlet_id = outlet_id;

INSERT INTO SERVICEOUTLET (outlet_id, outlet_name, outlet_address, outlet_city, outlet_state, outlet_postal_code)
VALUES (2, 'Westside Auto Care', '456 West Ave', 'Los Angeles', 'CA', '90001')
ON DUPLICATE KEY UPDATE outlet_id = outlet_id;

INSERT INTO SERVICEOUTLET (outlet_id, outlet_name, outlet_address, outlet_city, outlet_state, outlet_postal_code)
VALUES (3, 'Northside Service', '789 North Blvd', 'Chicago', 'IL', '60601')
ON DUPLICATE KEY UPDATE outlet_id = outlet_id;

-- Insert unassigned staff record (required for appointment booking)
-- Password: password (hashed)
INSERT INTO STAFF (staff_id, staff_name, staff_role, staff_phone, staff_password, outlet_id)
VALUES (9999, 'Unassigned', 'UNASSIGNED', '0000000000', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 1)
ON DUPLICATE KEY UPDATE staff_id = staff_id;

-- Insert essential services
INSERT INTO SERVICE (service_id, service_type, service_desc, service_category, service_price, service_duration)
VALUES (1, 'Oil Change', 'Standard oil change service', 'Maintenance', 50.0, 30)
ON DUPLICATE KEY UPDATE service_id = service_id;

INSERT INTO SERVICE (service_id, service_type, service_desc, service_category, service_price, service_duration)
VALUES (2, 'Tire Rotation', 'Rotate tires for even wear', 'Maintenance', 80.0, 60)
ON DUPLICATE KEY UPDATE service_id = service_id;

INSERT INTO SERVICE (service_id, service_type, service_desc, service_category, service_price, service_duration)
VALUES (3, 'Brake Service', 'Inspect and replace brake pads if needed', 'Repair', 120.0, 90)
ON DUPLICATE KEY UPDATE service_id = service_id;

INSERT INTO SERVICE (service_id, service_type, service_desc, service_category, service_price, service_duration)
VALUES (4, 'Engine Tune-up', 'Comprehensive engine maintenance', 'Maintenance', 150.0, 120)
ON DUPLICATE KEY UPDATE service_id = service_id;

INSERT INTO SERVICE (service_id, service_type, service_desc, service_category, service_price, service_duration)
VALUES (5, 'Transmission Service', 'Flush and replace transmission fluid', 'Maintenance', 200.0, 180)
ON DUPLICATE KEY UPDATE service_id = service_id;

-- Insert sample time slots for the current month (for testing)
-- Current day morning slots
INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (101, 2025, 2, 5, 1, '09:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;

INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (102, 2025, 2, 5, 1, '10:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;

INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (103, 2025, 2, 5, 1, '11:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;

-- Next day slots
INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (201, 2025, 2, 5, 2, '09:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;

INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (202, 2025, 2, 5, 2, '10:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;

INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (203, 2025, 2, 5, 2, '11:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;
