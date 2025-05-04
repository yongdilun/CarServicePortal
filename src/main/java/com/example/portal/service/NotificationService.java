package com.example.portal.service;

import com.example.portal.model.Notification;
import com.example.portal.model.ServiceAppointment;
import com.example.portal.repository.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationMapper notificationMapper;
    private final EmailService emailService;

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

        notificationMapper.insert(notification);
        return notification;
    }

    public List<Notification> getUserNotifications(Integer userId, String userType) {
        return notificationMapper.findByUser(userId, userType);
    }

    public List<Notification> getUnreadNotifications(Integer userId, String userType) {
        return notificationMapper.findUnreadByUser(userId, userType);
    }

    public void markAsRead(Integer notificationId) {
        notificationMapper.markAsRead(notificationId);
    }

    public void markAllAsRead(Integer userId, String userType) {
        notificationMapper.markAllAsRead(userId, userType);
    }

    public void deleteNotification(Integer notificationId) {
        notificationMapper.delete(notificationId);
    }

    public void deleteAllUserNotifications(Integer userId, String userType) {
        notificationMapper.deleteAllForUser(userId, userType);
    }

    /**
     * Simple method to notify customer about appointment status changes
     * This is the main method you should use for appointment notifications
     */
    public void notifyCustomerAboutAppointment(ServiceAppointment appointment, String status) {
        if (appointment == null || appointment.getCustId() == null) {
            return; // Skip if appointment or required data is missing
        }

        String title;
        String message;
        String type = "appointment";

        // Get service type name
        String serviceTypeName = "your service";
        if (appointment.getService() != null) {
            serviceTypeName = appointment.getService().getServiceType();
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
        createNotification(appointment.getCustId(), "customer", title, message, type, link);

        // Log the notification for debugging
        logger.debug("Created notification for customer {}: {}", appointment.getCustId(), title);
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
