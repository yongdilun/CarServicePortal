# Redis Functionality in Auto Service Portal

This document provides a comprehensive overview of how Redis is used throughout the Auto Service Portal application, including implementation details, use cases, and configuration options.

## Table of Contents

1. [Redis Configuration](#redis-configuration)
2. [Caching Implementation](#caching-implementation)
3. [Notification System](#notification-system)
4. [Session Management](#session-management)
5. [Data Structures Used](#data-structures-used)
6. [Key Naming Conventions](#key-naming-conventions)
7. [TTL Strategies](#ttl-strategies)
8. [Error Handling and Fallbacks](#error-handling-and-fallbacks)
9. [Testing Redis Functionality](#testing-redis-functionality)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Redis Configuration

### Basic Configuration

Redis is configured in the application through the following properties in `application.properties`:

```properties
# Redis Configuration
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.timeout=2000
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000
spring.cache.redis.cache-null-values=false

# Application Redis Settings
app.notifications.use-redis=true
```

### Redis Configuration Class

The `RedisConfig` class (`src/main/java/com/example/portal/config/RedisConfig.java`) provides the core Redis configuration:

```java
@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
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
                                .entryTtl(Duration.ofHours(24)))
                .withCacheConfiguration("vehicles", 
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofHours(12)))
                .withCacheConfiguration("appointments", 
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(30)))
                .withCacheConfiguration("outlets", 
                        RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofHours(48)))
                .build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
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
        return template;
    }
}
```

Key features of this configuration:
- Different TTL (Time-To-Live) values for different types of data
- JSON serialization for values
- String serialization for keys
- Configurable cache settings

## Caching Implementation

### Service Caching

The application uses Redis for caching service-related data through the `ServiceService` class:

```java
@Service
@RequiredArgsConstructor
public class ServiceService {

    @Cacheable(value = "services", key = "'all'")
    public List<ServiceType> findAllServices() {
        return serviceMapper.findAll();
    }

    @Cacheable(value = "services", key = "#serviceId")
    public ServiceType findById(Integer serviceId) {
        return serviceMapper.findById(serviceId);
    }

    @Cacheable(value = "services", key = "'category:' + #category")
    public List<ServiceType> findByCategory(String category) {
        return serviceMapper.findByCategory(category);
    }

    @CacheEvict(value = "services", allEntries = true)
    public ServiceType addService(ServiceType service) {
        serviceMapper.insert(service);
        return service;
    }

    @CacheEvict(value = "services", allEntries = true)
    public boolean updateService(ServiceType service) {
        return serviceMapper.update(service) > 0;
    }

    @CacheEvict(value = "services", allEntries = true)
    public boolean deleteService(Integer serviceId) {
        return serviceMapper.delete(serviceId) > 0;
    }
}
```

### Service Outlet Caching

Similar caching is implemented for service outlets through the `ServiceOutletService` class:

```java
@Service
@RequiredArgsConstructor
public class ServiceOutletService {

    @Cacheable(value = "outlets", key = "'all'")
    public List<ServiceOutlet> findAllOutlets() {
        return outletMapper.findAll();
    }

    @Cacheable(value = "outlets", key = "#outletId")
    public ServiceOutlet findById(Integer outletId) {
        return outletMapper.findById(outletId);
    }

    @Cacheable(value = "outlets", key = "'city:' + #city")
    public List<ServiceOutlet> findByCity(String city) {
        return outletMapper.findByCity(city);
    }

    @CacheEvict(value = "outlets", allEntries = true)
    public ServiceOutlet addOutlet(ServiceOutlet outlet) {
        outletMapper.insert(outlet);
        return outlet;
    }

    @CacheEvict(value = "outlets", allEntries = true)
    public boolean updateOutlet(ServiceOutlet outlet) {
        return outletMapper.update(outlet) > 0;
    }

    @CacheEvict(value = "outlets", allEntries = true)
    public boolean deleteOutlet(Integer outletId) {
        return outletMapper.delete(outletId) > 0;
    }
}
```

### Caching Annotations Used

The application uses the following Spring Cache annotations:

- `@Cacheable`: Caches the result of method execution
- `@CacheEvict`: Removes entries from the cache
- `@CachePut`: Updates the cache without affecting method execution
- `@Caching`: Combines multiple cache operations

## Notification System

### Redis Notification Service

The `RedisNotificationService` class provides Redis-based notification functionality:

```java
@Service
@RequiredArgsConstructor
public class RedisNotificationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public void storeNotification(Notification notification) {
        String key = getNotificationKey(notification.getUserType(), notification.getUserId(), notification.getNotificationId());
        redisTemplate.opsForValue().set(key, notification);
        
        // Add to user's notification list
        String listKey = getNotificationListKey(notification.getUserType(), notification.getUserId());
        redisTemplate.opsForList().leftPush(listKey, notification.getNotificationId().toString());
        
        // Set expiration for notifications (30 days)
        redisTemplate.expire(key, 30, TimeUnit.DAYS);
        redisTemplate.expire(listKey, 30, TimeUnit.DAYS);
    }

    public List<Notification> getUserNotifications(Integer userId, String userType) {
        String listKey = getNotificationListKey(userType, userId);
        List<Object> notificationIds = redisTemplate.opsForList().range(listKey, 0, -1);
        
        if (notificationIds == null || notificationIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Notification> notifications = new ArrayList<>();
        for (Object id : notificationIds) {
            String key = getNotificationKey(userType, userId, Integer.parseInt(id.toString()));
            Object notificationObj = redisTemplate.opsForValue().get(key);
            
            if (notificationObj != null) {
                if (notificationObj instanceof Notification) {
                    notifications.add((Notification) notificationObj);
                } else {
                    Notification notification = objectMapper.convertValue(notificationObj, Notification.class);
                    notifications.add(notification);
                }
            }
        }
        
        return notifications;
    }

    public void markNotificationAsRead(Integer notificationId, Integer userId, String userType) {
        String key = getNotificationKey(userType, userId, notificationId);
        Object notificationObj = redisTemplate.opsForValue().get(key);
        
        if (notificationObj != null) {
            Notification notification;
            if (notificationObj instanceof Notification) {
                notification = (Notification) notificationObj;
            } else {
                notification = objectMapper.convertValue(notificationObj, Notification.class);
            }
            
            notification.setRead(true);
            redisTemplate.opsForValue().set(key, notification);
        }
    }

    public List<Notification> getUnreadNotifications(Integer userId, String userType) {
        List<Notification> allNotifications = getUserNotifications(userId, userType);
        return allNotifications.stream()
                .filter(n -> !n.isRead())
                .toList();
    }

    public void deleteNotification(Integer notificationId, Integer userId, String userType) {
        String key = getNotificationKey(userType, userId, notificationId);
        String listKey = getNotificationListKey(userType, userId);
        
        redisTemplate.delete(key);
        redisTemplate.opsForList().remove(listKey, 0, notificationId.toString());
    }

    private String getNotificationKey(String userType, Integer userId, Integer notificationId) {
        return String.format("notification:%s:%d:%d", userType, userId, notificationId);
    }

    private String getNotificationListKey(String userType, Integer userId) {
        return String.format("notifications:%s:%d", userType, userId);
    }
}
```

### Hybrid Notification System

The application uses a hybrid approach for notifications through the `NotificationService` class:

```java
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;
    private final EmailService emailService;
    private final RedisNotificationService redisNotificationService;
    
    @Value("${app.notifications.use-redis:true}")
    private boolean useRedisNotifications;

    public Notification createNotification(Integer userId, String userType, String title, String message, String type, String link) {
        Notification notification = new Notification();
        // Set notification properties...
        
        // Store in database
        notificationMapper.insert(notification);
        
        // Store in Redis if enabled
        if (useRedisNotifications) {
            try {
                redisNotificationService.storeNotification(notification);
            } catch (Exception e) {
                logger.error("Failed to store notification in Redis", e);
                // Continue with database storage even if Redis fails
            }
        }
        
        return notification;
    }

    public List<Notification> getUserNotifications(Integer userId, String userType) {
        if (useRedisNotifications) {
            try {
                List<Notification> redisNotifications = redisNotificationService.getUserNotifications(userId, userType);
                if (redisNotifications != null && !redisNotifications.isEmpty()) {
                    return redisNotifications;
                }
            } catch (Exception e) {
                logger.error("Failed to get notifications from Redis, falling back to database", e);
            }
        }
        
        // Fall back to database
        return notificationMapper.findByUser(userId, userType);
    }

    // Other methods with similar hybrid approach...
}
```

Key features of the notification system:
- Dual storage in both Redis and database
- Configurable through `app.notifications.use-redis` property
- Fallback to database if Redis operations fail
- Different notification types (appointment, service, etc.)
- Read/unread status tracking

## Session Management

The application can use Redis for session management through Spring Session:

```java
@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 3600)
public class SessionConfig {

    @Bean
    public HttpSessionIdResolver httpSessionIdResolver() {
        return HeaderHttpSessionIdResolver.xAuthToken();
    }
}
```

This configuration:
- Stores session data in Redis
- Sets a 1-hour (3600 seconds) session timeout
- Uses the X-Auth-Token header for session tracking

## Data Structures Used

The application uses various Redis data structures:

### String (Key-Value)
Used for:
- Caching individual objects (services, outlets)
- Storing individual notifications

Example:
```java
redisTemplate.opsForValue().set(key, notification);
```

### Lists
Used for:
- Storing user notification IDs
- Maintaining ordered collections

Example:
```java
redisTemplate.opsForList().leftPush(listKey, notification.getNotificationId().toString());
redisTemplate.opsForList().range(listKey, 0, -1);
```

### Hashes
Used for:
- Storing complex objects with multiple fields
- Session data

Example (implicit through Spring Session):
```java
// Spring Session uses HMSET internally
```

## Key Naming Conventions

The application follows these key naming conventions:

### For Notifications
- Individual notification: `notification:{userType}:{userId}:{notificationId}`
- User's notification list: `notifications:{userType}:{userId}`

### For Caching
- All services: `services::all`
- Service by ID: `services::{id}`
- Service by category: `services::category:{category}`
- All outlets: `outlets::all`
- Outlet by ID: `outlets::{id}`
- Outlet by city: `outlets::city:{city}`

### For Sessions
- Session data: `spring:session:sessions:{sessionId}`
- Session expiration: `spring:session:expirations:{expirationTime}:{sessionId}`

## TTL Strategies

Different types of data have different TTL (Time-To-Live) values:

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Services | 24 hours | Service information changes infrequently |
| Vehicles | 12 hours | Vehicle information may change more often |
| Appointments | 30 minutes | Appointment status can change frequently |
| Outlets | 48 hours | Outlet information is very stable |
| Notifications | 30 days | Keep recent history but eventually clean up |
| Sessions | 1 hour | Balance between security and user convenience |

TTL is implemented using:
```java
redisTemplate.expire(key, ttl, TimeUnit.DAYS);
```

Or through configuration:
```java
RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(24))
```

## Error Handling and Fallbacks

The application implements robust error handling for Redis operations:

### Try-Catch Blocks
```java
try {
    // Redis operation
} catch (Exception e) {
    logger.error("Redis operation failed", e);
    // Fallback logic
}
```

### Fallback to Database
```java
if (useRedisNotifications) {
    try {
        // Try Redis first
        // ...
    } catch (Exception e) {
        // Log error
    }
}
// Fall back to database
return notificationMapper.findByUser(userId, userType);
```

### Conditional Redis Usage
```java
if (useRedisNotifications) {
    // Use Redis
} else {
    // Use database directly
}
```

## Testing Redis Functionality

The application includes comprehensive tests for Redis functionality:

### Redis Caching Tests
```java
@SpringBootTest
@ActiveProfiles("test")
public class RedisCachingTest {

    @Test
    void testFindAllServices_CacheHit() {
        // Test that second call hits cache
    }

    @Test
    void testCacheEviction_AfterUpdate() {
        // Test that cache is evicted after updates
    }
}
```

### Redis Notification Tests
```java
@SpringBootTest
@ActiveProfiles("test")
public class RedisNotificationServiceTest {

    @Test
    void testStoreAndRetrieveNotification() {
        // Test storing and retrieving notifications
    }

    @Test
    void testMarkNotificationAsRead() {
        // Test marking notifications as read
    }
}
```

### Embedded Redis for Testing
```java
@TestConfiguration
@Profile("test")
public class TestRedisConfiguration {

    private RedisServer redisServer;

    @PostConstruct
    public void startRedis() throws IOException {
        redisServer = RedisServer.builder()
                .port(6370) // Different port for tests
                .setting("maxmemory 128M")
                .build();
        redisServer.start();
    }

    @PreDestroy
    public void stopRedis() {
        if (redisServer != null && redisServer.isActive()) {
            redisServer.stop();
        }
    }
}
```

## Monitoring and Maintenance

### Monitoring Redis

The application can be monitored using:

1. **Redis CLI Commands**:
   ```
   redis-cli info
   redis-cli monitor
   ```

2. **Spring Boot Actuator**:
   ```java
   @Configuration
   public class ActuatorConfig {
       // Redis health indicators
   }
   ```

3. **Logging**:
   ```java
   logger.debug("Redis operation completed: {}", result);
   logger.error("Redis operation failed", exception);
   ```

### Maintenance Tasks

1. **Cache Invalidation**:
   ```java
   @Scheduled(cron = "0 0 0 * * *") // Daily at midnight
   public void invalidateStaleCache() {
       cacheManager.getCache("services").clear();
   }
   ```

2. **Redis Backup**:
   ```
   redis-cli SAVE
   ```

3. **Memory Management**:
   ```
   redis-cli CONFIG SET maxmemory 1gb
   redis-cli CONFIG SET maxmemory-policy allkeys-lru
   ```

---

This document provides a comprehensive overview of how Redis is used in the Auto Service Portal application. The implementation follows best practices for caching, notification management, and session handling, with appropriate error handling and fallback mechanisms to ensure system reliability.
