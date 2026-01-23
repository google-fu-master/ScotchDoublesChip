/**
 * Main Application Entry Point
 * Tournament management system with full service integration
 */

import { createServiceContainer, ServiceContainerConfig } from './shared/services/service-container';
import { createTournamentApp } from './shared/api/tournament.api';

/**
 * Application configuration
 */
export interface AppConfig extends ServiceContainerConfig {
  port?: number;
  host?: string;
  enableCors?: boolean;
  corsOrigins?: string[];
}

/**
 * Tournament Management Application
 */
export class TournamentApp {
  private config: AppConfig;
  private serviceContainer: any;
  private server: any;

  constructor(config: AppConfig = {}) {
    this.config = {
      port: 3000,
      host: '0.0.0.0',
      enableCors: true,
      corsOrigins: ['*'],
      environment: 'development',
      logLevel: 'info',
      enableErrorNotifications: true,
      ...config
    };
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Starting Tournament Management System...');
      
      // Initialize service container
      this.serviceContainer = createServiceContainer(this.config);
      await this.serviceContainer.initialize();
      
      // Create Express application
      const app = createTournamentApp(this.serviceContainer);
      
      console.log('✅ Tournament system initialized successfully');
      console.log(`📊 Environment: ${this.config.environment}`);
      console.log(`🔧 Services: ${Object.keys(this.serviceContainer.getDependencyGraph()).length} loaded`);
      
      // Store for later use
      this.server = app;
      
    } catch (error) {
      console.error('❌ Failed to initialize tournament system:', error);
      throw error;
    }
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    if (!this.server) {
      throw new Error('Application not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      const httpServer = this.server.listen(this.config.port, this.config.host, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`🌐 Tournament API server started at http://${this.config.host}:${this.config.port}`);
          console.log('📋 Available endpoints:');
          console.log('   GET  /health - Health check');
          console.log('   POST /api/v1/tournaments - Create tournament');
          console.log('   GET  /api/v1/tournaments/:id - Get tournament');
          console.log('   POST /api/v1/tournaments/:id/start - Start tournament');
          console.log('   POST /api/v1/tournaments/:id/teams - Add team');
          console.log('   POST /api/v1/tournaments/:id/games/:gameId/scores - Submit scores');
          console.log('   GET  /api/v1/tournaments/:id/money - Money breakdown');
          console.log('   ... and many more!');
          resolve();
        }
      });

      // Graceful shutdown handling
      process.on('SIGTERM', () => this.shutdown(httpServer));
      process.on('SIGINT', () => this.shutdown(httpServer));
    });
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<any> {
    if (!this.serviceContainer) {
      return { status: 'unhealthy', reason: 'Service container not initialized' };
    }
    return await this.serviceContainer.healthCheck();
  }

  /**
   * Get service container for external use
   */
  getServiceContainer(): any {
    return this.serviceContainer;
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(httpServer?: any): Promise<void> {
    console.log('🛑 Shutting down tournament system...');
    
    try {
      // Close HTTP server
      if (httpServer) {
        await new Promise<void>((resolve) => {
          httpServer.close(() => {
            console.log('🌐 HTTP server closed');
            resolve();
          });
        });
      }

      // Dispose services
      if (this.serviceContainer) {
        await this.serviceContainer.dispose();
      }

      console.log('✅ Tournament system shut down successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

/**
 * Create and configure tournament application
 */
export function createTournamentApplication(config?: AppConfig): TournamentApp {
  return new TournamentApp(config);
}

/**
 * Quick start function for development
 */
export async function startTournamentServer(config?: AppConfig): Promise<TournamentApp> {
  const app = createTournamentApplication(config);
  await app.initialize();
  await app.start();
  return app;
}

// CLI entry point when run directly
if (require.main === module) {
  const config: AppConfig = {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    environment: (process.env.NODE_ENV as any) || 'development',
    databaseUrl: process.env.DATABASE_URL,
    enableDatabaseLogging: process.env.LOG_LEVEL === 'debug',
    logLevel: (process.env.LOG_LEVEL as any) || 'info'
  };

  startTournamentServer(config)
    .then(() => {
      console.log('🎉 Tournament system is ready!');
      console.log('🏆 Features available:');
      console.log('   ✅ FARGO-based chip calculations');
      console.log('   ✅ Birthday chip automation');
      console.log('   ✅ Advanced queue management');
      console.log('   ✅ Sophisticated money handling');
      console.log('   ✅ Complete director controls');
      console.log('   ✅ Side pot management');
      console.log('   ✅ Error handling & logging');
      console.log('   ✅ Real-time tournament state');
      console.log('');
      console.log('📖 Documentation: Check the API endpoints above');
      console.log('🐛 Support: Check error logs for troubleshooting');
    })
    .catch((error) => {
      console.error('💥 Failed to start tournament system:', error);
      process.exit(1);
    });
}