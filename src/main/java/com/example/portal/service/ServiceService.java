package com.example.portal.service;

import com.example.portal.model.ServiceType;
import com.example.portal.repository.ServiceMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing service types with Redis caching
 */
@Service
@RequiredArgsConstructor
public class ServiceService {

    private static final Logger logger = LoggerFactory.getLogger(ServiceService.class);
    private final ServiceMapper serviceMapper;

    /**
     * Find all services (cached)
     * @return List of all service types
     */
    @Cacheable(value = "services", key = "'all'")
    public List<ServiceType> findAllServices() {
        logger.debug("Fetching all services from database");
        return serviceMapper.findAll();
    }

    /**
     * Find service by ID (cached)
     * @param serviceId The service ID
     * @return The service or null if not found
     */
    // Temporarily disable caching to avoid ClassCastException
    // @Cacheable(value = "services", key = "#serviceId")
    public ServiceType findById(Integer serviceId) {
        logger.debug("Fetching service with ID: {} from database", serviceId);
        return serviceMapper.findById(serviceId);
    }

    /**
     * Find services by category (cached)
     * @param category The service category
     * @return List of services in the category
     */
    @Cacheable(value = "services", key = "'category:' + #category")
    public List<ServiceType> findByCategory(String category) {
        logger.debug("Fetching services with category: {} from database", category);
        return serviceMapper.findByCategory(category);
    }

    /**
     * Find services by type (cached)
     * @param type The service type
     * @return List of services of the type
     */
    @Cacheable(value = "services", key = "'type:' + #type")
    public List<ServiceType> findByType(String type) {
        logger.debug("Fetching services with type: {} from database", type);
        return serviceMapper.findByType(type);
    }

    /**
     * Add a new service (evicts cache)
     * @param service The service to add
     * @return The added service with ID
     */
    @Transactional
    @CacheEvict(value = "services", allEntries = true)
    public ServiceType addService(ServiceType service) {
        logger.debug("Adding new service: {}", service.getServiceType());
        serviceMapper.insert(service);
        return service;
    }

    /**
     * Update a service (evicts cache)
     * @param service The service to update
     * @return true if updated, false otherwise
     */
    @Transactional
    @CacheEvict(value = "services", allEntries = true)
    public boolean updateService(ServiceType service) {
        logger.debug("Updating service with ID: {}", service.getServiceId());
        return serviceMapper.update(service) > 0;
    }

    /**
     * Delete a service (evicts cache)
     * @param serviceId The ID of the service to delete
     * @return true if deleted, false otherwise
     */
    @Transactional
    @CacheEvict(value = "services", allEntries = true)
    public boolean deleteService(Integer serviceId) {
        logger.debug("Deleting service with ID: {}", serviceId);
        return serviceMapper.delete(serviceId) > 0;
    }
}
