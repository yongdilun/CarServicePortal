package com.example.portal.service;

import com.example.portal.model.ServiceOutlet;
import com.example.portal.repository.ServiceOutletMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing service outlets with Redis caching
 */
@Service
@RequiredArgsConstructor
public class ServiceOutletService {

    private static final Logger logger = LoggerFactory.getLogger(ServiceOutletService.class);
    private final ServiceOutletMapper outletMapper;

    /**
     * Find all service outlets (cached)
     * @return List of all service outlets
     */
    @Cacheable(value = "outlets", key = "'all'")
    public List<ServiceOutlet> findAllOutlets() {
        logger.debug("Fetching all service outlets from database");
        return outletMapper.findAll();
    }

    /**
     * Find service outlet by ID (cached)
     * @param outletId The outlet ID
     * @return The service outlet or null if not found
     */
    // Temporarily disable caching to avoid ClassCastException
    // @Cacheable(value = "outlets", key = "#outletId")
    public ServiceOutlet findById(Integer outletId) {
        logger.debug("Fetching service outlet with ID: {} from database", outletId);
        return outletMapper.findById(outletId);
    }

    /**
     * Find service outlets by city (cached)
     * @param city The city name
     * @return List of service outlets in the city
     */
    @Cacheable(value = "outlets", key = "'city:' + #city")
    public List<ServiceOutlet> findByCity(String city) {
        logger.debug("Fetching service outlets in city: {} from database", city);
        return outletMapper.findByCity(city);
    }

    /**
     * Add a new service outlet (evicts cache)
     * @param outlet The service outlet to add
     * @return The added service outlet with ID
     */
    @Transactional
    @CacheEvict(value = "outlets", allEntries = true)
    public ServiceOutlet addOutlet(ServiceOutlet outlet) {
        logger.debug("Adding new service outlet: {}", outlet.getOutletName());
        outletMapper.insert(outlet);
        return outlet;
    }

    /**
     * Update a service outlet (evicts cache)
     * @param outlet The service outlet to update
     * @return true if updated, false otherwise
     */
    @Transactional
    @CacheEvict(value = "outlets", allEntries = true)
    public boolean updateOutlet(ServiceOutlet outlet) {
        logger.debug("Updating service outlet with ID: {}", outlet.getOutletId());
        return outletMapper.update(outlet) > 0;
    }

    /**
     * Delete a service outlet (evicts cache)
     * @param outletId The ID of the service outlet to delete
     * @return true if deleted, false otherwise
     */
    @Transactional
    @CacheEvict(value = "outlets", allEntries = true)
    public boolean deleteOutlet(Integer outletId) {
        logger.debug("Deleting service outlet with ID: {}", outletId);
        return outletMapper.delete(outletId) > 0;
    }
}
