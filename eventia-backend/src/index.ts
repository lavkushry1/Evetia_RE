import 'dotenv/config';
import { connectDB } from './config/database';
import './models/associations';
import config from './config';
import { server } from './server';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  process.exit(0);
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Database connected successfully');
    
    // Start the server
    const PORT = config.port;
    server.listen(PORT, () => {
      console.log(`Server is running in ${config.env} mode on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Error during server initialization:', error);
    process.exit(1);
  }
};

startServer(); 