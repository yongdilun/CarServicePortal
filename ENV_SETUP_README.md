# Environment Variables Setup

This project uses environment variables to manage sensitive configuration such as database credentials, API keys, and other settings. This approach keeps sensitive information out of the codebase and allows for different configurations in different environments.

## Setup Instructions

### 1. Create a `.env` file

Copy the example file to create your own environment file:

```bash
cp .env.example .env
```

### 2. Edit the `.env` file

Open the `.env` file in your editor and update the values with your actual configuration:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portal_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Server Configuration
SERVER_PORT=8080

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Security
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=86400000
```

### 3. Keep it secure

- The `.env` file is already included in `.gitignore` to prevent it from being committed to the repository
- Never commit your actual `.env` file with real credentials
- Each developer should create their own `.env` file locally

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_NAME | Database name | portal_db |
| DB_USERNAME | Database username | root |
| DB_PASSWORD | Database password | |
| SERVER_PORT | Application server port | 8080 |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| MAIL_HOST | SMTP mail host | smtp.gmail.com |
| MAIL_PORT | SMTP mail port | 587 |
| MAIL_USERNAME | Email username | your-email@gmail.com |
| MAIL_PASSWORD | Email password | your-app-password |
| JWT_SECRET | Secret key for JWT tokens | your-jwt-secret-key |
| JWT_EXPIRATION | JWT token expiration in milliseconds | 86400000 |

## How It Works

The application uses the `spring-dotenv` library to load environment variables from the `.env` file. These variables are then used in the `application.yml` configuration file using the syntax `${VARIABLE_NAME:default_value}`.

For example:
```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:portal_db}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:}
```

This means that if the environment variable is not set, the default value will be used.

## For Production Deployment

In production environments, you can:

1. Create a proper `.env` file on the server
2. Set environment variables directly in the hosting environment
3. Use a configuration service like Spring Cloud Config Server

## Troubleshooting

If you encounter issues with environment variables:

1. Make sure your `.env` file exists in the project root
2. Check that the variable names match exactly (they are case-sensitive)
3. Restart the application after changing the `.env` file
4. Check the application logs for any configuration errors
