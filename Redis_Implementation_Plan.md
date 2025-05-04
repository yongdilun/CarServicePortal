# Redis Implementation Plan for Auto Service Portal

This document outlines a comprehensive plan for implementing Redis in the Auto Service Portal application. Redis will be used for caching, session management, and real-time features to improve performance and user experience.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Implementation Areas](#implementation-areas)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Testing](#testing)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Introduction

Redis is an in-memory data structure store that can be used as a database, cache, and message broker. In our Auto Service Portal application, we'll leverage Redis for:

- **Caching**: To reduce database load and improve response times
- **Session Management**: For secure and scalable user sessions
- **Rate Limiting**: To protect APIs from abuse
- **Real-time Features**: For notifications and live updates

## Prerequisites

Before implementing Redis, ensure the following prerequisites are met:

1. **Redis Server**:
   - Install Redis locally for development
   - For production, consider using Redis Cloud, AWS ElastiCache, or a similar service

2. **Dependencies**:
   - Spring Boot Redis dependencies (already included in pom.xml)
   - Redis client library (Spring Data Redis)

3. **Configuration**:
   - Redis connection settings in application properties
   - Redis configuration class

## Implementation Areas

### 1. Caching

We'll implement caching for:

- Service listings
- Vehicle information
- Appointment schedules
- User profiles (excluding sensitive information)

### 2. Session Management

- Store user sessions in Redis
- Implement token-based authentication with Redis

### 3. Rate Limiting

- Protect login and registration endpoints
- Limit appointment booking requests

### 4. Real-time Features

- Implement notification system for appointment updates
- Enable real-time status updates for ongoing services

## Step-by-Step Implementation

### Step 1: Configure Redis Connection

1. **Update application.properties**:

```properties
# Redis Configuration
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=  # Add password if needed
spring.data.redis.timeout=2000
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000
spring.cache.redis.cache-null-values=false
```

2. **Create/Update Redis Configuration Class**:

```java
package com.example.portal.config;

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

@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(60))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(cacheConfig)
                .withCacheConfiguration("services", RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(24)))
                .withCacheConfiguration("vehicles", RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(12)))
                .withCacheConfiguration("appointments", RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)))
                .build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }
}
```

### Step 2: Implement Caching for Services

1. **Update Service Repository or Service Layer**:

```java
package com.example.portal.service;

import com.example.portal.model.Service;
import com.example.portal.repository.ServiceRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ServiceService {

    private final ServiceRepository serviceRepository;

    public ServiceService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Cacheable(value = "services", key = "'all'")
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    @Cacheable(value = "services", key = "#id")
    public Service getServiceById(Long id) {
        return serviceRepository.findById(id);
    }

    @CacheEvict(value = "services", allEntries = true)
    public void addService(Service service) {
        serviceRepository.save(service);
    }

    @CacheEvict(value = "services", allEntries = true)
    public void updateService(Service service) {
        serviceRepository.update(service);
    }

    @CacheEvict(value = "services", allEntries = true)
    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
}
```

### Step 3: Implement Session Management with Redis

1. **Create Session Configuration**:

```java
package com.example.portal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.session.web.http.HeaderHttpSessionIdResolver;
import org.springframework.session.web.http.HttpSessionIdResolver;

@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 3600)
public class SessionConfig {

    @Bean
    public HttpSessionIdResolver httpSessionIdResolver() {
        return HeaderHttpSessionIdResolver.xAuthToken();
    }
}
```

2. **Add Spring Session Redis Dependency to pom.xml**:

```xml
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

### Step 4: Implement Rate Limiting

1. **Create Rate Limiter Service**:

```java
package com.example.portal.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ValueOperations<String, Object> valueOps;

    public RateLimiterService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.valueOps = redisTemplate.opsForValue();
    }

    public boolean allowRequest(String key, int limit, int windowInSeconds) {
        String redisKey = "rate_limit:" + key;
        
        Long count = valueOps.increment(redisKey);
        
        if (count == 1) {
            redisTemplate.expire(redisKey, windowInSeconds, TimeUnit.SECONDS);
        }
        
        return count <= limit;
    }
}
```

2. **Create Rate Limiting Interceptor**:

```java
package com.example.portal.interceptor;

import com.example.portal.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.HandlerInterceptor;

public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiterService rateLimiterService;
    private final int limit;
    private final int windowInSeconds;

    public RateLimitInterceptor(RateLimiterService rateLimiterService, int limit, int windowInSeconds) {
        this.rateLimiterService = rateLimiterService;
        this.limit = limit;
        this.windowInSeconds = windowInSeconds;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientId = request.getRemoteAddr();
        String requestUri = request.getRequestURI();
        String key = clientId + ":" + requestUri;
        
        boolean allowed = rateLimiterService.allowRequest(key, limit, windowInSeconds);
        
        if (!allowed) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too many requests");
            return false;
        }
        
        return true;
    }
}
```

3. **Register the Interceptor**:

```java
package com.example.portal.config;

import com.example.portal.interceptor.RateLimitInterceptor;
import com.example.portal.service.RateLimiterService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final RateLimiterService rateLimiterService;

    public WebConfig(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Rate limit for login attempts: 5 requests per minute
        registry.addInterceptor(new RateLimitInterceptor(rateLimiterService, 5, 60))
                .addPathPatterns("/api/auth/login");
        
        // Rate limit for registration: 3 requests per 5 minutes
        registry.addInterceptor(new RateLimitInterceptor(rateLimiterService, 3, 300))
                .addPathPatterns("/api/auth/register/**");
        
        // Rate limit for appointment booking: 10 requests per hour
        registry.addInterceptor(new RateLimitInterceptor(rateLimiterService, 10, 3600))
                .addPathPatterns("/api/customer/appointments");
    }
}
```

### Step 5: Implement Real-time Notifications

1. **Create Notification Service**:

```java
package com.example.portal.service;

import com.example.portal.model.Notification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final RedisTemplate<String, Object> redisTemplate;

    public NotificationService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void sendNotification(String userId, Notification notification) {
        String channel = "notifications:" + userId;
        redisTemplate.convertAndSend(channel, notification);
        
        // Also store in a list for retrieval later
        String key = "user:notifications:" + userId;
        redisTemplate.opsForList().leftPush(key, notification);
        redisTemplate.opsForList().trim(key, 0, 99); // Keep only the latest 100 notifications
    }

    public List<Notification> getUserNotifications(String userId, int limit) {
        String key = "user:notifications:" + userId;
        return redisTemplate.opsForList().range(key, 0, limit - 1)
                .stream()
                .map(obj -> (Notification) obj)
                .collect(Collectors.toList());
    }

    public void markNotificationAsRead(String userId, String notificationId) {
        // Implementation depends on how notifications are stored
    }
}
```

2. **Create Redis Message Listener**:

```java
package com.example.portal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class RedisMessageConfig {

    @Bean
    RedisMessageListenerContainer container(RedisConnectionFactory connectionFactory,
                                            MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(listenerAdapter, new PatternTopic("notifications:*"));
        return container;
    }

    @Bean
    MessageListenerAdapter listenerAdapter(NotificationListener listener) {
        return new MessageListenerAdapter(listener, "onMessage");
    }

    @Bean
    NotificationListener notificationListener() {
        return new NotificationListener();
    }
}
```

3. **Create Notification Listener**:

```java
package com.example.portal.listener;

import com.example.portal.model.Notification;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    private static final Logger logger = LoggerFactory.getLogger(NotificationListener.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void onMessage(String message, String channel) {
        try {
            Notification notification = objectMapper.readValue(message, Notification.class);
            logger.info("Received notification on channel {}: {}", channel, notification);
            
            // Here you would typically send the notification to connected clients
            // via WebSocket or Server-Sent Events
        } catch (Exception e) {
            logger.error("Error processing notification message", e);
        }
    }
}
```

### Step 6: Implement WebSocket for Real-time Updates

1. **Add WebSocket Dependencies**:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

2. **Create WebSocket Configuration**:

```java
package com.example.portal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
```

3. **Create WebSocket Controller**:

```java
package com.example.portal.controller;

import com.example.portal.model.Notification;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/notification")
    @SendTo("/topic/notifications")
    public Notification broadcastNotification(Notification notification) {
        return notification;
    }

    // Method to be called from other services to send notifications
    public void sendNotificationToUser(String userId, Notification notification) {
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                notification
        );
    }
}
```

## Testing

### 1. Unit Testing Redis Components

Create unit tests for Redis-related components:

```java
package com.example.portal.service;

import com.example.portal.model.Service;
import com.example.portal.repository.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@SpringBootTest
public class ServiceServiceTest {

    @Autowired
    private ServiceService serviceService;

    @Autowired
    private CacheManager cacheManager;

    @MockBean
    private ServiceRepository serviceRepository;

    @BeforeEach
    void setUp() {
        // Clear cache before each test
        cacheManager.getCache("services").clear();
    }

    @Test
    void testGetAllServices_CacheHit() {
        // Arrange
        List<Service> services = Arrays.asList(
                new Service(1L, "Oil Change", "Regular oil change service", 50.0),
                new Service(2L, "Brake Inspection", "Inspect and adjust brakes", 75.0)
        );
        when(serviceRepository.findAll()).thenReturn(services);

        // Act - First call should hit the repository
        List<Service> result1 = serviceService.getAllServices();
        
        // Act - Second call should hit the cache
        List<Service> result2 = serviceService.getAllServices();

        // Assert
        assertEquals(2, result1.size());
        assertEquals(2, result2.size());
        verify(serviceRepository, times(1)).findAll(); // Repository should be called only once
    }
}
```

### 2. Integration Testing

Create integration tests to verify Redis functionality:

```java
package com.example.portal;

import com.example.portal.model.Service;
import com.example.portal.service.ServiceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Testcontainers
public class RedisIntegrationTest {

    @Container
    public static GenericContainer<?> redis = new GenericContainer<>("redis:6.2-alpine")
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void redisProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", redis::getFirstMappedPort);
    }

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ServiceService serviceService;

    @Test
    void testRedisConnection() {
        // Arrange
        String key = "test:key";
        String value = "test-value";

        // Act
        redisTemplate.opsForValue().set(key, value);
        String retrievedValue = (String) redisTemplate.opsForValue().get(key);

        // Assert
        assertEquals(value, retrievedValue);
    }

    @Test
    void testServiceCaching() {
        // This test assumes your database is set up with test data
        // or you've mocked the repository layer
        
        // Act
        Service service = serviceService.getServiceById(1L);
        
        // Assert
        assertNotNull(service);
        
        // Verify it's in the cache
        Object cachedService = redisTemplate.opsForValue().get("services::1");
        assertNotNull(cachedService);
    }
}
```

## Monitoring and Maintenance

### 1. Redis Monitoring

- Use Redis CLI commands for basic monitoring:
  ```
  redis-cli info
  redis-cli monitor
  ```

- For production, consider using:
  - Redis Insight
  - Prometheus with Redis Exporter
  - Grafana dashboards for Redis

### 2. Key Metrics to Monitor

- Memory usage
- Hit/miss ratio for caches
- Connection count
- Command latency
- Eviction rate

### 3. Maintenance Tasks

- Regular backups
- Periodic cache invalidation for stale data
- Redis version upgrades
- Security audits

## Best Practices

### 1. Key Naming Conventions

Use a consistent naming convention for Redis keys:

- Use colon `:` as a separator
- Include the entity type in the key
- Examples:
  - `user:profile:123`
  - `service:details:456`
  - `appointment:status:789`

### 2. TTL (Time-to-Live) Strategy

- Set appropriate TTL values based on data volatility
- Frequently changing data: shorter TTL
- Static data: longer TTL
- Consider business hours for appointment-related caches

### 3. Serialization

- Use JSON serialization for readability and debugging
- Consider using Protocol Buffers or MessagePack for better performance in production

### 4. Security

- Enable Redis authentication
- Use TLS for Redis connections in production
- Restrict Redis access to application servers only
- Never expose Redis directly to the internet

## Troubleshooting

### Common Issues and Solutions

1. **Connection Refused**
   - Check if Redis server is running
   - Verify host and port settings
   - Check firewall rules

2. **Out of Memory**
   - Increase Redis memory limit
   - Implement key eviction policies
   - Review cache TTLs

3. **Slow Performance**
   - Monitor slow log: `redis-cli slowlog get 10`
   - Check for expensive operations
   - Consider Redis cluster for scaling

4. **Serialization Errors**
   - Ensure all cached objects are serializable
   - Check for circular references
   - Use appropriate serializers

5. **Cache Inconsistency**
   - Implement proper cache eviction on updates
   - Use cache versioning
   - Consider using cache-aside pattern for critical data

---

This implementation plan provides a comprehensive approach to integrating Redis into the Auto Service Portal application. By following these steps, you'll be able to leverage Redis for caching, session management, rate limiting, and real-time features, resulting in improved performance and user experience.
