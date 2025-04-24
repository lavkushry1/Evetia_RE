#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Eventia Ticketing Platform Test...${NC}"

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Build and start the containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose up --build -d

# Wait for the services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Test the backend health endpoint
echo -e "${YELLOW}Testing backend health endpoint...${NC}"
BACKEND_HEALTH=$(curl -s http://localhost:3000/api/health)
if [[ $BACKEND_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}Backend is healthy!${NC}"
else
    echo -e "${RED}Backend health check failed.${NC}"
    echo -e "${RED}Response: $BACKEND_HEALTH${NC}"
fi

# Test the frontend
echo -e "${YELLOW}Testing frontend...${NC}"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
if [[ $FRONTEND_RESPONSE == 200 ]]; then
    echo -e "${GREEN}Frontend is accessible!${NC}"
else
    echo -e "${RED}Frontend is not accessible. Status code: $FRONTEND_RESPONSE${NC}"
fi

# Test the database
echo -e "${YELLOW}Testing database connection...${NC}"
DB_CONNECTION=$(docker-compose exec -T db pg_isready -U postgres)
if [[ $DB_CONNECTION == *"accepting connections"* ]]; then
    echo -e "${GREEN}Database is accepting connections!${NC}"
else
    echo -e "${RED}Database connection test failed.${NC}"
    echo -e "${RED}Response: $DB_CONNECTION${NC}"
fi

echo -e "${YELLOW}Test completed.${NC}"
echo -e "${YELLOW}To stop the containers, run: docker-compose down${NC}" 