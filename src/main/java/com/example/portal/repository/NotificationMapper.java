package com.example.portal.repository;

import com.example.portal.model.Notification;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface NotificationMapper {

    @Insert("INSERT INTO NOTIFICATION (user_id, user_type, title, message, type, is_read, created_at, link) " +
            "VALUES (#{userId}, #{userType}, #{title}, #{message}, #{type}, #{read}, #{createdAt}, #{link})")
    @Options(useGeneratedKeys = true, keyProperty = "notificationId")
    int insert(Notification notification);

    @Select("SELECT notification_id as notificationId, user_id as userId, user_type as userType, " +
            "title, message, type, is_read as `read`, created_at as createdAt, link " +
            "FROM NOTIFICATION WHERE notification_id = #{notificationId}")
    Notification findById(Integer notificationId);

    @Select("SELECT notification_id as notificationId, user_id as userId, user_type as userType, " +
            "title, message, type, is_read as `read`, created_at as createdAt, link " +
            "FROM NOTIFICATION WHERE user_id = #{userId} AND user_type = #{userType} ORDER BY created_at DESC")
    List<Notification> findByUser(Integer userId, String userType);

    @Select("SELECT notification_id as notificationId, user_id as userId, user_type as userType, " +
            "title, message, type, is_read as `read`, created_at as createdAt, link " +
            "FROM NOTIFICATION WHERE user_id = #{userId} AND user_type = #{userType} AND is_read = false ORDER BY created_at DESC")
    List<Notification> findUnreadByUser(Integer userId, String userType);

    @Update("UPDATE NOTIFICATION SET is_read = true WHERE notification_id = #{notificationId}")
    int markAsRead(Integer notificationId);

    @Update("UPDATE NOTIFICATION SET is_read = true WHERE user_id = #{userId} AND user_type = #{userType}")
    int markAllAsRead(Integer userId, String userType);

    @Delete("DELETE FROM NOTIFICATION WHERE notification_id = #{notificationId}")
    int delete(Integer notificationId);

    @Delete("DELETE FROM NOTIFICATION WHERE user_id = #{userId} AND user_type = #{userType}")
    int deleteAllForUser(Integer userId, String userType);
}
