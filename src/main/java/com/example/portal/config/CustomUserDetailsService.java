package com.example.portal.config;

import com.example.portal.model.Customer;
import com.example.portal.model.Staff;
import com.example.portal.repository.CustomerMapper;
import com.example.portal.repository.StaffMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private CustomerMapper customerMapper;

    @Autowired
    private StaffMapper staffMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.debug("Loading user by username: {}", username);

        // First try to find a staff member by name
        Staff staff = staffMapper.findByName(username);
        if (staff != null) {
            logger.debug("Found staff: {}, role: {}", staff.getStaffName(), staff.getStaffRole());

            return new org.springframework.security.core.userdetails.User(
                staff.getStaffName(),
                staff.getStaffPassword(),
                true, // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STAFF"))
            );
        }

        // If not found, try to find a customer by name
        Customer customer = customerMapper.findByName(username);
        if (customer != null) {
            logger.debug("Found customer: {}", customer.getCustName());

            return new org.springframework.security.core.userdetails.User(
                customer.getCustName(),
                customer.getCustPassword(),
                true, // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
            );
        }

        // If neither found, throw exception
        logger.error("User not found with username: {}", username);
        throw new UsernameNotFoundException("User not found with username: " + username);
    }
}
