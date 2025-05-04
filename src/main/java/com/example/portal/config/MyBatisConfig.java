package com.example.portal.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.example.portal.repository")
public class MyBatisConfig {
    // MyBatis configuration is handled through application.yml
    // This class is mainly for the @MapperScan annotation
}
