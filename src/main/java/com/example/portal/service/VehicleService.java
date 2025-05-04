package com.example.portal.service;

import com.example.portal.model.Vehicle;
import com.example.portal.repository.VehicleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleMapper vehicleMapper;

    public Vehicle findById(Integer vehId) {
        return vehicleMapper.findById(vehId);
    }

    public Vehicle findByPlateNo(String plateNo) {
        return vehicleMapper.findByPlateNo(plateNo);
    }

    public List<Vehicle> findVehiclesByCustomerId(Integer custId) {
        return vehicleMapper.findByCustomerId(custId);
    }

    public List<Vehicle> findAllVehicles() {
        return vehicleMapper.findAll();
    }

    @Transactional
    public Vehicle addVehicle(Vehicle vehicle) {
        vehicleMapper.insert(vehicle);
        return vehicle;
    }

    @Transactional
    public boolean updateVehicle(Vehicle vehicle) {
        return vehicleMapper.update(vehicle) > 0;
    }

    @Transactional
    public boolean deleteVehicle(Integer vehId) {
        return vehicleMapper.delete(vehId) > 0;
    }

    public boolean isPlateNoAvailable(String plateNo) {
        return vehicleMapper.findByPlateNo(plateNo) == null;
    }
}
