package com.example.portal.service;

import com.example.portal.model.Customer;
import com.example.portal.model.Staff;
import com.example.portal.repository.CustomerMapper;
import com.example.portal.repository.StaffMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service for authentication-related operations
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    private final CustomerMapper customerMapper;
    private final StaffMapper staffMapper;

    /**
     * Get the currently authenticated user (either Customer or Staff)
     * @return Customer or Staff object, or null if not authenticated
     */
    public Object getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        
        String username = authentication.getName();
        logger.debug("Getting current user for username: {}", username);
        
        // Check if the user is a staff member
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"))) {
            Staff staff = staffMapper.findByName(username);
            logger.debug("Found staff user: {}", staff != null ? staff.getStaffName() : "null");
            return staff;
        }
        
        // Check if the user is a customer
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"))) {
            Customer customer = customerMapper.findByName(username);
            logger.debug("Found customer user: {}", customer != null ? customer.getCustName() : "null");
            return customer;
        }
        
        logger.warn("User authenticated but not found in database: {}", username);
        return null;
    }
    
    /**
     * Check if the current user is a staff member
     */
    public boolean isStaff() {
        Object user = getCurrentUser();
        return user instanceof Staff;
    }
    
    /**
     * Check if the current user is a customer
     */
    public boolean isCustomer() {
        Object user = getCurrentUser();
        return user instanceof Customer;
    }
}
