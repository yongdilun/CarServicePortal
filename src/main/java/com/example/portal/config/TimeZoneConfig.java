package com.example.portal.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.TimeZone;

@Configuration
public class TimeZoneConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(TimeZoneConfig.class);
    
    @PostConstruct
    public void init() {
        // Set the default timezone to Malaysia (Kuala Lumpur)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kuala_Lumpur"));
        logger.info("Application timezone set to: {}", TimeZone.getDefault().getID());
    }
}
