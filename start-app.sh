#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Starting Hospital Optimization Full-Stack App${NC}"
echo -e "${BLUE}==================================================${NC}"

# Kill any existing processes on the ports just to be safe
echo "Cleaning up old processes..."
fuser -k 8080/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null

# 1. Start the Spring Boot Backend in the background
echo -e "${GREEN}[1/2] Starting Java Spring Boot Backend (Port 8080)...${NC}"
cd /home/nihal/Documents/COLLEGE_STUFF/DAA_CP/hospital-optimization-backend
./mvnw spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!

# Wait a few seconds for spring boot to initialize
sleep 5

# 2. Start the React Frontend
echo -e "${GREEN}[2/2] Starting React Web Dashboard (Port 5173)...${NC}"
cd /home/nihal/Documents/COLLEGE_STUFF/DAA_CP/hospital-optimization-frontend
npm run dev -- --host 0.0.0.0 > frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}SUCCESS! Everything is running.${NC}"
echo ""
echo "Dashboard URL: http://localhost:5173"
echo ""
echo "To stop the servers, run: kill $BACKEND_PID $FRONTEND_PID"
echo -e "${BLUE}==================================================${NC}"

# Keep script running so user sees the output, wait for user to hit Ctrl+C
wait
