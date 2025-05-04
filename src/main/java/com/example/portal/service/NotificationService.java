package com.example.portal.service;

import com.example.portal.model.Notification;
import com.example.portal.model.ServiceAppointment;
import com.example.portal.repository.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing notifications with Redis caching
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationMapper notificationMapper;
    private final EmailService emailService;
    private final RedisNotificationService redisNotificationService;

    @Value("${app.notifications.use-redis:true}")
    private boolean useRedisNotifications;

    /**
     * Create a new notification
     * Stores in both database and Redis if Redis is enabled
     */
    public Notification createNotification(Integer userId, String userType, String title, String message, String type, String link) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setUserType(userType);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setLink(link);

        try {
            // Store in database
            notificationMapper.insert(notification);
            logger.debug("Notification stored in database: {}", notification.getNotificationId());

            // Store in Redis if enabled
            if (useRedisNotifications) {
                try {
                    redisNotificationService.storeNotification(notification);
                    logger.debug("Notification stored in Redis: {}", notification.getNotificationId());
                } catch (Exception e) {
                    logger.error("Failed to store notification in Redis: {}", e.getMessage(), e);
                    // Continue with database storage even if Redis fails
                }
            }
        } catch (Exception e) {
            logger.error("Failed to create notification: {}", e.getMessage(), e);
        }

        return notification;
    }

    /**
     * Get all notifications for a user
     * Uses Redis if enabled, falls back to database
     */
    public List<Notification> getUserNotifications(Integer userId, String userType) {
        if (useRedisNotifications) {
            try {
                List<Notification> redisNotifications = redisNotificationService.getUserNotifications(userId, userType);
                if (redisNotifications != null && !redisNotifications.isEmpty()) {
                    logger.debug("Retrieved {} notifications from Redis for user {}:{}",
                            redisNotifications.size(), userType, userId);
                    return redisNotifications;
                }
            } catch (Exception e) {
                logger.error("Failed to get notifications from Redis, falling back to database", e);
            }
        }

        // Fall back to database
        return notificationMapper.findByUser(userId, userType);
    }

    /**
     * Get unread notifications for a user
     * Uses Redis if enabled, falls back to database
     */
    public List<Notification> getUnreadNotifications(Integer userId, String userType) {
        if (useRedisNotifications) {
            try {
                List<Notification> unreadNotifications = redisNotificationService.getUnreadNotifications(userId, userType);
                if (unreadNotifications != null) {
                    logger.debug("Retrieved {} unread notifications from Redis for user {}:{}",
                            unreadNotifications.size(), userType, userId);
                    return unreadNotifications;
                }
            } catch (Exception e) {
                logger.error("Failed to get unread notifications from Redis, falling back to database", e);
            }
        }

        // Fall back to database
        return notificationMapper.findUnreadByUser(userId, userType);
    }

    /**
     * Mark a notification as read
     * Updates both database and Redis if enabled
     */
    public void markAsRead(Integer notificationId) {
        // Update in database
        notificationMapper.markAsRead(notificationId);

        if (useRedisNotifications) {
            try {
                // Get the notification to find user details
                Notification notification = notificationMapper.findById(notificationId);
                if (notification != null) {
                    redisNotificationService.markNotificationAsRead(
                            notificationId, notification.getUserId(), notification.getUserType());
                }
            } catch (Exception e) {
                logger.error("Failed to mark notification as read in Redis", e);
            }
        }
    }

    /**
     * Mark all notifications as read for a user
     * Updates both database and Redis if enabled
     */
    public void markAllAsRead(Integer userId, String userType) {
        // Update in database
        notificationMapper.markAllAsRead(userId, userType);

        if (useRedisNotifications) {
            try {
                // Get all notifications and mark each as read in Redis
                List<Notification> notifications = getUserNotifications(userId, userType);
                for (Notification notification : notifications) {
                    redisNotificationService.markNotificationAsRead(
                            notification.getNotificationId(), userId, userType);
                }
            } catch (Exception e) {
                logger.error("Failed to mark all notifications as read in Redis", e);
            }
        }
    }

    /**
     * Delete a notification
     * Deletes from both database and Redis if enabled
     */
    public void deleteNotification(Integer notificationId) {
        if (useRedisNotifications) {
            try {
                // Get the notification to find user details
                Notification notification = notificationMapper.findById(notificationId);
                if (notification != null) {
                    redisNotificationService.deleteNotification(
                            notificationId, notification.getUserId(), notification.getUserType());
                }
            } catch (Exception e) {
                logger.error("Failed to delete notification from Redis", e);
            }
        }

        // Delete from database
        notificationMapper.delete(notificationId);
    }

    /**
     * Delete all notifications for a user
     * Deletes from both database and Redis if enabled
     */
    public void deleteAllUserNotifications(Integer userId, String userType) {
        if (useRedisNotifications) {
            try {
                // Get all notifications and delete each from Redis
                List<Notification> notifications = getUserNotifications(userId, userType);
                for (Notification notification : notifications) {
                    redisNotificationService.deleteNotification(
                            notification.getNotificationId(), userId, userType);
                }
            } catch (Exception e) {
                logger.error("Failed to delete all notifications from Redis", e);
            }
        }

        // Delete from database
        notificationMapper.deleteAllForUser(userId, userType);
    }

    /**
     * Simple method to notify customer about appointment status changes
     * This is the main method you should use for appointment notifications
     */
    public void notifyCustomerAboutAppointment(ServiceAppointment appointment, String status) {
        try {
            if (appointment == null || appointment.getCustId() == null) {
                logger.warn("Cannot create notification: appointment or customer ID is null");
                return; // Skip if appointment or required data is missing
            }

            String title;
            String message;
            String type = "appointment";

            // Get service type name
            String serviceTypeName = "your service";
            try {
                // Use the safe method to get service type
                com.example.portal.model.ServiceType serviceType = appointment.getServiceTypeSafe();
                if (serviceType != null && serviceType.getServiceType() != null) {
                    serviceTypeName = serviceType.getServiceType();
                    logger.debug("Got service type using getServiceTypeSafe: {}", serviceTypeName);
                } else if (appointment.getService() != null) {
                    // Fallback to the old approach if needed
                    Object serviceObj = appointment.getService();
                    logger.debug("Service object class: {}", serviceObj.getClass().getName());

                    if (serviceObj instanceof com.example.portal.model.ServiceType) {
                        serviceTypeName = ((com.example.portal.model.ServiceType) serviceObj).getServiceType();
                        logger.debug("Got service type from ServiceType object: {}", serviceTypeName);
                    } else if (serviceObj instanceof java.util.Map) {
                        // Handle the case where service is a Map (including LinkedHashMap)
                        @SuppressWarnings("unchecked")
                        java.util.Map<String, Object> serviceMap = (java.util.Map<String, Object>) serviceObj;
                        if (serviceMap.containsKey("serviceType")) {
                            Object serviceTypeObj = serviceMap.get("serviceType");
                            if (serviceTypeObj != null) {
                                serviceTypeName = serviceTypeObj.toString();
                                logger.debug("Extracted service type from Map: {}", serviceTypeName);
                            }
                        }
                    } else {
                        // Try to get service type using reflection
                        try {
                            java.lang.reflect.Method getTypeMethod = serviceObj.getClass().getMethod("getServiceType");
                            Object result = getTypeMethod.invoke(serviceObj);
                            if (result != null) {
                                serviceTypeName = result.toString();
                                logger.debug("Got service type using reflection: {}", serviceTypeName);
                            }
                        } catch (Exception e) {
                            logger.warn("Could not get service type using reflection: {}", e.getMessage());
                            logger.warn("Unexpected service object type: {}", serviceObj.getClass().getName());
                        }
                    }
                } else if (appointment.getServiceId() != null) {
                    // Try to get service type from service ID
                    logger.debug("Service object is null, trying to get service type from service ID: {}", appointment.getServiceId());
                }
            } catch (Exception e) {
                logger.error("Error getting service type name: {}", e.getMessage(), e);
                // Continue with default service type name
            }

            // Set title and message based on status
            switch (status) {
                case "SCHEDULED":
                    title = "Appointment Confirmed";
                    message = "Your appointment for " + serviceTypeName + " has been confirmed.";
                    break;
                case "IN_PROGRESS":
                    title = "Service Started";
                    message = "Your " + serviceTypeName + " service has started.";
                    type = "service";
                    break;
                case "COMPLETED":
                    title = "Service Completed";
                    message = "Your " + serviceTypeName + " service has been completed. Your vehicle is ready for pickup.";
                    type = "service";
                    break;
                case "CANCELLED":
                    title = "Appointment Cancelled";
                    message = "Your appointment for " + serviceTypeName + " has been cancelled.";
                    break;
                default:
                    title = "Appointment Update";
                    message = "Your appointment for " + serviceTypeName + " has been updated to " + status + ".";
            }

            // Create the notification
            String link = "/customer/appointments/" + appointment.getAppointmentId();

            logger.debug("Creating notification for customer {} about appointment {}: {}",
                    appointment.getCustId(), appointment.getAppointmentId(), title);

            Notification notification = createNotification(appointment.getCustId(), "customer", title, message, type, link);

            if (notification != null && notification.getNotificationId() != null) {
                logger.debug("Successfully created notification ID {} for customer {}: {}",
                        notification.getNotificationId(), appointment.getCustId(), title);
            } else {
                logger.warn("Notification might not have been created properly for customer {}", appointment.getCustId());
            }
        } catch (Exception e) {
            logger.error("Error creating notification for appointment status change: {}", e.getMessage(), e);
        }
    }

    // Create notification and send email
    public void notifyUser(Integer userId, String userType, String title, String message, String type, String link, String email) {
        // Create in-app notification
        createNotification(userId, userType, title, message, type, link);

        // Send email notification if email is provided
        if (email != null && !email.isEmpty()) {
            boolean emailSent = emailService.sendEmail(email, title, message);
            if (!emailSent) {
                // Log that email wasn't sent but notification was created
                logger.warn("In-app notification created but email could not be sent to: {}", email);
            }
        }
    }

    // Notification for appointment booking
    public void notifyAppointmentBooked(Integer userId, String userType, Integer appointmentId, String serviceName, String appointmentDate, String email) {
        String title = "New Appointment Booked";
        String message = "Your appointment for " + serviceName + " on " + appointmentDate + " has been booked successfully.";
        String link = "/" + userType + "/appointments/" + appointmentId;

        notifyUser(userId, userType, title, message, "appointment", link, email);
    }

    // Notification for appointment status change
    public void notifyAppointmentStatusChange(Integer userId, String userType, Integer appointmentId, String serviceName, String newStatus, String email) {
        String title = "Appointment Status Updated";
        String message = "Your appointment for " + serviceName + " has been updated to " + newStatus + ".";
        String link = "/" + userType + "/appointments/" + appointmentId;

        notifyUser(userId, userType, title, message, "appointment", link, email);
    }

    // Notification for appointment reminder
    public void notifyAppointmentReminder(Integer userId, String userType, Integer appointmentId, String serviceName, String appointmentDate, String email) {
        String title = "Appointment Reminder";
        String message = "Reminder: Your appointment for " + serviceName + " is scheduled for " + appointmentDate + ".";
        String link = "/" + userType + "/appointments/" + appointmentId;

        notifyUser(userId, userType, title, message, "reminder", link, email);
    }

    // Notification for service completion
    public void notifyServiceCompleted(Integer userId, String userType, Integer appointmentId, String serviceName, String email) {
        String title = "Service Completed";
        String message = "Your " + serviceName + " service has been completed. Your vehicle is ready for pickup.";
        String link = "/" + userType + "/appointments/" + appointmentId;

        notifyUser(userId, userType, title, message, "service", link, email);
    }
}
