/**
 * Dependency Injection Container
 * Manages service dependencies and provides a centralized way to configure and access services
 */

import { PrismaClient } from '@prisma/client';
import { TournamentService } from './tournament.service';
import { ChipService } from './chip.service';
import { QueueService } from './queue.service';
import { TableAssignmentService } from './table-assignment.service';
import { GameProgressionService } from './game-progression.service';
import { MoneyCalculationService } from './money-calculation.service';
import { ErrorHandlingService, ConsoleLogger, ILogger, IErrorHandler } from './error-handling.service';
import type { 
  ITournamentService,
  IChipService, 
  IQueueService,
  ITableAssignmentService,
  IGameProgressionService,
  IMoneyCalculationService
} from '../types/tournament.types';

// Service container interface
export interface IServiceContainer {
  // Core services
  getTournamentService(): ITournamentService;
  getChipService(): IChipService;
  getQueueService(): IQueueService;
  getTableAssignmentService(): ITableAssignmentService;
  getGameProgressionService(): IGameProgressionService;
  getMoneyCalculationService(): IMoneyCalculationService;
  
  // Infrastructure services
  getErrorHandler(): IErrorHandler;
  getLogger(): ILogger;
  getPrisma(): PrismaClient;
  
  // Health and lifecycle
  healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: Record<string, boolean>;
    database: boolean;
    timestamp: Date;
  }>;
  
  // Cleanup
  dispose(): Promise<void>;
}

/**
 * Configuration options for the service container
 */
export interface ServiceContainerConfig {
  // Database configuration
  databaseUrl?: string;
  enableDatabaseLogging?: boolean;
  
  // Logging configuration
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  logSource?: string;
  
  // Environment
  environment?: 'development' | 'test' | 'production';
  
  // Feature flags
  enableErrorNotifications?: boolean;
  autoAcceptScores?: boolean;
}

/**
 * Service Container Implementation
 * Uses singleton pattern to ensure single instances of services
 */
export class ServiceContainer implements IServiceContainer {
  private static instance: ServiceContainer;
  private config: ServiceContainerConfig;
  
  // Lazy-loaded services
  private _prisma?: PrismaClient;
  private _logger?: ILogger;
  private _errorHandler?: IErrorHandler;
  private _tournamentService?: ITournamentService;
  private _chipService?: IChipService;
  private _queueService?: IQueueService;
  private _tableAssignmentService?: ITableAssignmentService;
  private _gameProgressionService?: IGameProgressionService;
  private _moneyCalculationService?: IMoneyCalculationService;
  
  private constructor(config: ServiceContainerConfig = {}) {
    this.config = {
      logLevel: 'info',
      logSource: 'TournamentSystem',
      environment: 'development',
      enableDatabaseLogging: false,
      enableErrorNotifications: true,
      autoAcceptScores: false,
      ...config
    };
  }

  /**
   * Get singleton instance of the service container
   */
  public static getInstance(config?: ServiceContainerConfig): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer(config);
    }
    return ServiceContainer.instance;
  }

  /**
   * Configure the service container (only works before services are instantiated)
   */
  public configure(config: ServiceContainerConfig): void {
    if (this._prisma || this._logger) {
      throw new Error('Cannot reconfigure after services have been instantiated');
    }
    this.config = { ...this.config, ...config };
  }

  /**
   * Get Prisma database client
   */
  public getPrisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient({
        datasources: {
          db: {
            url: this.config.databaseUrl || process.env.DATABASE_URL
          }
        },
        log: this.config.enableDatabaseLogging 
          ? ['query', 'info', 'warn', 'error']
          : ['error']
      });
    }
    return this._prisma;
  }

  /**
   * Get logger instance
   */
  public getLogger(): ILogger {
    if (!this._logger) {
      this._logger = new ConsoleLogger(this.config.logSource);
    }
    return this._logger;
  }

  /**
   * Get error handler service
   */
  public getErrorHandler(): IErrorHandler {
    if (!this._errorHandler) {
      this._errorHandler = new ErrorHandlingService(
        this.getLogger(),
        this.getPrisma()
      );
    }
    return this._errorHandler;
  }

  /**
   * Get tournament orchestration service
   */
  public getTournamentService(): ITournamentService {
    if (!this._tournamentService) {
      this._tournamentService = new TournamentService(
        this.getPrisma(),
        this.getChipService(),
        this.getQueueService(),
        this.getTableAssignmentService(),
        this.getGameProgressionService(),
        this.getMoneyCalculationService(),
        this.getErrorHandler(),
        this.getLogger()
      );
    }
    return this._tournamentService;
  }

  /**
   * Get chip calculation service
   */
  public getChipService(): IChipService {
    if (!this._chipService) {
      this._chipService = new ChipService(
        this.getPrisma(),
        this.getErrorHandler(),
        this.getLogger()
      );
    }
    return this._chipService;
  }

  /**
   * Get queue management service
   */
  public getQueueService(): IQueueService {
    if (!this._queueService) {
      this._queueService = new QueueService(
        this.getPrisma(),
        this.getErrorHandler(),
        this.getLogger()
      );
    }
    return this._queueService;
  }

  /**
   * Get table assignment service
   */
  public getTableAssignmentService(): ITableAssignmentService {
    if (!this._tableAssignmentService) {
      this._tableAssignmentService = new TableAssignmentService(
        this.getPrisma(),
        this.getQueueService(),
        this.getErrorHandler(),
        this.getLogger()
      );
    }
    return this._tableAssignmentService;
  }

  /**
   * Get game progression service
   */
  public getGameProgressionService(): IGameProgressionService {
    if (!this._gameProgressionService) {
      this._gameProgressionService = new GameProgressionService(
        this.getPrisma(),
        this.getChipService(),
        this.getQueueService(),
        this.getErrorHandler(),
        this.getLogger()
      );
    }
    return this._gameProgressionService;
  }

  /**
   * Get money calculation service
   */
  public getMoneyCalculationService(): IMoneyCalculationService {
    if (!this._moneyCalculationService) {
      this._moneyCalculationService = new MoneyCalculationService(
        this.getPrisma(),
        this.getErrorHandler(),
        this.getLogger()
      );
    }
    return this._moneyCalculationService;
  }

  /**
   * Initialize all services (useful for startup)
   */
  public async initialize(): Promise<void> {
    try {
      this.getLogger().info('Initializing tournament system services...');
      
      // Initialize database connection
      await this.getPrisma().$connect();
      this.getLogger().info('Database connection established');
      
      // Initialize all services (creates instances)
      this.getErrorHandler();
      this.getTournamentService();
      this.getChipService();
      this.getQueueService();
      this.getTableAssignmentService();
      this.getGameProgressionService();
      this.getMoneyCalculationService();
      
      this.getLogger().info('All tournament system services initialized successfully');
    } catch (error) {
      this.getLogger().error('Failed to initialize tournament system', error as Error);
      throw error;
    }
  }

  /**
   * Health check for all services
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: Record<string, boolean>;
    database: boolean;
    timestamp: Date;
  }> {
    const services: Record<string, boolean> = {};
    let database = false;

    try {
      // Check database connectivity
      await this.getPrisma().$queryRaw`SELECT 1`;
      database = true;
    } catch (error) {
      this.getLogger().error('Database health check failed', error as Error);
    }

    // Check service instantiation (basic check)
    try {
      services.tournamentService = !!this._tournamentService;
      services.chipService = !!this._chipService;
      services.queueService = !!this._queueService;
      services.tableAssignmentService = !!this._tableAssignmentService;
      services.gameProgressionService = !!this._gameProgressionService;
      services.moneyCalculationService = !!this._moneyCalculationService;
      services.errorHandler = !!this._errorHandler;
      services.logger = !!this._logger;
    } catch (error) {
      this.getLogger().error('Service health check failed', error as Error);
    }

    const allHealthy = database && Object.values(services).every(Boolean);
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      services,
      database,
      timestamp: new Date()
    };
  }

  /**
   * Get service dependencies graph (for debugging)
   */
  public getDependencyGraph(): Record<string, string[]> {
    return {
      tournamentService: ['chipService', 'queueService', 'tableAssignmentService', 'gameProgressionService', 'moneyCalculationService', 'errorHandler', 'logger'],
      chipService: ['prisma', 'errorHandler', 'logger'],
      queueService: ['prisma', 'errorHandler', 'logger'],
      tableAssignmentService: ['prisma', 'queueService', 'errorHandler', 'logger'],
      gameProgressionService: ['prisma', 'chipService', 'queueService', 'errorHandler', 'logger'],
      moneyCalculationService: ['prisma', 'errorHandler', 'logger'],
      errorHandler: ['logger', 'prisma'],
      logger: [],
      prisma: []
    };
  }

  /**
   * Reset all services (useful for testing)
   */
  public reset(): void {
    this._tournamentService = undefined;
    this._chipService = undefined;
    this._queueService = undefined;
    this._tableAssignmentService = undefined;
    this._gameProgressionService = undefined;
    this._moneyCalculationService = undefined;
    this._errorHandler = undefined;
    this._logger = undefined;
    // Note: Don't reset _prisma as it has connection management
  }

  /**
   * Clean shutdown of all services
   */
  public async dispose(): Promise<void> {
    try {
      this.getLogger().info('Shutting down tournament system services...');
      
      if (this._prisma) {
        await this._prisma.$disconnect();
        this.getLogger().info('Database connection closed');
      }
      
      this.reset();
      this.getLogger().info('Tournament system services shut down successfully');
    } catch (error) {
      console.error('Error during service shutdown:', error);
      throw error;
    }
  }
}

/**
 * Helper function to create a configured service container
 */
export function createServiceContainer(config?: ServiceContainerConfig): IServiceContainer {
  return ServiceContainer.getInstance(config);
}

/**
 * Helper function to get the default service container
 */
export function getServiceContainer(): IServiceContainer {
  return ServiceContainer.getInstance();
}

/**
 * Decorator for automatic service injection (for future use)
 */
export function injectable<T>(serviceFactory: (container: IServiceContainer) => T) {
  return (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      get: function() {
        const container = ServiceContainer.getInstance();
        return serviceFactory(container);
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Export commonly used service types for convenience
export type {
  ITournamentService,
  IChipService,
  IQueueService,
  ITableAssignmentService,
  IGameProgressionService,
  IMoneyCalculationService,
  ILogger,
  IErrorHandler
};