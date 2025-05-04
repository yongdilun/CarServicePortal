package com.example.portal.model;

import lombok.Data;

@Data
public class Vehicle {
    private Integer vehId;
    private String vehPlateno;
    private String vehModel;
    private String vehBrand;
    private String vehType;
    private Short vehYear;
    private Integer custId;

    // Relationship
    private Customer customer;
}
