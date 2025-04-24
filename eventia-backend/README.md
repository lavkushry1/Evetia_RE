# Eventia Backend

Backend for Eventia Ticketing Platform built with Node.js, Express, and TypeScript.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── database/       # Database models and migrations
├── middleware/     # Express middleware
├── migrations/     # Database migrations
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── validations/    # Request validation schemas
├── index.ts        # Application entry point
└── server.ts       # Express server setup
```

## Best Practices

### Project Structure
- Use proper directory structure with clear separation of concerns
- Implement proper module organization
- Use proper middleware organization
- Keep routes organized by domain
- Implement proper error handling
- Use proper configuration management

### Express Setup
- Use proper middleware setup
- Implement proper routing
- Use proper error handling
- Configure proper security middleware
- Implement proper validation
- Use proper static file serving

### API Design
- Use proper REST principles
- Implement proper versioning
- Use proper request validation
- Handle errors properly
- Implement proper response formats
- Document APIs properly

### Database Integration
- Use proper ORM/ODM
- Implement proper migrations
- Use proper connection pooling
- Implement proper transactions
- Use proper query optimization
- Handle database errors properly

### Authentication
- Implement proper JWT handling
- Use proper password hashing
- Implement proper session management
- Use proper OAuth integration
- Implement proper role-based access
- Handle auth errors properly

### Security
- Use proper CORS setup
- Implement proper rate limiting
- Use proper security headers
- Implement proper input validation
- Use proper encryption
- Handle security vulnerabilities

### Performance
- Use proper caching
- Implement proper async operations
- Use proper connection pooling
- Implement proper logging
- Use proper monitoring
- Handle high traffic properly

### Testing
- Write proper unit tests
- Implement proper integration tests
- Use proper test runners
- Implement proper mocking
- Test error scenarios
- Use proper test coverage

### Deployment
- Use proper Docker setup
- Implement proper CI/CD
- Use proper environment variables
- Configure proper logging
- Implement proper monitoring
- Handle deployment errors

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/eventia-backend.git
cd eventia-backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=eventia
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:8080
CORS_CREDENTIALS=true
LOG_LEVEL=info
```

4. Run migrations
```bash
npm run migration:run
```

5. Start the development server
```bash
npm run dev
```

## Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reloading
- `npm run build`: Build the TypeScript code
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint errors
- `npm run migration:generate`: Generate a new migration
- `npm run migration:run`: Run migrations
- `npm run migration:revert`: Revert migrations

## License

This project is licensed under the MIT License.
