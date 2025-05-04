package com.example.portal.service;

import com.example.portal.model.ServiceType;
import com.example.portal.repository.ServiceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceMapper serviceMapper;

    public List<ServiceType> findAllServices() {
        return serviceMapper.findAll();
    }

    public ServiceType findById(Integer serviceId) {
        return serviceMapper.findById(serviceId);
    }

    public List<ServiceType> findByCategory(String category) {
        return serviceMapper.findByCategory(category);
    }

    public List<ServiceType> findByType(String type) {
        return serviceMapper.findByType(type);
    }

    @Transactional
    public ServiceType addService(ServiceType service) {
        serviceMapper.insert(service);
        return service;
    }

    @Transactional
    public boolean updateService(ServiceType service) {
        return serviceMapper.update(service) > 0;
    }

    @Transactional
    public boolean deleteService(Integer serviceId) {
        return serviceMapper.delete(serviceId) > 0;
    }
}
