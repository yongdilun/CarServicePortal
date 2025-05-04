package com.example.portal.controller;

import com.example.portal.model.Vehicle;
import com.example.portal.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getVehiclesByCustomerId(@RequestParam(required = false) Integer custId) {
        try {
            logger.info("Getting vehicles. custId={}", custId);

            if (custId == null) {
                // For testing purposes, return all vehicles if no custId is provided
                logger.info("No custId provided, returning all vehicles");
                List<Vehicle> allVehicles = vehicleService.findAllVehicles();
                logger.info("Found {} vehicles", allVehicles.size());
                return ResponseEntity.ok(allVehicles);
            }

            logger.info("Finding vehicles for custId={}", custId);
            List<Vehicle> vehicles = vehicleService.findVehiclesByCustomerId(custId);
            logger.info("Found {} vehicles for custId={}", vehicles.size(), custId);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            logger.error("Error getting vehicles", e);
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<?> addVehicle(@RequestBody Vehicle vehicle) {
        // Validate plate number is unique
        if (!vehicleService.isPlateNoAvailable(vehicle.getVehPlateno())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vehicle with this plate number already exists"));
        }

        // For testing purposes, if custId is not provided, use a default value
        if (vehicle.getCustId() == null) {
            vehicle.setCustId(10001); // Use the sample customer ID
        }

        Vehicle addedVehicle = vehicleService.addVehicle(vehicle);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id", addedVehicle.getVehId(),
            "message", "Vehicle added successfully"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicle(@PathVariable Integer id) {
        Vehicle vehicle = vehicleService.findById(id);
        if (vehicle == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable Integer id, @RequestBody Vehicle vehicle) {
        Vehicle existingVehicle = vehicleService.findById(id);
        if (existingVehicle == null) {
            return ResponseEntity.notFound().build();
        }

        // Check if the plate number is being changed and if it's already in use
        if (!existingVehicle.getVehPlateno().equals(vehicle.getVehPlateno()) &&
                !vehicleService.isPlateNoAvailable(vehicle.getVehPlateno())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vehicle with this plate number already exists"));
        }

        vehicle.setVehId(id);
        boolean updated = vehicleService.updateVehicle(vehicle);

        if (!updated) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update vehicle"));
        }

        return ResponseEntity.ok(Map.of(
            "id", vehicle.getVehId(),
            "message", "Vehicle updated successfully"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Integer id) {
        Vehicle existingVehicle = vehicleService.findById(id);
        if (existingVehicle == null) {
            return ResponseEntity.notFound().build();
        }

        boolean deleted = vehicleService.deleteVehicle(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete vehicle"));
        }

        return ResponseEntity.ok(Map.of(
            "message", "Vehicle deleted successfully"
        ));
    }
}
