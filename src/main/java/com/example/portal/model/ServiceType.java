package com.example.portal.model;

import lombok.Data;

@Data
public class ServiceType {
    private Integer serviceId;
    private String serviceType;
    private String serviceDesc;
    private String serviceCategory;
    private Double servicePrice;
    private Integer serviceDuration; // in minutes
}
