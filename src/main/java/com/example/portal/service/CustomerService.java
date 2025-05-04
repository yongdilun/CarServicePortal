package com.example.portal.service;

import com.example.portal.model.Customer;
import com.example.portal.repository.CustomerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerMapper customerMapper;
    private final PasswordEncoder passwordEncoder;

    public Customer findById(Integer custId) {
        return customerMapper.findById(custId);
    }

    public Customer findByEmail(String email) {
        return customerMapper.findByEmail(email);
    }

    public Customer findByName(String name) {
        return customerMapper.findByName(name);
    }

    public boolean isEmailAvailable(String email) {
        return customerMapper.findByEmail(email) == null;
    }

    public boolean isNameAvailable(String name) {
        return customerMapper.findByName(name) == null;
    }

    @Transactional
    public Customer registerCustomer(Customer customer) {
        // Encode the password
        customer.setCustPassword(passwordEncoder.encode(customer.getCustPassword()));

        // Insert the customer
        customerMapper.insert(customer);

        return customer;
    }

    @Transactional
    public boolean updateCustomer(Customer customer) {
        return customerMapper.update(customer) > 0;
    }

    @Transactional
    public boolean updatePassword(Integer custId, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        return customerMapper.updatePassword(custId, encodedPassword) > 0;
    }

    @Transactional
    public boolean deleteCustomer(Integer custId) {
        return customerMapper.delete(custId) > 0;
    }

    public boolean checkPassword(Integer custId, String rawPassword) {
        Customer customer = customerMapper.findById(custId);
        if (customer == null) {
            return false;
        }

        return passwordEncoder.matches(rawPassword, customer.getCustPassword());
    }

    public boolean checkPassword(String name, String rawPassword) {
        Customer customer = customerMapper.findByName(name);
        if (customer == null) {
            return false;
        }

        return passwordEncoder.matches(rawPassword, customer.getCustPassword());
    }
}
