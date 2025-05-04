package com.example.portal.controller;

import com.example.portal.model.Notification;
import com.example.portal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userType}/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(
            @PathVariable String userType,
            @PathVariable Integer userId,
            @RequestParam(required = false, defaultValue = "false") boolean unreadOnly) {

        List<Notification> notifications;
        if (unreadOnly) {
            notifications = notificationService.getUnreadNotifications(userId, userType);
        } else {
            notifications = notificationService.getUserNotifications(userId, userType);
        }

        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PostMapping("/{userType}/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable String userType,
            @PathVariable Integer userId) {

        notificationService.markAllAsRead(userId, userType);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Integer notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    @DeleteMapping("/{userType}/{userId}")
    public ResponseEntity<?> deleteAllUserNotifications(
            @PathVariable String userType,
            @PathVariable Integer userId) {

        notificationService.deleteAllUserNotifications(userId, userType);
        return ResponseEntity.ok(Map.of("message", "All notifications deleted"));
    }

    // Test endpoint to create a notification
    @PostMapping("/test/{userType}/{userId}")
    public ResponseEntity<?> createTestNotification(
            @PathVariable String userType,
            @PathVariable Integer userId) {

        Notification notification = notificationService.createNotification(
            userId,
            userType,
            "Test Notification",
            "This is a test notification created at " + java.time.LocalDateTime.now(),
            "system",
            "/" + userType + "/dashboard"
        );

        return ResponseEntity.ok(notification);
    }
}
