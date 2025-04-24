# Eventia Ticketing Platform

A full-stack application for event ticketing with React frontend, Express.js backend, and PostgreSQL database.

## Project Structure

- `eventia-ticketing-flow1/`: React frontend using Vite
- `eventia-backend/`: Express.js backend with TypeScript
- `docker-compose.yml`: Docker Compose configuration for all services

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000/api
   - Database: localhost:5432

### Local Development

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd eventia-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=eventia123
   DB_NAME=eventia
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:8080
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd eventia-ticketing-flow1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Default Credentials

- Admin login: admin@example.com / admin123
- Database: postgres / eventia123
- Default UPI: eventia@okicici

## Features

- User authentication and authorization
- Event management
- Booking and payment processing
- UPI payment integration
- Admin dashboard
- Real-time updates using Socket.io

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, TypeScript, TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time Communication**: Socket.io
- **Containerization**: Docker, Docker Compose 