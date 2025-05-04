
-- CUSTOMER table
CREATE TABLE IF NOT EXISTS CUSTOMER (
    cust_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    cust_name VARCHAR(100) NOT NULL UNIQUE,
    cust_phone VARCHAR(15) NOT NULL,
    cust_email VARCHAR(100) NOT NULL UNIQUE,
    cust_address VARCHAR(255) NOT NULL,
    cust_password VARCHAR(255) NOT NULL
);

-- STAFF table
CREATE TABLE IF NOT EXISTS STAFF (
    staff_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    staff_role VARCHAR(50) NOT NULL,
    staff_phone VARCHAR(15) NOT NULL,
    staff_password VARCHAR(255) NOT NULL,
    outlet_id INTEGER
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

-- SERVICE table
CREATE TABLE IF NOT EXISTS SERVICE (
    service_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    service_type VARCHAR(50) NOT NULL,
    service_desc VARCHAR(255) NOT NULL,
    service_category VARCHAR(50) NOT NULL
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

-- Add foreign key constraint to STAFF table after SERVICEOUTLET is created
ALTER TABLE STAFF
ADD CONSTRAINT fk_staff_outlet
FOREIGN KEY (outlet_id) REFERENCES SERVICEOUTLET(outlet_id);

-- TIME table
CREATE TABLE IF NOT EXISTS TIME (
    time_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    time_year SMALLINT NOT NULL,
    time_quarter SMALLINT NOT NULL,
    time_month SMALLINT NOT NULL,
    time_day SMALLINT NOT NULL,
    time_clocktime TIME NOT NULL
);



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

-- Insert sample service outlets
INSERT INTO SERVICEOUTLET (outlet_id, outlet_name, outlet_address, outlet_city, outlet_state, outlet_postal_code)
VALUES (1, 'Downtown Service Center', '123 Main St', 'New York', 'NY', '10001')
ON DUPLICATE KEY UPDATE outlet_id = outlet_id;

INSERT INTO SERVICEOUTLET (outlet_id, outlet_name, outlet_address, outlet_city, outlet_state, outlet_postal_code)
VALUES (2, 'Westside Auto Care', '456 West Ave', 'Los Angeles', 'CA', '90001')
ON DUPLICATE KEY UPDATE outlet_id = outlet_id;

INSERT INTO SERVICEOUTLET (outlet_id, outlet_name, outlet_address, outlet_city, outlet_state, outlet_postal_code)
VALUES (3, 'Northside Service', '789 North Blvd', 'Chicago', 'IL', '60601')
ON DUPLICATE KEY UPDATE outlet_id = outlet_id;

-- Insert unassigned staff record (password: password)
INSERT INTO STAFF (staff_id, staff_name, staff_role, staff_phone, staff_password, outlet_id)
VALUES (9999, 'Unassigned', 'UNASSIGNED', '0000000000', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 1)
ON DUPLICATE KEY UPDATE staff_id = staff_id;

-- Insert sample staff (password: staff123)
INSERT INTO STAFF (staff_id, staff_name, staff_role, staff_phone, staff_password, outlet_id)
VALUES (1001, 'John Doe', 'Mechanic', '123-456-7890', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 1)
ON DUPLICATE KEY UPDATE staff_id = staff_id;

-- Insert sample customer (password: customer123)
INSERT INTO CUSTOMER (cust_id, cust_name, cust_phone, cust_email, cust_address, cust_password)
VALUES (10001, 'Jane Smith', '987-654-3210', 'jane@example.com', '123 Main St, Anytown, USA', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW')
ON DUPLICATE KEY UPDATE cust_id = cust_id;

-- Insert sample vehicle
INSERT INTO VEHICLE (veh_id, veh_plateno, veh_model, veh_brand, veh_type, veh_year, cust_id)
VALUES (101, 'ABC123', 'Camry', 'Toyota', 'Sedan', 2020, 10001)
ON DUPLICATE KEY UPDATE veh_id = veh_id;

-- Insert sample services
INSERT INTO SERVICE (service_id, service_type, service_desc, service_category)
VALUES (1, 'Oil Change', 'Standard oil change service', 'Maintenance')
ON DUPLICATE KEY UPDATE service_id = service_id;

INSERT INTO SERVICE (service_id, service_type, service_desc, service_category)
VALUES (2, 'Tire Rotation', 'Rotate tires for even wear', 'Maintenance')
ON DUPLICATE KEY UPDATE service_id = service_id;

-- Insert sample time slots
INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (101, 2025, 2, 5, 1, '09:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;

INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (102, 2025, 2, 5, 1, '10:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;

INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (201, 2025, 2, 5, 2, '09:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;

INSERT INTO TIME (time_id, time_year, time_quarter, time_month, time_day, time_clocktime)
VALUES (202, 2025, 2, 5, 2, '10:00:00')
ON DUPLICATE KEY UPDATE time_id = time_id;

-- Insert sample pending appointment
INSERT INTO SERVICEAPPOINTMENT (appointment_id, cust_id, service_id, outlet_id, time_id, veh_id, staff_id,
                               appointment_cost, appointment_duration, appointment_status)
VALUES (2001, 10001, 1, 1, 201, 101, 9999, 89.99, 60, 'PENDING')
ON DUPLICATE KEY UPDATE appointment_id = appointment_id;


