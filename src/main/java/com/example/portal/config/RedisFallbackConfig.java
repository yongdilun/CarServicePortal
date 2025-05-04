package com.example.portal.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.annotation.Order;

/**
 * Fallback configuration for when Redis is not available
 * This will be used if app.cache.use-redis=false or if Redis connection fails
 */
@Configuration
@EnableCaching
@ConditionalOnProperty(name = "app.cache.use-redis", havingValue = "false")
@Order(1)
public class RedisFallbackConfig {

    private static final Logger logger = LoggerFactory.getLogger(RedisFallbackConfig.class);

    @Bean
    @Primary
    public CacheManager fallbackCacheManager() {
        logger.info("Using fallback in-memory cache manager");
        return new ConcurrentMapCacheManager(
                "services", 
                "vehicles", 
                "appointments", 
                "outlets"
        );
    }
}
