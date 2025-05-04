package com.example.portal.controller;

import com.example.portal.model.Customer;
import com.example.portal.model.Staff;
import com.example.portal.service.CustomerService;
import com.example.portal.service.StaffService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final CustomerService customerService;
    private final StaffService staffService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        String loginType = loginRequest.get("type"); // "staff" or "customer"

        if ("staff".equals(loginType)) {
            return loginStaff(username, password);
        } else if ("customer".equals(loginType)) {
            return loginCustomer(username, password);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid login type"));
        }
    }

    private ResponseEntity<?> loginStaff(String username, String password) {
        // Check if the staff exists
        Staff staff = staffService.findByName(username);
        if (staff == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }

        // Check if the password matches
        boolean passwordMatches = passwordEncoder.matches(password, staff.getStaffPassword());
        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }

        try {
            // Create authentication token and set in security context
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                username, null, // Don't include credentials in the token
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STAFF"))
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Map<String, Object> response = new HashMap<>();
            response.put("id", staff.getStaffId());
            response.put("name", staff.getStaffName());
            response.put("role", staff.getStaffRole());
            response.put("phone", staff.getStaffPhone());
            response.put("userType", "staff");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }

    private ResponseEntity<?> loginCustomer(String username, String password) {
        // Check if the customer exists
        Customer customer = customerService.findByName(username);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }

        // Check if the password matches
        boolean passwordMatches = passwordEncoder.matches(password, customer.getCustPassword());
        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }

        try {
            // Create authentication token and set in security context
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                username, null, // Don't include credentials in the token
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            Map<String, Object> response = new HashMap<>();
            response.put("id", customer.getCustId());
            response.put("name", customer.getCustName());
            response.put("email", customer.getCustEmail());
            response.put("phone", customer.getCustPhone());
            response.put("address", customer.getCustAddress());
            response.put("userType", "customer");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }

    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@RequestBody Customer customer) {
        // Check if username already exists
        if (!customerService.isNameAvailable(customer.getCustName())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        // Check if email already exists
        if (!customerService.isEmailAvailable(customer.getCustEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // Register the customer
        Customer registeredCustomer = customerService.registerCustomer(customer);

        Map<String, Object> response = new HashMap<>();
        response.put("id", registeredCustomer.getCustId());
        response.put("name", registeredCustomer.getCustName());
        response.put("email", registeredCustomer.getCustEmail());
        response.put("userType", "customer");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/staff")
    public ResponseEntity<?> registerStaff(@RequestBody Staff staff) {
        // Check if name already exists
        if (!staffService.isNameAvailable(staff.getStaffName())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Staff name already exists"));
        }

        // Register the staff
        Staff registeredStaff = staffService.registerStaff(staff);

        Map<String, Object> response = new HashMap<>();
        response.put("id", registeredStaff.getStaffId());
        response.put("name", registeredStaff.getStaffName());
        response.put("role", registeredStaff.getStaffRole());
        response.put("userType", "staff");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
