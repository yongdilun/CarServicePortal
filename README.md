# Auto Service Portal

A full-stack application for managing auto service appointments, built with Spring Boot, MySQL, MyBatis, Redis for the backend and React (TypeScript), Axios, Vite, and Tailwind CSS for the frontend.

## Features

- Customer and staff authentication and authorization
- Vehicle management for customers
- Service appointment booking and management
- Real-time notifications for appointment updates
- Staff scheduling and appointment management
- Responsive design for all devices

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.4.4
- Spring Security
- MyBatis
- MySQL
- Redis
- Spring Data Redis

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Redis 6.2 or higher

### Setup and Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/auto-service-portal.git
   cd auto-service-portal
   ```

2. **Database Setup**
   - Create a MySQL database named `portal_db`
   - Run the database initialization script (not included in the repository for security reasons)

3. **Backend Setup**
   ```bash
   # Run the Spring Boot application
   ./mvnw spring-boot:run
   ```

4. **Frontend Setup**
   ```bash
   # Navigate to the client directory
   cd client
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm run dev
   ```

5. **Access the Application**
   - Backend API: http://localhost:8080
   - Frontend: http://localhost:5173

## Running with Batch Files

For Windows users, you can use the provided batch files:
- `run-portal.bat` - Starts the Spring Boot backend
- `run-frontend.bat` - Starts the React frontend
- `run-all.bat` - Starts both backend and frontend

## Project Structure

```
auto-service-portal/
├── src/                    # Backend source code
│   ├── main/
│   │   ├── java/           # Java code
│   │   └── resources/      # Configuration files
│   └── test/               # Test code
├── client/                 # Frontend source code
│   ├── src/                # React components and logic
│   ├── public/             # Static assets
│   └── ...
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
