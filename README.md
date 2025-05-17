# Auto Service Portal

A comprehensive full-stack application for managing auto service appointments, built with Spring Boot, MySQL, MyBatis, and Redis for the backend, and React (TypeScript), Axios, Vite, and Tailwind CSS for the frontend.

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.4-brightgreen" alt="Spring Boot">
  <img src="https://img.shields.io/badge/React-18-blue" alt="React">
  <img src="https://img.shields.io/badge/MySQL-8.0-orange" alt="MySQL">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3.0-blueviolet" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

Auto Service Portal is a comprehensive platform designed to streamline the management of automotive service appointments. It provides separate interfaces for customers and staff, allowing customers to book and manage service appointments while enabling staff to efficiently handle service scheduling, customer management, and service delivery.

The application follows a modern microservices architecture with a clear separation between the frontend and backend components. It implements best practices for security, caching, and database management.

## Features

### Customer Features

| Feature | Description |
|---------|-------------|
| **User Authentication** | Secure login/signup system using username and password |
| **Vehicle Management** | Add, edit, and delete vehicles in the customer's profile |
| **Appointment Booking** | Book service appointments by selecting service type, outlet, date, and time |
| **Appointment Tracking** | View and track the status of current and past appointments |
| **Notifications** | Receive real-time notifications for appointment updates |
| **Profile Management** | Update personal information and preferences |

### Staff Features

| Feature | Description |
|---------|-------------|
| **Staff Authentication** | Secure login system with role-based access control |
| **Appointment Management** | View, confirm, start, complete, and cancel appointments |
| **Schedule Visualization** | View daily schedule in a graphical time-based interface |
| **Customer Management** | Access customer information and service history |
| **Service Management** | Manage service types, durations, and pricing |
| **Outlet Management** | Manage service outlet information and staff assignments |

### System Features

| Feature | Description |
|---------|-------------|
| **Role-Based Access Control** | Different access levels for guests, customers, and staff |
| **Responsive Design** | Mobile-friendly interface that works on all devices |
| **Data Caching** | Redis-based caching for improved performance |
| **Email Notifications** | Automated email notifications for important events |
| **Secure API** | JWT-based API authentication and authorization |
| **Animated UI** | Modern UI with animations and transitions |

## System Architecture

The Auto Service Portal follows a layered architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Presentation  │     │    Business     │     │      Data       │
│      Layer      │◄────┤      Layer      │◄────┤     Layer       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲                       ▲
        │                       │                       │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend │     │  Spring Boot    │     │  MySQL Database │
│  (TypeScript)   │     │  (Java)         │     │  Redis Cache    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                      React Frontend                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Pages    │  │  Components │  │    Context API      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Hooks    │  │    Utils    │  │    API Services     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                     Spring Boot Backend                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Controllers │  │  Services   │  │     Repositories    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Models    │  │   Config    │  │      Security       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                      Data Storage                           │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │      MySQL Database     │  │      Redis Cache          │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Programming Language |
| Spring Boot | 3.4.4 | Application Framework |
| Spring Security | 3.4.4 | Authentication & Authorization |
| MyBatis | 3.0.3 | ORM Framework |
| MySQL | 8.0 | Relational Database |
| Redis | 6.0 | Caching |
| Spring Data Redis | 3.4.4 | Redis Integration |
| Spring Mail | 3.4.4 | Email Notifications |
| Maven | 3.8 | Build Tool |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI Library |
| TypeScript | 5.0 | Type-Safe JavaScript |
| Vite | 4.0 | Build Tool |
| Tailwind CSS | 3.0 | CSS Framework |
| Axios | 1.3 | HTTP Client |
| React Router | 6.8 | Routing |
| Context API | - | State Management |
| React Hook Form | 7.43 | Form Handling |

### Development & Deployment

| Technology | Purpose |
|------------|---------|
| Git | Version Control |
| GitHub Actions | CI/CD |


## Project Structure

### Backend Structure

```
src/main/java/com/example/portal/
├── config/                 # Configuration classes
│   ├── SecurityConfig.java # Security configuration
│   ├── RedisConfig.java    # Redis configuration
│   └── WebMvcConfig.java   # MVC configuration
├── controller/             # REST API controllers
│   ├── AuthController.java
│   ├── CustomerController.java
│   ├── StaffController.java
│   └── ...
├── model/                  # Data models
│   ├── Customer.java
│   ├── Staff.java
│   ├── Vehicle.java
│   └── ...
├── repository/             # Data access layer
│   ├── CustomerMapper.java
│   ├── StaffMapper.java
│   ├── VehicleMapper.java
│   └── ...
├── service/                # Business logic
│   ├── AuthService.java
│   ├── CustomerService.java
│   ├── EmailService.java
│   └── ...
├── security/               # Security components
│   ├── JwtTokenProvider.java
│   ├── UserDetailsServiceImpl.java
│   └── ...
├── util/                   # Utility classes
│   ├── DateTimeUtil.java
│   └── ...
└── PortalApplication.java  # Main application class
```

### Frontend Structure

```
client/
├── public/                 # Static files
├── src/
│   ├── api/                # API service modules
│   │   ├── axios.ts        # Axios configuration
│   │   ├── authApi.ts      # Authentication API
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── common/         # Common components
│   │   ├── customer/       # Customer-specific components
│   │   └── staff/          # Staff-specific components
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── customer/       # Customer pages
│   │   ├── staff/          # Staff pages
│   │   └── ...
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Entry point
│   └── ...
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── ...
```

## Database Schema

The database consists of the following tables:

### CUSTOMER

| Column | Type | Description |
|--------|------|-------------|
| cust_id | INTEGER | Primary key |
| cust_name | VARCHAR(100) | Customer name |
| cust_phone | VARCHAR(15) | Phone number |
| cust_email | VARCHAR(100) | Email address (unique) |
| cust_address | VARCHAR(255) | Physical address |
| cust_password | VARCHAR(255) | Hashed password |

### STAFF

| Column | Type | Description |
|--------|------|-------------|
| staff_id | INTEGER | Primary key |
| staff_name | VARCHAR(100) | Staff name |
| staff_role | VARCHAR(50) | Role (e.g., Mechanic, Manager) |
| staff_phone | VARCHAR(15) | Phone number |
| staff_password | VARCHAR(255) | Hashed password |
| outlet_id | INTEGER | Foreign key to SERVICEOUTLET |

### VEHICLE

| Column | Type | Description |
|--------|------|-------------|
| veh_id | INTEGER | Primary key |
| veh_plateno | VARCHAR(15) | License plate (unique) |
| veh_model | VARCHAR(50) | Vehicle model |
| veh_brand | VARCHAR(50) | Vehicle brand |
| veh_type | VARCHAR(30) | Vehicle type |
| veh_year | SMALLINT | Manufacturing year |
| cust_id | INTEGER | Foreign key to CUSTOMER |

### SERVICE

| Column | Type | Description |
|--------|------|-------------|
| service_id | INTEGER | Primary key |
| service_type | VARCHAR(50) | Type of service |
| service_desc | VARCHAR(255) | Description |
| service_category | VARCHAR(50) | Category |
| service_price | DOUBLE | Price |
| service_duration | INTEGER | Duration in minutes |

### SERVICEOUTLET

| Column | Type | Description |
|--------|------|-------------|
| outlet_id | INTEGER | Primary key |
| outlet_name | VARCHAR(100) | Name of outlet |
| outlet_address | VARCHAR(255) | Address |
| outlet_city | VARCHAR(50) | City |
| outlet_state | VARCHAR(50) | State |
| outlet_postal_code | VARCHAR(10) | Postal code |

### TIME

| Column | Type | Description |
|--------|------|-------------|
| time_id | INTEGER | Primary key |
| time_year | SMALLINT | Year |
| time_quarter | SMALLINT | Quarter |
| time_month | SMALLINT | Month |
| time_day | SMALLINT | Day |
| time_clocktime | TIME | Time |

### SERVICEAPPOINTMENT

| Column | Type | Description |
|--------|------|-------------|
| appointment_id | INTEGER | Primary key |
| cust_id | INTEGER | Foreign key to CUSTOMER |
| service_id | INTEGER | Foreign key to SERVICE |
| outlet_id | INTEGER | Foreign key to SERVICEOUTLET |
| time_id | INTEGER | Foreign key to TIME |
| veh_id | INTEGER | Foreign key to VEHICLE |
| staff_id | INTEGER | Foreign key to STAFF |
| appointment_cost | DECIMAL(10,2) | Cost |
| appointment_duration | INTEGER | Duration |
| appointment_status | VARCHAR(20) | Status |
| estimated_finish_time | TIME | Estimated finish time |

### NOTIFICATION

| Column | Type | Description |
|--------|------|-------------|
| notification_id | INTEGER | Primary key |
| user_id | INTEGER | User ID |
| user_type | VARCHAR(10) | User type (customer/staff) |
| title | VARCHAR(100) | Notification title |
| message | VARCHAR(500) | Notification message |
| type | VARCHAR(20) | Notification type |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Creation timestamp |
| link | VARCHAR(200) | Optional link |

### Entity Relationship Diagram

```
┌───────────┐       ┌───────────┐       ┌───────────┐
│  CUSTOMER │       │  VEHICLE  │       │ NOTIFICATION │
├───────────┤       ├───────────┤       ├───────────┤
│  cust_id  │◄──┐   │  veh_id   │       │notification_id│
│  cust_name│   │   │veh_plateno│       │  user_id  │
│ cust_phone│   │   │ veh_model │       │ user_type │
│cust_email │   │   │ veh_brand │       │   title   │
│cust_address│  └───┤  veh_type │       │  message  │
│cust_password│     │  veh_year │       │   type    │
└───────────┘       │  cust_id  │       │  is_read  │
      ▲             └───────────┘       │created_at │
      │                   ▲             │   link    │
      │                   │             └───────────┘
      │                   │
      │                   │
┌─────┴─────┐       ┌─────┴─────┐       ┌───────────┐
│SERVICE    │       │SERVICEAPPT│       │    TIME   │
│APPOINTMENT│◄──────┤           │◄──────┤           │
├───────────┤       ├───────────┤       ├───────────┤
│appointment_id│    │appointment_id│    │  time_id  │
│  cust_id  │       │  cust_id  │       │ time_year │
│ service_id│       │ service_id│       │time_quarter│
│ outlet_id │       │ outlet_id │       │time_month │
│  time_id  │       │  time_id  │       │ time_day  │
│  veh_id   │       │  veh_id   │       │time_clocktime│
│  staff_id │       │  staff_id │       └───────────┘
│appt_cost  │       │appt_cost  │
│appt_duration│     │appt_duration│     ┌───────────┐
│appt_status│       │appt_status│       │  SERVICE  │
│est_finish_time│   │est_finish_time│   ├───────────┤
└───────────┘       └───────────┘       │service_id │
      │                   ▲             │service_type│
      │                   │             │service_desc│
      ▼                   │             │service_category│
┌───────────┐             │             │service_price│
│   STAFF   │             │             │service_duration│
├───────────┤             │             └───────────┘
│ staff_id  │             │                   ▲
│ staff_name│             └───────────────────┘
│ staff_role│                     ▲
│staff_phone│                     │
│staff_password│                  │
│ outlet_id │───────────┐         │
└───────────┘           │         │
                        ▼         │
                  ┌───────────┐   │
                  │SERVICEOUTLET│ │
                  ├───────────┤   │
                  │ outlet_id │◄──┘
                  │outlet_name│
                  │outlet_address│
                  │outlet_city│
                  │outlet_state│
                  │outlet_postal_code│
                  └───────────┘
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/login | User login | Public |
| POST | /api/auth/register | User registration | Public |
| POST | /api/auth/logout | User logout | Authenticated |
| GET | /api/auth/me | Get current user | Authenticated |

### Customer Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/customers/{id} | Get customer by ID | Authenticated |
| GET | /api/customers/email/{email} | Get customer by email | Authenticated |
| PUT | /api/customers/{id} | Update customer | Authenticated |
| DELETE | /api/customers/{id} | Delete customer | Authenticated |

### Vehicle Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/customer/vehicles | Get customer vehicles | Authenticated |
| GET | /api/customer/vehicles/{id} | Get vehicle by ID | Authenticated |
| POST | /api/customer/vehicles | Add new vehicle | Authenticated |
| PUT | /api/customer/vehicles/{id} | Update vehicle | Authenticated |
| DELETE | /api/customer/vehicles/{id} | Delete vehicle | Authenticated |

### Appointment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/customer/appointments | Get customer appointments | Authenticated |
| GET | /api/customer/appointments/{id} | Get appointment details | Authenticated |
| POST | /api/customer/appointments | Create appointment | Authenticated |
| GET | /api/staff/appointments | Get staff appointments | Staff |
| GET | /api/staff/appointments/{id} | Get appointment details | Staff |
| PUT | /api/staff/appointments/{id}/status | Update appointment status | Staff |
| PUT | /api/staff/appointments/{id}/confirm | Confirm appointment | Staff |

### Service Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/public/services | Get all services | Public |
| GET | /api/services/{id} | Get service by ID | Public |
| POST | /api/services | Add new service | Admin |
| PUT | /api/services/{id} | Update service | Admin |
| DELETE | /api/services/{id} | Delete service | Admin |

### Outlet Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/public/outlets | Get all outlets | Public |
| GET | /api/outlets/{id} | Get outlet by ID | Public |
| POST | /api/outlets | Add new outlet | Admin |
| PUT | /api/outlets/{id} | Update outlet | Admin |
| DELETE | /api/outlets/{id} | Delete outlet | Admin |

### Staff Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/staff/{id} | Get staff by ID | Staff |
| GET | /api/staff/outlet/{outletId} | Get staff by outlet | Staff |
| POST | /api/staff | Add new staff | Admin |
| PUT | /api/staff/{id} | Update staff | Admin |
| DELETE | /api/staff/{id} | Delete staff | Admin |

### Notification Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/notifications | Get user notifications | Authenticated |
| PUT | /api/notifications/{id}/read | Mark notification as read | Authenticated |
| DELETE | /api/notifications/{id} | Delete notification | Authenticated |

## Authentication & Authorization

The application uses JWT (JSON Web Token) based authentication. When a user logs in, the server generates a JWT token that is sent back to the client. The client includes this token in the Authorization header of subsequent requests.

### Authentication Flow

1. User submits login credentials (username/password)
2. Server validates credentials and generates JWT token
3. Token is returned to client and stored in localStorage
4. Client includes token in Authorization header for API requests
5. Server validates token and processes the request

### Role-Based Access Control

The application implements role-based access control with the following roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| GUEST | Unauthenticated users | Public endpoints only |
| CUSTOMER | Registered customers | Customer endpoints |
| STAFF | Service center staff | Staff endpoints |
| ADMIN | System administrators | All endpoints |

Access control is implemented at both the controller level (using Spring Security annotations) and at the API gateway level.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Redis 6.0 or higher
- Maven 3.8 or higher
- Git

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/auto-service-portal.git
   cd auto-service-portal
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your configuration:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=portal_db
   DB_USERNAME=your_username
   DB_PASSWORD=your_password

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Email Configuration
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   ```

### Database Setup

1. Run the database setup script:

   **Windows:**
   ```bash
   .\setup-db.bat
   ```

   **Linux/Mac:**
   ```bash
   chmod +x setup-db.sh
   ./setup-db.sh
   ```

   This script will create the database schema and insert essential system data.

### Backend Setup

1. Build and run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will start on http://localhost:8080

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on http://localhost:5173

## Development Workflow

### Backend Development

1. Make changes to Java code
2. Run tests: `./mvnw test`
3. Start the application: `./mvnw spring-boot:run`
4. Access the API at http://localhost:8080

### Frontend Development

1. Make changes to React components
2. Run tests: `npm test`
3. Start the development server: `npm run dev`
4. Access the UI at http://localhost:5173

### Database Changes

1. Create a new migration script in `src/main/resources/db/migration/`
2. Run the application to apply migrations
3. Update the `schema_complete.sql` file if necessary

## Deployment

### Backend Deployment

1. Build the application:
   ```bash
   ./mvnw clean package
   ```

2. The JAR file will be created in the `target` directory
3. Deploy the JAR file to your server:
   ```bash
   java -jar target/portal-0.0.1-SNAPSHOT.jar
   ```

### Frontend Deployment

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```

2. The build files will be created in the `dist` directory
3. Deploy these files to a web server (Nginx, Apache, etc.)

### Docker Deployment

1. Build the Docker images:
   ```bash
   docker-compose build
   ```

2. Start the containers:
   ```bash
   docker-compose up -d
   ```

## Testing

### Backend Testing

Run the backend tests:
```bash
./mvnw test
```

### Frontend Testing

Run the frontend tests:
```bash
cd client
npm test
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Database connection error | Check database credentials in `.env` file |
| Redis connection error | Ensure Redis is running and accessible |
| JWT token expired | Log out and log in again to get a new token |
| CORS error | Check CORS configuration in `WebMvcConfig.java` |
| Build failure | Check for compilation errors and dependencies |

### Logs

- Backend logs are located in the `logs` directory
- Frontend logs are output to the console

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
