-- Create Notification table
CREATE TABLE NOTIFICATION (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type VARCHAR(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    link VARCHAR(200)
);

-- Create indexes
CREATE INDEX idx_notification_user ON NOTIFICATION(user_id, user_type);
CREATE INDEX idx_notification_created_at ON NOTIFICATION(created_at);
