package com.example.portal.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private Integer notificationId;
    private Integer userId;
    private String userType; // "customer" or "staff"
    private String title;
    private String message;
    private String type; // "appointment", "service", "system", etc.
    private boolean read; // Changed from isRead to read to match frontend
    private LocalDateTime createdAt;
    private String link; // Optional link to navigate to when clicked
}
