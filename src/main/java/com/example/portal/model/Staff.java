package com.example.portal.model;

import lombok.Data;

@Data
public class Staff {
    private Integer staffId;
    private String staffName;
    private String staffRole;
    private String staffPhone;
    private String staffPassword;
    private Integer outletId;

    // Relationship
    private ServiceOutlet outlet;
}
