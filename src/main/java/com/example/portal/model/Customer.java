package com.example.portal.model;

import lombok.Data;

@Data
public class Customer {
    private Integer custId;
    private String custName;
    private String custPhone;
    private String custEmail;
    private String custAddress;
    private String custPassword;
}
