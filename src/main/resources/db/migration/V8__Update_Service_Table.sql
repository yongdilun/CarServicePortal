-- Add price and duration columns to SERVICE table
ALTER TABLE SERVICE ADD COLUMN service_price DOUBLE DEFAULT 0.0;
ALTER TABLE SERVICE ADD COLUMN service_duration INT DEFAULT 60;

-- Update existing services with sample prices and durations
UPDATE SERVICE SET service_price = 50.0, service_duration = 30 WHERE service_type = 'Oil Change';
UPDATE SERVICE SET service_price = 80.0, service_duration = 60 WHERE service_type = 'Tire Rotation';
UPDATE SERVICE SET service_price = 120.0, service_duration = 90 WHERE service_type = 'Brake Service';
UPDATE SERVICE SET service_price = 150.0, service_duration = 120 WHERE service_type = 'Engine Tune-up';
UPDATE SERVICE SET service_price = 200.0, service_duration = 180 WHERE service_type = 'Transmission Service';
