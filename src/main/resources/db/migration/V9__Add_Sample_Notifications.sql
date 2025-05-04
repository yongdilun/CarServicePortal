-- Add sample notifications for customers
INSERT INTO NOTIFICATION (user_id, user_type, title, message, type, is_read, created_at, link)
VALUES 
(1, 'customer', 'Welcome to Auto Service Portal', 'Thank you for registering with us. We look forward to serving you.', 'system', false, NOW(), '/customer/dashboard'),
(1, 'customer', 'New Appointment Booked', 'Your appointment for Oil Change on 2023-06-15 has been booked successfully.', 'appointment', false, NOW(), '/customer/appointments/1'),
(1, 'customer', 'Appointment Status Updated', 'Your appointment for Oil Change has been updated to SCHEDULED.', 'appointment', false, NOW(), '/customer/appointments/1'),
(1, 'customer', 'Appointment Reminder', 'Reminder: Your appointment for Oil Change is scheduled for tomorrow.', 'reminder', false, NOW(), '/customer/appointments/1'),
(1, 'customer', 'Service Completed', 'Your Oil Change service has been completed. Your vehicle is ready for pickup.', 'service', false, NOW(), '/customer/appointments/1');

-- Add sample notifications for staff
INSERT INTO NOTIFICATION (user_id, user_type, title, message, type, is_read, created_at, link)
VALUES 
(1, 'staff', 'Welcome to Auto Service Portal', 'Thank you for joining our team. You can now manage appointments and services.', 'system', false, NOW(), '/staff/dashboard'),
(1, 'staff', 'New Appointment Assigned', 'A new Oil Change appointment has been assigned to you on 2023-06-15.', 'appointment', false, NOW(), '/staff/appointments/1'),
(1, 'staff', 'Appointment Status Updated', 'An appointment for Oil Change has been updated to SCHEDULED.', 'appointment', false, NOW(), '/staff/appointments/1'),
(1, 'staff', 'Today\'s Schedule', 'You have 3 appointments scheduled for today.', 'reminder', false, NOW(), '/staff/schedule'),
(1, 'staff', 'Service Completed', 'Oil Change service for customer John Doe has been marked as completed.', 'service', false, NOW(), '/staff/appointments/1');
