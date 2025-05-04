package com.example.portal.model;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class ServiceAppointment {
    private Integer appointmentId;
    private Integer custId;
    private Integer serviceId;
    private Integer outletId;
    private Integer timeId;
    private Integer vehId;
    private Integer staffId;
    private BigDecimal appointmentCost;
    private Integer appointmentDuration;
    private String appointmentStatus;
    private LocalTime estimatedFinishTime;

    // Relationships
    private Customer customer;
    private ServiceType service;
    private ServiceOutlet outlet;
    private TimeSlot timeSlot;
    private Vehicle vehicle;
    private Staff staff;
}
