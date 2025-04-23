import 'dotenv/config';
import { AppDataSource } from './config/database';
import { server } from './server';

const PORT = process.env.PORT || 5000;

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during database initialization:', error);
  }); 