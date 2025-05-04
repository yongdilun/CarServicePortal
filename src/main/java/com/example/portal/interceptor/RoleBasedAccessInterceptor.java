package com.example.portal.interceptor;

import com.example.portal.model.Customer;
import com.example.portal.model.Staff;
import com.example.portal.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor to enforce role-based access control for API endpoints
 */
@Component
public class RoleBasedAccessInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RoleBasedAccessInterceptor.class);

    private final AuthService authService;

    public RoleBasedAccessInterceptor(AuthService authService) {
        this.authService = authService;
        logger.info("RoleBasedAccessInterceptor initialized");
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();

        // Skip authentication for public endpoints
        if (isPublicEndpoint(path)) {
            logger.debug("Public endpoint access: {}", path);
            return true;
        }

        // Get the authenticated user
        Object user = authService.getCurrentUser();

        // If no user is authenticated, reject the request
        if (user == null) {
            logger.warn("Unauthorized access attempt to {}", path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        // Check if the user has the appropriate role for the requested endpoint
        if (path.startsWith("/api/customer") && !(user instanceof Customer)) {
            logger.warn("Access denied: Non-customer attempting to access customer endpoint {}", path);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }

        if (path.startsWith("/api/staff") && !(user instanceof Staff)) {
            logger.warn("Access denied: Non-staff attempting to access staff endpoint {}", path);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }

        // Access granted
        logger.debug("Access granted to {} for user type: {}", path,
                     user instanceof Customer ? "Customer" : "Staff");
        return true;
    }

    /**
     * Check if the endpoint is public (doesn't require authentication)
     */
    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/auth") ||
               path.startsWith("/api/services") ||
               path.startsWith("/api/outlets") ||
               path.startsWith("/api/public") ||
               path.startsWith("/api/customer/vehicles") ||
               path.startsWith("/api/customer/appointments") ||
               path.equals("/api/customer/appointments") ||
               path.startsWith("/api/notifications") ||
               path.startsWith("/api/staff/appointments") ||
               path.startsWith("/api/staff/outlet") ||
               path.startsWith("/api/staff/schedule") ||
               path.startsWith("/api/staff/services") ||
               path.startsWith("/api/reports");
    }
}
