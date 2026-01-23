/**
 * Tournament API Routes
 * RESTful API endpoints for tournament management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IServiceContainer } from '../services/service-container';
import { 
  CreateTournamentRequest, 
  AddTeamRequest,
  SubmitScoresRequest,
  DirectorAction,
  TournamentValidationError,
  PayoutCalculation,
  PayoutSplit
} from '../types/tournament.types';
import { validateTournamentCreation } from '../types/tournament-validation.types';

// Request validation schemas
const createTournamentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  venueId: z.string(),
  playerType: z.enum(['SINGLES', 'SCOTCH_DOUBLES']),
  gameType: z.enum(['EIGHT_BALL', 'NINE_BALL', 'TEN_BALL']),
  estimatedEntrants: z.number().int().positive().optional(),
  playersPerTable: z.number().int().min(2).max(8).optional(),
  raceToWins: z.number().int().min(1).max(10).optional(),
  entryFee: z.number().min(0).optional(),
  adminFee: z.number().min(0).optional(),
  addedMoney: z.number().min(0).optional(),
  defaultChipsPerPlayer: z.number().int().min(1).max(100).optional(),
  chipRanges: z.array(z.object({
    minFargo: z.number().int().min(0),
    maxFargo: z.number().int().min(0),
    chips: z.number().int().min(1).max(100)
  })).optional()
});

const addTeamSchema = z.object({
  player1Id: z.string(),
  player2Id: z.string(),
  teamName: z.string().optional()
});

const submitScoresSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  forfeit: z.boolean().optional(),
  notes: z.string().optional()
});

const directorActionSchema = z.object({
  action: z.enum(['approve_scores', 'modify_scores', 'assign_table', 'manual_payout', 'chip_adjustment']),
  targetId: z.string(),
  parameters: z.record(z.string(), z.any()),
  reason: z.string().optional()
});

// Request context interface
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  tournament?: {
    id: string;
    isDirector?: boolean;
  };
}

/**
 * Tournament API Controller
 */
export class TournamentApiController {
  constructor(private serviceContainer: IServiceContainer) {}

  /**
   * Create tournament API routes
   */
  public createRoutes(): Router {
    const router = Router();

    // Tournament CRUD operations
    router.post('/tournaments', this.createTournament.bind(this));
    router.get('/tournaments/:id', this.getTournament.bind(this));
    router.get('/tournaments/:id/state', this.getTournamentState.bind(this));
    router.patch('/tournaments/:id', this.updateTournament.bind(this));
    router.delete('/tournaments/:id', this.deleteTournament.bind(this));

    // Tournament lifecycle
    router.post('/tournaments/:id/start', this.startTournament.bind(this));
    router.post('/tournaments/:id/complete', this.completeTournament.bind(this));
    router.post('/tournaments/:id/reset', this.resetTournament.bind(this));

    // Team management
    router.post('/tournaments/:id/teams', this.addTeam.bind(this));
    router.get('/tournaments/:id/teams', this.getTeams.bind(this));
    router.patch('/tournaments/:id/teams/:teamId', this.updateTeam.bind(this));
    router.delete('/tournaments/:id/teams/:teamId', this.removeTeam.bind(this));

    // Game management
    router.get('/tournaments/:id/games', this.getGames.bind(this));
    router.get('/tournaments/:id/games/active', this.getActiveGames.bind(this));
    router.post('/tournaments/:id/games/:gameId/scores', this.submitScores.bind(this));
    router.post('/tournaments/:id/games/:gameId/approve', this.approveScores.bind(this));
    router.patch('/tournaments/:id/games/:gameId', this.modifyGame.bind(this));

    // Table management
    router.get('/tournaments/:id/tables', this.getTables.bind(this));
    router.post('/tournaments/:id/tables/:tableId/assign', this.assignTable.bind(this));
    router.delete('/tournaments/:id/tables/:tableId/assignment', this.clearTableAssignment.bind(this));

    // Queue management
    router.get('/tournaments/:id/queue', this.getQueue.bind(this));
    router.post('/tournaments/:id/queue/shuffle', this.shuffleQueue.bind(this));
    router.patch('/tournaments/:id/queue', this.updateQueue.bind(this));

    // Money and payouts
    router.get('/tournaments/:id/money', this.getMoneyBreakdown.bind(this));
    router.post('/tournaments/:id/payouts', this.createPayouts.bind(this));
    router.post('/tournaments/:id/payouts/:payoutId/split', this.createPayoutSplit.bind(this));
    router.post('/tournaments/:id/payouts/:payoutId/payment', this.processPayment.bind(this));

    // Chip management
    router.get('/tournaments/:id/chips', this.getChipStatus.bind(this));
    router.post('/tournaments/:id/teams/:teamId/chips/adjust', this.adjustChips.bind(this));
    router.get('/tournaments/:id/teams/:teamId/chips/history', this.getChipHistory.bind(this));

    // Director actions
    router.post('/tournaments/:id/director-actions', this.performDirectorAction.bind(this));
    router.get('/tournaments/:id/director-actions', this.getDirectorActions.bind(this));

    // Side pots
    router.get('/tournaments/:id/side-pots', this.getSidePots.bind(this));
    router.post('/tournaments/:id/side-pots', this.createSidePot.bind(this));
    router.post('/tournaments/:id/side-pots/:sidePotId/enter', this.enterSidePot.bind(this));

    // Statistics and reporting
    router.get('/tournaments/:id/leaderboard', this.getLeaderboard.bind(this));
    router.get('/tournaments/:id/statistics', this.getStatistics.bind(this));
    router.get('/tournaments/:id/export', this.exportTournament.bind(this));

    // System health and monitoring
    router.get('/health', this.healthCheck.bind(this));
    router.get('/metrics', this.getMetrics.bind(this));

    return router;
  }

  // Tournament CRUD operations
  private async createTournament(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = createTournamentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Invalid request data', details: validation.error.issues });
        return;
      }

      const data = validation.data as CreateTournamentRequest;
      validateTournamentCreation(data);

      const tournament = await this.serviceContainer
        .getTournamentService()
        .createTournament(data, req.user!.id);

      res.status(201).json({ tournament });
    } catch (error) {
      next(error);
    }
  }

  private async getTournament(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tournamentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const tournament = await this.serviceContainer
        .getPrisma()
        .tournament.findUnique({
          where: { id: tournamentId },
          include: {
            venue: true,
            directors: true,
            teams: {
              include: {
                members: {
                  include: {
                    playerProfile: {
                      include: {
                        player: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

      if (!tournament) {
        res.status(404).json({ error: 'Tournament not found' });
        return;
      }

      res.json({ tournament });
    } catch (error) {
      next(error);
    }
  }

  private async getTournamentState(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tournamentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const state = await this.serviceContainer
        .getTournamentService()
        .getTournamentState(tournamentId);

      res.json({ state });
    } catch (error) {
      next(error);
    }
  }

  // Tournament lifecycle
  private async startTournament(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tournamentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.serviceContainer
        .getTournamentService()
        .startTournament(tournamentId, req.user!.id);

      res.json({ message: 'Tournament started successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Team management
  private async addTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = addTeamSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Invalid request data', details: validation.error.issues });
        return;
      }

      const tournamentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const teamRequest: AddTeamRequest = {
        tournamentId,
        ...validation.data
      };

      const team = await this.serviceContainer
        .getTournamentService()
        .addTeam(teamRequest, req.user!.id);

      res.status(201).json({ team });
    } catch (error) {
      next(error);
    }
  }

  // Game management
  private async submitScores(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = submitScoresSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Invalid request data', details: validation.error.issues });
        return;
      }

      const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
      const { homeScore, awayScore, forfeit, notes } = validation.data;
      const winner: 'home' | 'away' = forfeit ? 'away' : (homeScore > awayScore ? 'home' : 'away');
      
      const submission = {
        gameId,
        homeScore,
        awayScore,
        winner,
        forfeit,
        notes,
        submittedBy: req.user!.id,
        submittedAt: new Date(),
        requiresApproval: true
      };

      const game = await this.serviceContainer
        .getGameProgressionService()
        .submitGameScores(submission);

      res.json({ game });
    } catch (error) {
      next(error);
    }
  }

  private async approveScores(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
      await this.serviceContainer
        .getGameProgressionService()
        .approveGameScores(gameId, req.user!.id);

      res.json({ message: 'Scores approved successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Money management
  private async getMoneyBreakdown(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tournamentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const breakdown = await this.serviceContainer
        .getMoneyCalculationService()
        .calculateTournamentMoney(tournamentId);

      res.json({ breakdown });
    } catch (error) {
      next(error);
    }
  }

  private async createPayouts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tournamentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { payouts }: { payouts: PayoutCalculation[] } = req.body;

      await this.serviceContainer
        .getMoneyCalculationService()
        .createPayouts(tournamentId, payouts);

      res.json({ message: 'Payouts created successfully' });
    } catch (error) {
      next(error);
    }
  }

  // System health
  private async healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await this.serviceContainer.healthCheck();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      next(error);
    }
  }

  // Placeholder methods for remaining endpoints
  private async updateTournament(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async deleteTournament(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async completeTournament(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async resetTournament(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getTeams(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async updateTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async removeTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getGames(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getActiveGames(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async modifyGame(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getTables(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async assignTable(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async clearTableAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async shuffleQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async updateQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async createPayoutSplit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async processPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getChipStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async adjustChips(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getChipHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async performDirectorAction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getDirectorActions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getSidePots(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async createSidePot(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async enterSidePot(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getLeaderboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async exportTournament(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  private async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: 'Not implemented yet' });
  }
}

/**
 * Create tournament API routes with dependency injection
 */
export function createTournamentApi(serviceContainer: IServiceContainer): Router {
  const controller = new TournamentApiController(serviceContainer);
  return controller.createRoutes();
}

/**
 * Express app factory with tournament API
 */
export function createTournamentApp(serviceContainer: IServiceContainer): any {
  const express = require('express');
  const cors = require('cors');
  const { createErrorMiddleware } = require('../services/error-handling.service');
  
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Add correlation ID middleware
  app.use((req: any, res: any, next: any) => {
    req.id = req.headers['x-correlation-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    res.setHeader('X-Correlation-ID', req.id);
    next();
  });

  // API routes
  app.use('/api/v1', createTournamentApi(serviceContainer));

  // Error handling middleware
  app.use(createErrorMiddleware(serviceContainer.getErrorHandler()));

  // 404 handler
  app.use((req: any, res: any) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  return app;
}