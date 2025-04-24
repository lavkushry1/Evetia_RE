import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment types
export type Environment = 'development' | 'production' | 'test';

// Configuration interface
export interface Config {
  env: Environment;
  server: {
    port: number;
    host: string;
    apiPrefix: string;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean;
    sslCA?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origins: string[];
    credentials: boolean;
  };
  frontend: {
    url: string;
  };
}

// Determine the current environment
const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV?.toLowerCase();
  if (env === 'production' || env === 'test') {
    return env;
  }
  return 'development';
};

// Load configuration based on environment
const loadConfig = (): Config => {
  const env = getEnvironment();
  
  // Base configuration
  const config: Config = {
    env,
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      apiPrefix: '/api',
    },
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'eventia123',
      database: process.env.DB_NAME || 'eventia',
      ssl: env === 'production',
      sslCA: process.env.DB_SSL_CA,
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    cors: {
      origins: [process.env.CORS_ORIGIN || 'http://localhost:8080', 'http://frontend:8080'],
      credentials: true,
    },
    frontend: {
      url: process.env.FRONTEND_URL || 'http://localhost:8080',
    },
  };

  return config;
};

// Export the configuration
export const config = loadConfig();

// Export a function to get the configuration
export const getConfig = (): Config => config;

// Export a function to get a specific configuration value
export const getConfigValue = <T>(path: string): T => {
  const parts = path.split('.');
  let value: any = config;
  
  for (const part of parts) {
    value = value[part];
    if (value === undefined) {
      throw new Error(`Configuration path "${path}" not found`);
    }
  }
  
  return value as T;
};

// Export a function to check if we're in production
export const isProduction = (): boolean => config.env === 'production';

// Export a function to check if we're in development
export const isDevelopment = (): boolean => config.env === 'development';

// Export a function to check if we're in test
export const isTest = (): boolean => config.env === 'test';

// Export a function to get the API URL
export const getApiUrl = (): string => {
  const { host, port, apiPrefix } = config.server;
  return `http://${host}:${port}${apiPrefix}`;
};

// Export a function to get the frontend URL
export const getFrontendUrl = (): string => config.frontend.url;

// Export a function to get the CORS origins
export const getCorsOrigins = (): string[] => config.cors.origins;

// Export a function to get the database connection options
export const getDatabaseConfig = () => ({
  type: 'postgres' as const,
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: !isProduction(),
  logging: !isProduction(),
  ssl: config.database.ssl ? {
    rejectUnauthorized: false,
    ca: config.database.sslCA,
  } : false,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

export const getCorsConfig = () => config.cors;

export const getServerConfig = () => ({
  port: config.server.port,
}); 