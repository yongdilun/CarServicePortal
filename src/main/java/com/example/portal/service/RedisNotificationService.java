package com.example.portal.service;

import com.example.portal.model.Notification;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Service for managing notifications using Redis
 */
@Service
public class RedisNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(RedisNotificationService.class);
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisNotificationService(RedisTemplate<String, Object> redisTemplate,
                                   @Qualifier("redisObjectMapper") ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        logger.info("RedisNotificationService initialized with custom ObjectMapper");
    }

    /**
     * Store a notification in Redis
     * @param notification The notification to store
     */
    public void storeNotification(Notification notification) {
        try {
            String key = getNotificationKey(notification.getUserType(), notification.getUserId(), notification.getNotificationId());
            redisTemplate.opsForValue().set(key, notification);

            // Add to user's notification list
            String listKey = getNotificationListKey(notification.getUserType(), notification.getUserId());
            redisTemplate.opsForList().leftPush(listKey, notification.getNotificationId().toString());

            // Set expiration for notifications (30 days)
            redisTemplate.expire(key, 30, TimeUnit.DAYS);
            redisTemplate.expire(listKey, 30, TimeUnit.DAYS);

            logger.debug("Stored notification in Redis: {}", notification.getNotificationId());
        } catch (Exception e) {
            logger.error("Error storing notification in Redis", e);
        }
    }

    /**
     * Get all notifications for a user
     * @param userId The user ID
     * @param userType The user type (customer or staff)
     * @return List of notifications
     */
    public List<Notification> getUserNotifications(Integer userId, String userType) {
        try {
            String listKey = getNotificationListKey(userType, userId);
            List<Object> notificationIds = redisTemplate.opsForList().range(listKey, 0, -1);

            if (notificationIds == null || notificationIds.isEmpty()) {
                return new ArrayList<>();
            }

            List<Notification> notifications = new ArrayList<>();
            for (Object id : notificationIds) {
                String key = getNotificationKey(userType, userId, Integer.parseInt(id.toString()));
                Object notificationObj = redisTemplate.opsForValue().get(key);

                if (notificationObj != null) {
                    if (notificationObj instanceof Notification) {
                        notifications.add((Notification) notificationObj);
                    } else {
                        // Handle case where object is not a Notification (e.g., it's a serialized form)
                        Notification notification = objectMapper.convertValue(notificationObj, Notification.class);
                        notifications.add(notification);
                    }
                }
            }

            return notifications;
        } catch (Exception e) {
            logger.error("Error retrieving notifications from Redis", e);
            return new ArrayList<>();
        }
    }

    /**
     * Mark a notification as read
     * @param notificationId The notification ID
     * @param userId The user ID
     * @param userType The user type
     */
    public void markNotificationAsRead(Integer notificationId, Integer userId, String userType) {
        try {
            String key = getNotificationKey(userType, userId, notificationId);
            Object notificationObj = redisTemplate.opsForValue().get(key);

            if (notificationObj != null) {
                Notification notification;
                if (notificationObj instanceof Notification) {
                    notification = (Notification) notificationObj;
                } else {
                    notification = objectMapper.convertValue(notificationObj, Notification.class);
                }

                notification.setRead(true);
                redisTemplate.opsForValue().set(key, notification);
                logger.debug("Marked notification as read: {}", notificationId);
            }
        } catch (Exception e) {
            logger.error("Error marking notification as read in Redis", e);
        }
    }

    /**
     * Get unread notifications for a user
     * @param userId The user ID
     * @param userType The user type
     * @return List of unread notifications
     */
    public List<Notification> getUnreadNotifications(Integer userId, String userType) {
        List<Notification> allNotifications = getUserNotifications(userId, userType);
        return allNotifications.stream()
                .filter(n -> !n.isRead())
                .toList();
    }

    /**
     * Delete a notification
     * @param notificationId The notification ID
     * @param userId The user ID
     * @param userType The user type
     */
    public void deleteNotification(Integer notificationId, Integer userId, String userType) {
        try {
            String key = getNotificationKey(userType, userId, notificationId);
            String listKey = getNotificationListKey(userType, userId);

            redisTemplate.delete(key);
            redisTemplate.opsForList().remove(listKey, 0, notificationId.toString());

            logger.debug("Deleted notification: {}", notificationId);
        } catch (Exception e) {
            logger.error("Error deleting notification from Redis", e);
        }
    }

    /**
     * Get the Redis key for a notification
     */
    private String getNotificationKey(String userType, Integer userId, Integer notificationId) {
        return String.format("notification:%s:%d:%d", userType, userId, notificationId);
    }

    /**
     * Get the Redis key for a user's notification list
     */
    private String getNotificationListKey(String userType, Integer userId) {
        return String.format("notifications:%s:%d", userType, userId);
    }
}
