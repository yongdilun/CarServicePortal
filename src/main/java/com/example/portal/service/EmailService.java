package com.example.portal.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@autoservice.com}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    /**
     * Sends an email if email sending is enabled in the application configuration.
     * Logs errors but does not throw exceptions to prevent disrupting the main application flow.
     *
     * @param to The recipient's email address
     * @param subject The email subject
     * @param body The email body
     * @return true if the email was sent successfully or email sending is disabled, false if an error occurred
     */
    public boolean sendEmail(String to, String subject, String body) {
        // Skip sending if email is disabled in configuration
        if (!emailEnabled) {
            logger.debug("Email sending is disabled. Would have sent email to: {}", to);
            return true;
        }

        // Skip if recipient email is invalid
        if (to == null || to.isEmpty() || !to.contains("@")) {
            logger.debug("Invalid recipient email address: {}", to);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            logger.debug("Email sent successfully to: {}", to);
            return true;
        } catch (Exception e) {
            // Log the error but don't throw exception to prevent disrupting the main flow
            logger.warn("Failed to send email: {}", e.getMessage());
            return false;
        }
    }
}
