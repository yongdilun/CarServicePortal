package com.example.portal.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
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

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.username:}")
    private String redisUsername;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${spring.data.redis.ssl.enabled:false}")
    private boolean redisSslEnabled;

    /**
     * Create a Redis connection factory with SSL and authentication support
     */
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        try {
            // Configure Redis connection
            RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
            redisConfig.setHostName(redisHost);
            redisConfig.setPort(redisPort);

            // Set authentication if username and password are provided
            if (redisUsername != null && !redisUsername.isEmpty()) {
                redisConfig.setUsername(redisUsername);
            }

            if (redisPassword != null && !redisPassword.isEmpty()) {
                redisConfig.setPassword(redisPassword);
            }

            // Configure Lettuce client with SSL if enabled
            LettuceClientConfiguration.LettuceClientConfigurationBuilder builder =
                LettuceClientConfiguration.builder()
                    .commandTimeout(Duration.ofSeconds(5));

            if (redisSslEnabled) {
                logger.info("Enabling SSL for Redis connection to {}:{}", redisHost, redisPort);
                builder.useSsl();
            }

            LettuceConnectionFactory connectionFactory = new LettuceConnectionFactory(
                redisConfig, builder.build());

            logger.info("Configured Redis connection to {}:{} with SSL={}",
                redisHost, redisPort, redisSslEnabled);

            return connectionFactory;
        } catch (Exception e) {
            logger.error("Failed to create Redis connection factory", e);
            throw new RuntimeException("Failed to initialize Redis connection", e);
        }
    }

    /**
     * Configure ObjectMapper for proper serialization of Java 8 date/time types
     */
    @Bean
    public ObjectMapper redisObjectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return objectMapper;
    }

    /**
     * Configure Redis cache manager with different TTLs for different cache names
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        try {
            // Create a custom serializer with Java 8 date/time support
            GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper());

            // Default cache configuration
            RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(60))
                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer));

            // Build cache manager with specific TTLs for different caches
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(cacheConfig)
                    .withCacheConfiguration("services",
                            RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofHours(24))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer)))
                    .withCacheConfiguration("vehicles",
                            RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofHours(12))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer)))
                    .withCacheConfiguration("appointments",
                            RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofMinutes(30))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer)))
                    .withCacheConfiguration("outlets",
                            RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofHours(48))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer)))
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
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory, ObjectMapper redisObjectMapper) {
        try {
            RedisTemplate<String, Object> template = new RedisTemplate<>();
            template.setConnectionFactory(connectionFactory);

            // Use StringRedisSerializer for keys
            template.setKeySerializer(new StringRedisSerializer());
            template.setHashKeySerializer(new StringRedisSerializer());

            // Use Jackson serializer with Java 8 date/time support for values
            GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper);
            template.setValueSerializer(jsonSerializer);
            template.setHashValueSerializer(jsonSerializer);

            template.afterPropertiesSet();
            logger.info("Redis template configured successfully with Java 8 date/time support");
            return template;
        } catch (Exception e) {
            logger.error("Failed to create Redis template", e);
            throw new RuntimeException("Failed to initialize Redis template", e);
        }
    }
}
