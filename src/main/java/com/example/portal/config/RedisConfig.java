package com.example.portal.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Redis configuration for caching and data storage
 */
@Configuration
@EnableCaching
public class RedisConfig {

    private static final Logger logger = LoggerFactory.getLogger(RedisConfig.class);

    /**
     * Configure Redis cache manager with different TTLs for different cache names
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        try {
            // Default cache configuration
            RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(60))
                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                            new GenericJackson2JsonRedisSerializer()));

            // Build cache manager with specific TTLs for different caches
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(cacheConfig)
                    .withCacheConfiguration("services",
                            RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofHours(24))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                                            new GenericJackson2JsonRedisSerializer())))
                    .withCacheConfiguration("vehicles",
                            RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofHours(12))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                                            new GenericJackson2JsonRedisSerializer())))
                    .withCacheConfiguration("appointments",
                            RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofMinutes(30))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                                            new GenericJackson2JsonRedisSerializer())))
                    .withCacheConfiguration("outlets",
                            RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofHours(48))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                                            new GenericJackson2JsonRedisSerializer())))
                    .build();
        } catch (Exception e) {
            logger.error("Failed to create Redis cache manager. Falling back to no caching.", e);
            throw new RuntimeException("Failed to initialize Redis cache manager", e);
        }
    }

    /**
     * Configure Redis template for general-purpose operations
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        try {
            RedisTemplate<String, Object> template = new RedisTemplate<>();
            template.setConnectionFactory(connectionFactory);

            // Use StringRedisSerializer for keys
            template.setKeySerializer(new StringRedisSerializer());
            template.setHashKeySerializer(new StringRedisSerializer());

            // Use Jackson serializer for values
            GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();
            template.setValueSerializer(jsonSerializer);
            template.setHashValueSerializer(jsonSerializer);

            template.afterPropertiesSet();
            logger.info("Redis template configured successfully");
            return template;
        } catch (Exception e) {
            logger.error("Failed to create Redis template", e);
            throw new RuntimeException("Failed to initialize Redis template", e);
        }
    }
}
