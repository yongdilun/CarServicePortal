package com.example.portal.controller;

import com.example.portal.model.ServiceType;
import com.example.portal.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    public ResponseEntity<List<ServiceType>> getAllServices() {
        List<ServiceType> services = serviceService.findAllServices();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceById(@PathVariable Integer id) {
        ServiceType service = serviceService.findById(id);
        if (service == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(service);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ServiceType>> getServicesByCategory(@PathVariable String category) {
        List<ServiceType> services = serviceService.findByCategory(category);
        return ResponseEntity.ok(services);
    }

    @PostMapping
    public ResponseEntity<?> addService(@RequestBody ServiceType service) {
        ServiceType addedService = serviceService.addService(service);

        Map<String, Object> response = new HashMap<>();
        response.put("id", addedService.getServiceId());
        response.put("message", "Service added successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Integer id, @RequestBody ServiceType service) {
        ServiceType existingService = serviceService.findById(id);
        if (existingService == null) {
            return ResponseEntity.notFound().build();
        }

        service.setServiceId(id);
        boolean updated = serviceService.updateService(service);

        if (!updated) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update service"));
        }

        return ResponseEntity.ok(Map.of(
            "id", service.getServiceId(),
            "message", "Service updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Integer id) {
        ServiceType existingService = serviceService.findById(id);
        if (existingService == null) {
            return ResponseEntity.notFound().build();
        }

        boolean deleted = serviceService.deleteService(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete service"));
        }

        return ResponseEntity.ok(Map.of(
            "message", "Service deleted successfully"
        ));
    }
}
