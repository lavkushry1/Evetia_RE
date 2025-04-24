import { Request, Response, NextFunction } from 'express';
import logger from './logger.service';
import { CacheService } from './cache.service';

interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
}

interface SystemMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  timestamp: number;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private cacheService: CacheService;
  private requestMetrics: RequestMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private readonly MAX_METRICS = 1000;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.startSystemMetricsCollection();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public getRequestMetrics(): RequestMetrics[] {
    return this.requestMetrics;
  }

  public getSystemMetrics(): SystemMetrics[] {
    return this.systemMetrics;
  }

  public getActiveConnections(): number {
    return this.systemMetrics[this.systemMetrics.length - 1]?.activeConnections || 0;
  }

  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const start = process.hrtime();

      // Capture response
      res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const responseTime = seconds * 1000 + nanoseconds / 1000000;

        const metric: RequestMetrics = {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime,
          timestamp: Date.now()
        };

        this.addRequestMetric(metric);
      });

      next();
    };
  }

  private addRequestMetric(metric: RequestMetrics): void {
    this.requestMetrics.push(metric);
    if (this.requestMetrics.length > this.MAX_METRICS) {
      this.requestMetrics.shift();
    }

    // Log slow requests
    if (metric.responseTime > 1000) {
      logger.warn('Slow request detected:', {
        path: metric.path,
        method: metric.method,
        responseTime: metric.responseTime
      });
    }

    // Log errors
    if (metric.statusCode >= 400) {
      logger.error('Request error:', {
        path: metric.path,
        method: metric.method,
        statusCode: metric.statusCode
      });
    }
  }

  private startSystemMetricsCollection(): void {
    setInterval(() => {
      const metric: SystemMetrics = {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        activeConnections: this.getActiveConnections(),
        timestamp: Date.now()
      };

      this.systemMetrics.push(metric);
      if (this.systemMetrics.length > this.MAX_METRICS) {
        this.systemMetrics.shift();
      }

      // Log high memory usage
      if (metric.memoryUsage.heapUsed > 1024 * 1024 * 1024) { // 1GB
        logger.warn('High memory usage detected:', {
          heapUsed: metric.memoryUsage.heapUsed,
          heapTotal: metric.memoryUsage.heapTotal
        });
      }
    }, 60000); // Collect metrics every minute
  }
} 