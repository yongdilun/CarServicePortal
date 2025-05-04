package com.example.portal.model;

import lombok.Data;

@Data
public class ServiceOutlet {
    private Integer outletId;
    private String outletName;
    private String outletAddress;
    private String outletCity;
    private String outletState;
    private String outletPostalCode;
}
