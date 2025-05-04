package com.example.portal.config;

import com.example.portal.interceptor.RoleBasedAccessInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebMvcConfig.class);
    private final RoleBasedAccessInterceptor roleBasedAccessInterceptor;

    public WebMvcConfig(RoleBasedAccessInterceptor roleBasedAccessInterceptor) {
        this.roleBasedAccessInterceptor = roleBasedAccessInterceptor;
        logger.info("WebMvcConfig initialized");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        logger.info("Registering RoleBasedAccessInterceptor");
        registry.addInterceptor(roleBasedAccessInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                    "/api/auth/**",
                    "/api/public/**",
                    "/api/services/**",
                    "/api/outlets/**",
                    "/api/customer/vehicles/**",
                    "/api/customer/appointments/**",
                    "/api/customer/appointments",
                    "/api/notifications/**",
                    "/api/staff/appointments/**",
                    "/api/staff/outlet/**",
                    "/api/staff/schedule/**",
                    "/api/staff/services/**",
                    "/api/reports/**",

                    // Explicitly exclude appointment details endpoints
                    "/api/staff/appointments/{id}",
                    "/api/customer/appointments/{id}",
                    "/api/appointments/{id}"
                );
        logger.info("RoleBasedAccessInterceptor registered successfully");
    }
}
