# Redis Caching in Auto Service Portal

This document explains how Redis caching is implemented in the Auto Service Portal application, including configuration, cache creation, eviction strategies, and time-to-live (TTL) settings.

## Table of Contents

- [Overview](#overview)
- [Redis Configuration](#redis-configuration)
- [Cache Implementation](#cache-implementation)
- [Cache Annotations](#cache-annotations)
- [Cache Eviction](#cache-eviction)
- [Time-to-Live (TTL)](#time-to-live-ttl)
- [Monitoring and Management](#monitoring-and-management)
- [Troubleshooting](#troubleshooting)

## Overview

Redis is used in the Auto Service Portal as a distributed caching system to improve performance by storing frequently accessed data in memory. This reduces database load and speeds up response times for API requests.

Key benefits of Redis caching in our application:

1. **Performance Improvement**: Reduces database queries for frequently accessed data
2. **Reduced Database Load**: Minimizes the load on MySQL database
3. **Scalability**: Allows the application to handle more concurrent users
4. **Data Sharing**: Enables cache sharing across multiple application instances

## Redis Configuration

### Environment Variables

Redis connection settings are configured in the `.env` file:

```
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Spring Boot Configuration

The Redis connection is configured in `application.yml`:

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
  cache:
    type: redis
    redis:
      time-to-live: 3600000  # Default TTL: 1 hour (in milliseconds)
      cache-null-values: true
```

### Redis Configuration Class

The Redis configuration is defined in `RedisConfig.java`:

```java
@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))  // Default TTL: 1 hour
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
            .disableCachingNullValues();

        // Create different cache configurations for different cache names
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // Services cache: 2 hours TTL
        cacheConfigurations.put("services", 
            config.entryTtl(Duration.ofHours(2)));
        
        // Outlets cache: 6 hours TTL
        cacheConfigurations.put("outlets", 
            config.entryTtl(Duration.ofHours(6)));
        
        // User cache: 15 minutes TTL
        cacheConfigurations.put("users", 
            config.entryTtl(Duration.ofMinutes(15)));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }
}
```

## Cache Implementation

### Cached Entities

The following entities are cached in the application:

| Cache Name | Entity | TTL | Description |
|------------|--------|-----|-------------|
| `services` | ServiceType | 2 hours | Service types and details |
| `outlets` | ServiceOutlet | 6 hours | Service outlet information |
| `users` | User (Customer/Staff) | 15 minutes | User profile data |
| `appointments` | ServiceAppointment | 30 minutes | Appointment details |
| `vehicles` | Vehicle | 1 hour | Vehicle information |

### Service Layer Caching

Caching is implemented at the service layer. For example, in `ServiceService.java`:

```java
@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceMapper serviceMapper;

    @Cacheable(value = "services", key = "'all'")
    public List<ServiceType> findAllServices() {
        // This method will be cached with key "services::all"
        return serviceMapper.findAll();
    }

    @Cacheable(value = "services", key = "#serviceId")
    public ServiceType findById(Integer serviceId) {
        // This method will be cached with key "services::{serviceId}"
        return serviceMapper.findById(serviceId);
    }

    @CacheEvict(value = "services", allEntries = true)
    public ServiceType addService(ServiceType service) {
        // This method will evict all entries in the "services" cache
        serviceMapper.insert(service);
        return service;
    }
}
```

## Cache Annotations

Spring provides several annotations for cache management:

### @Cacheable

Used to cache method results. When a method is called, Spring checks if the result is already in the cache. If it is, the cached result is returned without executing the method.

```java
@Cacheable(value = "cacheName", key = "#paramName")
public Entity findByParam(String paramName) {
    // Method implementation
}
```

Parameters:
- `value`: The name of the cache
- `key`: The key used to store the result (SpEL expression)
- `condition`: Condition that determines if the result should be cached (SpEL expression)
- `unless`: Condition that determines if the result should NOT be cached (SpEL expression)

### @CacheEvict

Used to remove entries from the cache.

```java
@CacheEvict(value = "cacheName", key = "#entity.id")
public void update(Entity entity) {
    // Method implementation
}

@CacheEvict(value = "cacheName", allEntries = true)
public void clearCache() {
    // Method implementation
}
```

Parameters:
- `value`: The name of the cache
- `key`: The key to evict (SpEL expression)
- `allEntries`: If true, all entries in the cache are evicted
- `beforeInvocation`: If true, cache is evicted before method execution

### @CachePut

Used to update the cache without affecting method execution.

```java
@CachePut(value = "cacheName", key = "#result.id")
public Entity save(Entity entity) {
    // Method implementation
}
```

Parameters:
- `value`: The name of the cache
- `key`: The key used to store the result (SpEL expression)
- `condition`: Condition that determines if the result should be cached (SpEL expression)
- `unless`: Condition that determines if the result should NOT be cached (SpEL expression)

### @Caching

Used to combine multiple cache operations.

```java
@Caching(
    evict = {
        @CacheEvict(value = "cache1", key = "#entity.id"),
        @CacheEvict(value = "cache2", allEntries = true)
    },
    put = {
        @CachePut(value = "cache3", key = "#result.id")
    }
)
public Entity complexOperation(Entity entity) {
    // Method implementation
}
```

## Cache Eviction

Cache entries can be evicted in several ways:

### 1. Automatic Eviction

- **Time-based eviction**: Entries are automatically removed after their TTL expires
- **Memory-based eviction**: When Redis reaches its memory limit, it evicts entries based on its eviction policy

### 2. Programmatic Eviction

- **@CacheEvict annotation**: Removes specific entries or all entries in a cache
- **Direct Redis commands**: Using RedisTemplate to directly manipulate the cache

### 3. Eviction Strategies

In our application, we use the following eviction strategies:

- **Write operations**: Cache is evicted when data is modified
- **Bulk operations**: All cache entries are evicted when bulk operations are performed
- **Scheduled eviction**: Some caches are evicted on a schedule

Example of scheduled cache eviction:

```java
@Component
public class CacheEvictionScheduler {

    private final CacheManager cacheManager;

    public CacheEvictionScheduler(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @Scheduled(cron = "0 0 0 * * *") // Midnight every day
    public void evictAllCaches() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            cacheManager.getCache(cacheName).clear();
        });
    }
}
```

## Time-to-Live (TTL)

TTL defines how long a cache entry remains valid before being automatically removed.

### Setting Default TTL

Default TTL is set in the Redis configuration:

```java
RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
    .entryTtl(Duration.ofHours(1));  // Default TTL: 1 hour
```

### Setting TTL for Specific Caches

Different TTLs can be set for different caches:

```java
Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
cacheConfigurations.put("services", config.entryTtl(Duration.ofHours(2)));
cacheConfigurations.put("outlets", config.entryTl(Duration.ofHours(6)));
```

### TTL Considerations

When setting TTL values, consider:

1. **Data volatility**: How frequently the data changes
2. **Consistency requirements**: How important it is to have the latest data
3. **Access patterns**: How frequently the data is accessed
4. **Resource constraints**: Memory limitations of the Redis server

## Monitoring and Management

### Redis CLI Commands

Monitor and manage Redis caches using Redis CLI:

```bash
# Connect to Redis
redis-cli

# List all keys
KEYS *

# Get information about a key
TYPE services::1

# Get TTL of a key (in seconds)
TTL services::1

# Delete a specific key
DEL services::1

# Delete all keys matching a pattern
KEYS "services::*" | xargs redis-cli DEL

# Monitor Redis in real-time
MONITOR
```

### Spring Boot Actuator

Enable Redis metrics with Spring Boot Actuator:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,caches
```

Access cache metrics at: `/actuator/metrics/cache`

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Check Redis server is running
   - Verify connection settings in `.env` file
   - Ensure network connectivity between app and Redis server

2. **Serialization Issues**
   - Ensure cached objects are serializable
   - Check for circular references in cached objects
   - Verify Redis serialization configuration

3. **Cache Not Working**
   - Verify cache annotations are correctly applied
   - Check cache names match between annotations and configuration
   - Ensure caching is enabled with `@EnableCaching`

4. **Memory Issues**
   - Monitor Redis memory usage with `INFO memory`
   - Adjust TTL values to reduce memory consumption
   - Consider increasing Redis memory limit or implementing eviction policies

### Debugging

Enable Redis cache logging:

```yaml
logging:
  level:
    org.springframework.cache: TRACE
    org.springframework.data.redis: DEBUG
```
