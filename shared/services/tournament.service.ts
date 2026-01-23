/**
 * Tournament Service - Core tournament management and orchestration
 * Handles tournament lifecycle, state management, and coordination between services
 */

import { PrismaClient, BracketOrdering, PayoutType } from '@prisma/client';
import { 
  Tournament, 
  TournamentStatus, 
  Team, 
  PlayerType,
  AddTeamRequest,
  TeamWithDetails,
  GameScore
} from '../types/tournament.types';
import { ChipService } from './chip.service';
import { QueueService } from './queue.service';
import { TableAssignmentService } from './table-assignment.service';
import { GameProgressionService } from './game-progression.service';
import { MoneyCalculationService } from './money-calculation.service';

export interface TournamentCreationData {
  name: string;
  description?: string;
  venueId: string;
  playerType: PlayerType;
  gameType: string;
  estimatedEntrants?: number;
  playersPerTable?: number;
  raceToWins?: number;
  bracketOrdering?: BracketOrdering;
  autopilotMode?: boolean;
  randomOrderingEachRound?: boolean;
  entryFee?: number;
  adminFee?: number;
  addedMoney?: number;
  payoutType?: PayoutType;
  settings?: any;
  chipRanges?: Array<{
    minFargo: number;
    maxFargo: number;
    chips: number;
  }>;
}

export class TournamentService {
  private prisma: PrismaClient;
  private chipService: ChipService;
  private queueService: QueueService;
  private tableAssignmentService: TableAssignmentService;
  private gameProgressionService: GameProgressionService;
  private moneyCalculationService: MoneyCalculationService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.chipService = new ChipService(prisma);
    this.queueService = new QueueService(prisma);
    this.tableAssignmentService = new TableAssignmentService(prisma);
    this.gameProgressionService = new GameProgressionService(prisma);
    this.moneyCalculationService = new MoneyCalculationService(prisma);
  }

  /**
   * Create a new tournament with proper initialization
   */
  async createTournament(data: TournamentCreationData, directorId: string): Promise<Tournament> {
    try {
      const tournament = await this.prisma.tournament.create({
        data: {
          name: data.name,
          description: data.description,
          venueId: data.venueId,
          playerType: data.playerType,
          gameType: data.gameType as any, // TODO: Create proper enum
          estimatedEntrants: data.estimatedEntrants,
          playersPerTable: data.playersPerTable || 4,
          raceToWins: data.raceToWins || 1,
          bracketOrdering: data.bracketOrdering || 'RANDOM_DRAW',
          autopilotMode: data.autopilotMode || false,
          randomOrderingEachRound: data.randomOrderingEachRound || false,
          entryFee: data.entryFee,
          adminFee: data.adminFee,
          addedMoney: data.addedMoney,
          payoutType: data.payoutType,
          chipRanges: data.chipRanges ? JSON.stringify(data.chipRanges) : undefined,
          settings: data.settings || {},
          status: 'SETUP',
          // Create tournament director
          directors: {
            create: {
              playerId: directorId,
              role: 'TOURNAMENT_DIRECTOR'
            }
          },
          // Initialize tournament queue
          queue: {
            create: {
              queueOrder: JSON.stringify([])
            }
          }
        },
        include: {
          venue: true,
          directors: true,
          teams: true,
          queue: true
        }
      });

      return tournament as Tournament;
    } catch (error) {
      throw new Error(`Failed to create tournament: ${error}`);
    }
  }

  /**
   * Start a tournament - transition from setup to active state
   */
  async startTournament(tournamentId: string, directorId: string): Promise<Tournament> {
    try {
      // Verify director has permission
      await this.verifyDirectorAccess(tournamentId, directorId);

      // Get tournament with teams
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { 
          teams: { include: { members: { include: { playerProfile: true } } } },
          queue: true,
          venue: { include: { tables: true } }
        }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'SETUP') {
        throw new Error('Tournament must be in SETUP status to start');
      }

      if (tournament.teams.length < 2) {
        throw new Error('Need at least 2 teams to start tournament');
      }

      // Initialize chips for all teams
      await this.chipService.initializeTeamChips(tournamentId);

      // Initialize tournament queue with proper ordering
      await this.queueService.initializeQueue(tournamentId, tournament.bracketOrdering);

      // Make initial table assignments if autopilot is enabled
      if (tournament.autopilotMode) {
        await this.tableAssignmentService.makeInitialAssignments(tournamentId);
      }

      // Update tournament status
      const updatedTournament = await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          status: 'IN_PROGRESS',
          isStarted: true,
          startDate: new Date()
        },
        include: {
          venue: true,
          directors: true,
          teams: true,
          queue: true
        }
      });

      return updatedTournament as Tournament;
    } catch (error) {
      throw new Error(`Failed to start tournament: ${error}`);
    }
  }

  /**
   * Process game result and update tournament state
   */
  async processGameResult(gameId: string, result: GameScore): Promise<void> {
    try {
      // Get game with tournament info
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        include: {
          tournament: true,
          winningTeam: true,
          losingTeam: true
        }
      });

      if (!game || !game.tournament) {
        throw new Error('Game or tournament not found');
      }

      // Process chip transfers
      await this.chipService.processGameResult(gameId);

      // Update game progression
      await this.gameProgressionService.processGameCompletion(gameId);

      // Handle table assignments and queue management
      if (game.tournament.autopilotMode) {
        await this.tableAssignmentService.processAutomaticAssignments(game.tournament.id);
      }

      // Check for tournament completion
      await this.checkTournamentCompletion(game.tournament.id);

    } catch (error) {
      throw new Error(`Failed to process game result: ${error}`);
    }
  }

  /**
   * Add team to tournament
   */
  async addTeam(request: AddTeamRequest, directorId: string): Promise<TeamWithDetails> {
    try {
      await this.verifyDirectorAccess(request.tournamentId, directorId);

      const tournament = await this.prisma.tournament.findUnique({
        where: { id: request.tournamentId }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.isStarted) {
        throw new Error('Cannot add teams to started tournament');
      }

      // Calculate initial chips based on Fargo if configured
      const initialChips = await this.chipService.calculateInitialChips(
        request.tournamentId,
        undefined // TODO: Add combinedFargo to request
      );

      // Create team with members
      const team = await this.prisma.team.create({
        data: {
          tournamentId: request.tournamentId,
          name: request.teamName || `Team ${Date.now()}`,
          combinedFargo: undefined,
          initialChips,
          currentChips: 0, // Will be set when tournament starts
          members: {
            create: [
              {
                playerProfile: {
                  connect: { id: request.player1Id }
                },
                position: 'Player 1'
              },
              {
                playerProfile: {
                  connect: { id: request.player2Id }
                },
                position: 'Player 2'
              }
            ]
          }
        },
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
      });

      return team as TeamWithDetails;
    } catch (error) {
      throw new Error(`Failed to add team: ${error}`);
    }
  }

  /**
   * Get tournament with complete state
   */
  async getTournamentState(tournamentId: string): Promise<Tournament | null> {
    try {
      return await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          venue: {
            include: {
              tables: {
                include: {
                  assignedTeams: true,
                  games: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                  }
                }
              }
            }
          },
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
              },
              currentTable: true
            }
          },
          queue: true,
          directors: {
            include: {
              player: true
            }
          },
          games: {
            orderBy: { createdAt: 'desc' },
            include: {
              winningTeam: true,
              losingTeam: true,
              table: true
            }
          },
          payouts: {
            include: {
              team: true
            }
          },
          sidePots: {
            include: {
              entries: true
            }
          }
        }
      }) as Tournament | null;
    } catch (error) {
      throw new Error(`Failed to get tournament state: ${error}`);
    }
  }

  /**
   * Check if tournament is complete and handle completion
   */
  private async checkTournamentCompletion(tournamentId: string): Promise<void> {
    try {
      const teamsWithChips = await this.prisma.team.count({
        where: {
          tournamentId,
          currentChips: { gt: 0 }
        }
      });

      // Tournament is complete when only one team has chips
      if (teamsWithChips <= 1) {
        await this.completeTournament(tournamentId);
      }
    } catch (error) {
      throw new Error(`Failed to check tournament completion: ${error}`);
    }
  }

  /**
   * Complete tournament and calculate final payouts
   */
  private async completeTournament(tournamentId: string): Promise<void> {
    try {
      // Calculate and create payouts
      await this.moneyCalculationService.calculateFinalPayouts(tournamentId);

      // Update tournament status
      await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          status: 'COMPLETED',
          isCompleted: true,
          endDate: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Failed to complete tournament: ${error}`);
    }
  }

  /**
   * Verify director has access to tournament
   */
  private async verifyDirectorAccess(tournamentId: string, directorId: string): Promise<void> {
    const director = await this.prisma.tournamentDirector.findFirst({
      where: {
        tournamentId,
        playerId: directorId
      }
    });

    if (!director) {
      throw new Error('Director access denied');
    }
  }

  /**
   * Pause tournament
   */
  async pauseTournament(tournamentId: string, directorId: string): Promise<Tournament> {
    await this.verifyDirectorAccess(tournamentId, directorId);

    const tournament = await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'PAUSED' },
      include: {
        venue: true,
        teams: true,
        queue: true
      }
    });

    return tournament as Tournament;
  }

  /**
   * Resume paused tournament
   */
  async resumeTournament(tournamentId: string, directorId: string): Promise<Tournament> {
    await this.verifyDirectorAccess(tournamentId, directorId);

    const tournament = await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'IN_PROGRESS' },
      include: {
        venue: true,
        teams: true,
        queue: true
      }
    });

    return tournament as Tournament;
  }
}