import NodeCache from 'node-cache';
import logger from './logger.service';

export class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: this.DEFAULT_TTL,
      checkperiod: 600 // Check for expired keys every 10 minutes
    });

    // Log cache statistics periodically
    setInterval(() => {
      const stats = this.cache.getStats();
      logger.info('Cache statistics:', stats);
    }, 3600000); // Log every hour
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = this.cache.get<T>(key);
      return value || null;
    } catch (error) {
      logger.error('Error getting from cache:', error);
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      return this.cache.set(key, value, ttl);
    } catch (error) {
      logger.error('Error setting cache:', error);
      return false;
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      return this.cache.del(key) > 0;
    } catch (error) {
      logger.error('Error deleting from cache:', error);
      return false;
    }
  }

  public async clear(): Promise<void> {
    try {
      this.cache.flushAll();
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }

  // Cache keys
  public static readonly KEYS = {
    EVENT: (id: string) => `event:${id}`,
    EVENT_LIST: 'events:list',
    STADIUM: (id: string) => `stadium:${id}`,
    STADIUM_LIST: 'stadiums:list',
    USER: (id: string) => `user:${id}`,
    BOOKING: (id: string) => `booking:${id}`,
    USER_BOOKINGS: (userId: string) => `user:${userId}:bookings`
  };
} 