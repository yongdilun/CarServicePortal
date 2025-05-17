#!/bin/bash

echo "==================================================="
echo "Starting Auto Service Portal (Development Mode)"
echo "==================================================="
echo "This will initialize the database using schema_complete.sql"
echo ""

echo "Starting the backend with dev profile..."
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev &
BACKEND_PID=$!

echo ""
echo "Waiting for 5 seconds for the backend to start..."
sleep 5

echo ""
echo "Starting the frontend..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both applications are starting in the background."
echo ""
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both applications."
echo "==================================================="

# Wait for user to press Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
