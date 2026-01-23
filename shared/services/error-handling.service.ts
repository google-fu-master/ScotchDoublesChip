/**
 * Error Handling and Logging Service
 * Centralized error handling, logging, and monitoring for the tournament system
 */

import { PrismaClient } from '@prisma/client';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for better organization
export enum ErrorCategory {
  VALIDATION = 'validation',
  DATABASE = 'database',
  BUSINESS_LOGIC = 'business_logic',
  AUTHORIZATION = 'authorization',
  EXTERNAL_API = 'external_api',
  SYSTEM = 'system',
  USER_INPUT = 'user_input',
  TOURNAMENT = 'tournament',
  PAYMENT = 'payment'
}

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Base error interface
export interface TournamentError {
  id: string;
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  stack?: string;
  timestamp: Date;
  userId?: string;
  tournamentId?: string;
  correlationId?: string;
}

// Custom error classes
export class TournamentValidationError extends Error {
  public readonly code: string;
  public readonly category = ErrorCategory.VALIDATION;
  public readonly severity = ErrorSeverity.MEDIUM;
  public readonly context: Record<string, any>;

  constructor(code: string, message: string, context: Record<string, any> = {}) {
    super(message);
    this.name = 'TournamentValidationError';
    this.code = code;
    this.context = context;
  }
}

export class TournamentNotFoundError extends Error {
  public readonly code = 'TOURNAMENT_NOT_FOUND';
  public readonly category = ErrorCategory.BUSINESS_LOGIC;
  public readonly severity = ErrorSeverity.MEDIUM;
  public readonly tournamentId: string;

  constructor(tournamentId: string) {
    super(`Tournament not found: ${tournamentId}`);
    this.name = 'TournamentNotFoundError';
    this.tournamentId = tournamentId;
  }
}

export class InsufficientPermissionsError extends Error {
  public readonly code = 'INSUFFICIENT_PERMISSIONS';
  public readonly category = ErrorCategory.AUTHORIZATION;
  public readonly severity = ErrorSeverity.HIGH;
  public readonly action: string;
  public readonly userId?: string;

  constructor(action: string, userId?: string) {
    super(`Insufficient permissions for action: ${action}`);
    this.name = 'InsufficientPermissionsError';
    this.action = action;
    this.userId = userId;
  }
}

export class TournamentStateError extends Error {
  public readonly code = 'INVALID_TOURNAMENT_STATE';
  public readonly category = ErrorCategory.BUSINESS_LOGIC;
  public readonly severity = ErrorSeverity.MEDIUM;
  public readonly currentState: string;
  public readonly requiredState: string | string[];

  constructor(message: string, currentState: string, requiredState: string | string[]) {
    super(message);
    this.name = 'TournamentStateError';
    this.currentState = currentState;
    this.requiredState = requiredState;
  }
}

export class PaymentProcessingError extends Error {
  public readonly code: string;
  public readonly category = ErrorCategory.PAYMENT;
  public readonly severity = ErrorSeverity.HIGH;
  public readonly paymentId?: string;
  public readonly amount?: number;

  constructor(code: string, message: string, paymentId?: string, amount?: number) {
    super(message);
    this.name = 'PaymentProcessingError';
    this.code = code;
    this.paymentId = paymentId;
    this.amount = amount;
  }
}

export class ExternalAPIError extends Error {
  public readonly code: string;
  public readonly category = ErrorCategory.EXTERNAL_API;
  public readonly severity = ErrorSeverity.MEDIUM;
  public readonly service: string;
  public readonly statusCode?: number;

  constructor(service: string, code: string, message: string, statusCode?: number) {
    super(message);
    this.name = 'ExternalAPIError';
    this.service = service;
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Log entry interface
export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  category: string;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  tournamentId?: string;
  correlationId?: string;
  source: string;
}

// Logger interface
export interface ILogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  fatal(message: string, error?: Error, context?: Record<string, any>): void;
}

// Error handler interface
export interface IErrorHandler {
  handleError(error: Error, context?: Record<string, any>): Promise<TournamentError>;
  logError(error: TournamentError): Promise<void>;
  notifyError(error: TournamentError): Promise<void>;
}

/**
 * Error Handling and Logging Service
 */
export class ErrorHandlingService implements IErrorHandler {
  private logger: ILogger;
  private prisma: PrismaClient;

  constructor(logger: ILogger, prisma: PrismaClient) {
    this.logger = logger;
    this.prisma = prisma;
  }

  /**
   * Handle and categorize errors
   */
  async handleError(error: Error, context: Record<string, any> = {}): Promise<TournamentError> {
    const errorId = this.generateErrorId();
    const timestamp = new Date();
    const correlationId = context.correlationId || this.generateCorrelationId();

    // Determine error category and severity
    let category: ErrorCategory;
    let severity: ErrorSeverity;
    let code: string;

    if (error instanceof TournamentValidationError) {
      category = error.category;
      severity = error.severity;
      code = error.code;
    } else if (error instanceof TournamentNotFoundError) {
      category = error.category;
      severity = error.severity;
      code = error.code;
    } else if (error instanceof InsufficientPermissionsError) {
      category = error.category;
      severity = error.severity;
      code = error.code;
    } else if (error instanceof TournamentStateError) {
      category = error.category;
      severity = error.severity;
      code = error.code;
    } else if (error instanceof PaymentProcessingError) {
      category = error.category;
      severity = error.severity;
      code = error.code;
    } else if (error instanceof ExternalAPIError) {
      category = error.category;
      severity = error.severity;
      code = error.code;
    } else {
      // Generic error handling
      category = this.categorizeGenericError(error);
      severity = this.determineSeverity(error);
      code = this.generateErrorCode(error);
    }

    const tournamentError: TournamentError = {
      id: errorId,
      code,
      message: error.message,
      category,
      severity,
      context: {
        ...context,
        originalError: error.constructor.name
      },
      stack: error.stack,
      timestamp,
      userId: context.userId,
      tournamentId: context.tournamentId,
      correlationId
    };

    // Log the error
    await this.logError(tournamentError);

    // Notify if critical or high severity
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      await this.notifyError(tournamentError);
    }

    return tournamentError;
  }

  /**
   * Log error to database and external logging service
   */
  async logError(error: TournamentError): Promise<void> {
    try {
      // Log to database
      await this.prisma.errorLog.create({
        data: {
          id: error.id,
          code: error.code,
          message: error.message,
          category: error.category,
          severity: error.severity,
          context: error.context ? JSON.stringify(error.context) : undefined,
          stack: error.stack,
          userId: error.userId,
          tournamentId: error.tournamentId,
          correlationId: error.correlationId,
          createdAt: error.timestamp
        }
      });

      // Log using configured logger
      switch (error.severity) {
        case ErrorSeverity.CRITICAL:
        case ErrorSeverity.HIGH:
          this.logger.error(`[${error.code}] ${error.message}`, undefined, {
            errorId: error.id,
            category: error.category,
            context: error.context,
            correlationId: error.correlationId
          });
          break;
        case ErrorSeverity.MEDIUM:
          this.logger.warn(`[${error.code}] ${error.message}`, {
            errorId: error.id,
            category: error.category,
            context: error.context,
            correlationId: error.correlationId
          });
          break;
        case ErrorSeverity.LOW:
          this.logger.info(`[${error.code}] ${error.message}`, {
            errorId: error.id,
            category: error.category,
            context: error.context,
            correlationId: error.correlationId
          });
          break;
      }
    } catch (logError) {
      // If logging fails, at least try to log to console
      console.error('Failed to log error:', logError);
      console.error('Original error:', error);
    }
  }

  /**
   * Notify administrators of critical errors
   */
  async notifyError(error: TournamentError): Promise<void> {
    try {
      // Create notification record
      await this.prisma.notification.create({
        data: {
          type: 'ERROR_ALERT',
          channel: 'EMAIL',
          title: `Critical Error: ${error.code}`,
          message: `A ${error.severity} error occurred in the tournament system: ${error.message}`,
          data: JSON.stringify({
            errorId: error.id,
            category: error.category,
            context: error.context,
            correlationId: error.correlationId
          }),
          status: 'PENDING',
          createdAt: new Date()
        }
      });

      this.logger.info('Error notification created', {
        errorId: error.id,
        severity: error.severity,
        category: error.category
      });
    } catch (notifyError) {
      this.logger.error('Failed to create error notification', notifyError, {
        originalErrorId: error.id
      });
    }
  }

  /**
   * Get error statistics for monitoring
   */
  async getErrorStats(timeRange: { start: Date; end: Date }): Promise<{
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    topErrorCodes: Array<{ code: string; count: number }>;
  }> {
    const errors = await this.prisma.errorLog.findMany({
      where: {
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end
        }
      },
      select: {
        category: true,
        severity: true,
        code: true
      }
    });

    const stats = {
      totalErrors: errors.length,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      topErrorCodes: [] as Array<{ code: string; count: number }>
    };

    // Initialize counts
    Object.values(ErrorCategory).forEach(category => {
      stats.errorsByCategory[category] = 0;
    });
    Object.values(ErrorSeverity).forEach(severity => {
      stats.errorsBySeverity[severity] = 0;
    });

    // Count errors by category and severity
    const codeCount: Record<string, number> = {};
    errors.forEach(error => {
      stats.errorsByCategory[error.category as ErrorCategory]++;
      stats.errorsBySeverity[error.severity as ErrorSeverity]++;
      codeCount[error.code] = (codeCount[error.code] || 0) + 1;
    });

    // Get top error codes
    stats.topErrorCodes = Object.entries(codeCount)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Categorize generic errors
   */
  private categorizeGenericError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.constructor.name.toLowerCase();

    if (message.includes('database') || message.includes('prisma') || name.includes('prisma')) {
      return ErrorCategory.DATABASE;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (message.includes('payment') || message.includes('charge') || message.includes('refund')) {
      return ErrorCategory.PAYMENT;
    }
    if (message.includes('api') || message.includes('request') || message.includes('response')) {
      return ErrorCategory.EXTERNAL_API;
    }

    return ErrorCategory.SYSTEM;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    const name = error.constructor.name.toLowerCase();

    if (name.includes('syntax') || name.includes('reference') || message.includes('critical')) {
      return ErrorSeverity.CRITICAL;
    }
    if (message.includes('payment') || message.includes('security') || message.includes('unauthorized')) {
      return ErrorSeverity.HIGH;
    }
    if (message.includes('validation') || message.includes('not found')) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  /**
   * Generate error code based on error type
   */
  private generateErrorCode(error: Error): string {
    const name = error.constructor.name;
    const timestamp = Date.now().toString(36);
    return `${name.toUpperCase()}_${timestamp}`;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Generate correlation ID for request tracking
   */
  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
}

/**
 * Console Logger Implementation
 */
export class ConsoleLogger implements ILogger {
  private source: string;

  constructor(source: string = 'TournamentSystem') {
    this.source = source;
  }

  debug(message: string, context?: Record<string, any>): void {
    console.debug(`[${new Date().toISOString()}] [DEBUG] [${this.source}] ${message}`, context || '');
  }

  info(message: string, context?: Record<string, any>): void {
    console.info(`[${new Date().toISOString()}] [INFO] [${this.source}] ${message}`, context || '');
  }

  warn(message: string, context?: Record<string, any>): void {
    console.warn(`[${new Date().toISOString()}] [WARN] [${this.source}] ${message}`, context || '');
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    console.error(`[${new Date().toISOString()}] [ERROR] [${this.source}] ${message}`);
    if (error) {
      console.error('Error details:', error);
    }
    if (context) {
      console.error('Context:', context);
    }
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    console.error(`[${new Date().toISOString()}] [FATAL] [${this.source}] ${message}`);
    if (error) {
      console.error('Error details:', error);
    }
    if (context) {
      console.error('Context:', context);
    }
  }
}

/**
 * Create error handling middleware for Express
 */
export function createErrorMiddleware(errorHandler: IErrorHandler) {
  return async (error: Error, req: any, res: any, next: any) => {
    const context = {
      userId: req.user?.id,
      tournamentId: req.params?.tournamentId,
      correlationId: req.headers['x-correlation-id'] || req.id,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent']
    };

    const tournamentError = await errorHandler.handleError(error, context);

    // Return appropriate HTTP response
    const statusCode = getHttpStatusCode(error);
    res.status(statusCode).json({
      error: {
        id: tournamentError.id,
        code: tournamentError.code,
        message: tournamentError.message,
        category: tournamentError.category,
        correlationId: tournamentError.correlationId
      }
    });
  };
}

/**
 * Get appropriate HTTP status code for error type
 */
function getHttpStatusCode(error: Error): number {
  if (error instanceof TournamentValidationError) return 400;
  if (error instanceof TournamentNotFoundError) return 404;
  if (error instanceof InsufficientPermissionsError) return 403;
  if (error instanceof TournamentStateError) return 409;
  if (error instanceof PaymentProcessingError) return 402;
  if (error instanceof ExternalAPIError) return 502;

  return 500;
}