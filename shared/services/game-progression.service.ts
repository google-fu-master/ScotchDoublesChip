/**
 * Game Progression Service - Handles game lifecycle and scoring
 * Manages game creation, score entry, completion, and tournament progression
 */

import { PrismaClient } from '@prisma/client';
import { GameStatus, GameSubmission, GameWithDetails } from '../types/tournament.types';
import { ChipService } from './chip.service';
import { QueueService } from './queue.service';

export interface GameScore {
  winningTeamId: string;
  losingTeamId: string;
  winningTeamScore: number;
  losingTeamScore: number;
  submittedBy: string;
}

export interface GameData {
  rackInfo?: any[];
  breakPlayer?: string;
  matchDetails?: any;
  notes?: string;
}

export class GameProgressionService {
  private prisma: PrismaClient;
  private chipService: ChipService;
  private queueService: QueueService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.chipService = new ChipService(prisma);
    this.queueService = new QueueService(prisma);
  }

  /**
   * Start a game at a table
   */
  async startGame(gameId: string, directorId?: string): Promise<void> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        include: {
          tournament: true,
          table: {
            include: {
              assignedTeams: true
            }
          }
        }
      });

      if (!game) {
        throw new Error('Game not found');
      }

      if (game.status !== 'NOT_STARTED') {
        throw new Error('Game already started or completed');
      }

      // Verify teams are at table
      const teamsAtTable = game.table?.assignedTeams || [];
      if (teamsAtTable.length < 2) {
        throw new Error('Need 2 teams at table to start game');
      }

      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      });

    } catch (error) {
      throw new Error(`Failed to start game: ${error}`);
    }
  }

  /**
   * Submit game scores
   */
  async submitGameScores(submission: GameSubmission): Promise<GameWithDetails> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: submission.gameId },
        include: {
          tournament: true,
          table: {
            include: {
              assignedTeams: true
            }
          }
        }
      });

      if (!game) {
        throw new Error('Game not found');
      }

      if (game.status === 'COMPLETED') {
        throw new Error('Game already completed');
      }

      // Get the teams assigned to this table for this game
      const teamsAtTable = game.table?.assignedTeams || [];
      if (teamsAtTable.length !== 2) {
        throw new Error('Game must have exactly 2 teams assigned');
      }

      // Determine winner and loser from scores
      const isHomeWinner = submission.homeScore > submission.awayScore;
      const team1 = teamsAtTable[0];
      const team2 = teamsAtTable[1];
      
      // Assign winner/loser based on score (we don't have home/away, so use team order)
      const winningTeamId = isHomeWinner ? team1.id : team2.id;
      const losingTeamId = isHomeWinner ? team2.id : team1.id;

      // Update game with scores
      const updatedGame = await this.prisma.game.update({
        where: { id: submission.gameId },
        data: {
          winningTeamId,
          losingTeamId,
          winningTeamScore: isHomeWinner ? submission.homeScore : submission.awayScore,
          losingTeamScore: isHomeWinner ? submission.awayScore : submission.homeScore,
          notes: submission.notes,
          scoresSubmitted: true,
          submittedBy: 'system', // TODO: Get actual user
          status: 'COMPLETED',
          completedAt: new Date()
        },
        include: {
          tournament: true,
          winningTeam: {
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
          },
          losingTeam: {
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
          },
          table: true
        }
      });

      // Process game completion
      await this.processGameCompletion(submission.gameId);

      return updatedGame as GameWithDetails;
    } catch (error) {
      throw new Error(`Failed to submit game scores: ${error}`);
    }
  }

  /**
   * Approve game scores (director action)
   */
  async approveGameScores(gameId: string, directorId: string): Promise<void> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        include: {
          tournament: true
        }
      });

      if (!game) {
        throw new Error('Game not found');
      }

      if (!game.scoresSubmitted) {
        throw new Error('Scores must be submitted before approval');
      }

      if (game.scoresApproved) {
        throw new Error('Game scores already approved');
      }

      // Verify director access (unless system auto-approval)
      if (directorId !== 'system') {
        const director = await this.prisma.tournamentDirector.findFirst({
          where: {
            tournamentId: game.tournamentId,
            playerId: directorId
          }
        });

        if (!director) {
          throw new Error('Director access denied');
        }
      }

      // Approve and complete game
      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          scoresApproved: true,
          approvedBy: directorId,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Process game completion
      await this.processGameCompletion(gameId);

    } catch (error) {
      throw new Error(`Failed to approve game scores: ${error}`);
    }
  }

  /**
   * Process game completion - handle chips, table assignments, queue management
   */
  async processGameCompletion(gameId: string): Promise<void> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        include: {
          tournament: true,
          winningTeam: true,
          losingTeam: true,
          table: true
        }
      });

      if (!game || !game.winningTeam || !game.losingTeam) {
        throw new Error('Game or teams not found');
      }

      // Process chip transfers
      await this.chipService.processGameResult(gameId);

      // Handle table assignments and winner stays logic
      await this.handlePostGameAssignments(game);

      // Update tournament round if needed
      await this.updateTournamentRound(game.tournamentId);

    } catch (error) {
      throw new Error(`Failed to process game completion: ${error}`);
    }
  }

  /**
   * Handle table assignments after game completion
   */
  private async handlePostGameAssignments(game: any): Promise<void> {
    if (!game.table || !game.winningTeam || !game.losingTeam) {
      return;
    }

    const { table, tournament, winningTeam, losingTeam } = game;

    // Remove losing team from table
    await this.prisma.team.update({
      where: { id: losingTeam.id },
      data: {
        currentTableId: null,
        assignedAt: null
      }
    });

    // Check if losing team is eliminated
    if (losingTeam.currentChips === 0) {
      // Don't add eliminated teams back to queue
      return;
    }

    // Add losing team back to queue if they have chips
    await this.queueService.addTeamToQueue(tournament.id, losingTeam.id);

    // Winner stays at table logic
    if (game.winnerStays && winningTeam.currentChips > 0) {
      // Keep winner at table
      await this.prisma.team.update({
        where: { id: winningTeam.id },
        data: {
          currentTableId: table.id,
          assignedAt: new Date()
        }
      });

      // Update table to ready for next assignment
      await this.prisma.table.update({
        where: { id: table.id },
        data: {
          status: 'AVAILABLE',
          currentWinningTeamId: winningTeam.id
        }
      });
    } else {
      // Both teams leave table
      await this.prisma.team.update({
        where: { id: winningTeam.id },
        data: {
          currentTableId: null,
          assignedAt: null
        }
      });

      // Add winning team back to queue if they have chips
      if (winningTeam.currentChips > 0) {
        await this.queueService.addTeamToQueue(tournament.id, winningTeam.id);
      }

      // Clear table
      await this.prisma.table.update({
        where: { id: table.id },
        data: {
          status: 'AVAILABLE',
          currentWinningTeamId: null
        }
      });
    }
  }

  /**
   * Update game data (rack info, break player, etc.)
   */
  async updateGameData(gameId: string, gameData: GameData, updatedBy: string): Promise<void> {
    try {
      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          gameData: JSON.stringify(gameData),
          notes: gameData.notes
        }
      });
    } catch (error) {
      throw new Error(`Failed to update game data: ${error}`);
    }
  }

  /**
   * Cancel a game (director action)
   */
  async cancelGame(gameId: string, directorId: string, reason?: string): Promise<void> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        include: {
          tournament: true,
          table: {
            include: {
              assignedTeams: true
            }
          }
        }
      });

      if (!game) {
        throw new Error('Game not found');
      }

      // Verify director access
      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId: game.tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      // Cancel game
      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          status: 'CANCELLED',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled by director'
        }
      });

      // Move teams back to queue
      const teamsAtTable = game.table?.assignedTeams || [];
      for (const team of teamsAtTable) {
        await this.queueService.addTeamToQueue(game.tournamentId, team.id);
        
        // Remove from table
        await this.prisma.team.update({
          where: { id: team.id },
          data: {
            currentTableId: null,
            assignedAt: null
          }
        });
      }

      // Clear table
      if (game.table) {
        await this.prisma.table.update({
          where: { id: game.table.id },
          data: { status: 'AVAILABLE' }
        });
      }

    } catch (error) {
      throw new Error(`Failed to cancel game: ${error}`);
    }
  }

  /**
   * Modify game scores (director override)
   */
  async modifyGameScores(
    gameId: string,
    scoreData: GameScore,
    directorId: string,
    reason?: string
  ): Promise<void> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        include: { tournament: true }
      });

      if (!game) {
        throw new Error('Game not found');
      }

      // Verify director access
      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId: game.tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      // If game was already completed, reverse chip effects
      if (game.status === 'COMPLETED' && game.winningTeamId && game.losingTeamId) {
        // Reverse previous chip transactions
        await this.reverseChipTransactions(gameId);
      }

      // Update game with new scores
      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          winningTeamId: scoreData.winningTeamId,
          losingTeamId: scoreData.losingTeamId,
          winningTeamScore: scoreData.winningTeamScore,
          losingTeamScore: scoreData.losingTeamScore,
          scoresSubmitted: true,
          scoresApproved: true,
          submittedBy: directorId,
          approvedBy: directorId,
          status: 'COMPLETED',
          completedAt: new Date(),
          notes: reason ? `Modified by director: ${reason}` : 'Scores modified by director'
        }
      });

      // Process new chip effects
      await this.chipService.processGameResult(gameId);

    } catch (error) {
      throw new Error(`Failed to modify game scores: ${error}`);
    }
  }

  /**
   * Reverse chip transactions for a game
   */
  private async reverseChipTransactions(gameId: string): Promise<void> {
    const transactions = await this.prisma.chipTransaction.findMany({
      where: { gameId }
    });

    for (const transaction of transactions) {
      if (transaction.teamId) {
        // Reverse the chip change
        const reverseAmount = -transaction.amount;
        
        await this.prisma.team.update({
          where: { id: transaction.teamId },
          data: {
            currentChips: { increment: reverseAmount }
          }
        });

        // Create reversal transaction
        await this.prisma.chipTransaction.create({
          data: {
            tournamentId: transaction.tournamentId,
            teamId: transaction.teamId,
            gameId: gameId,
            type: 'ADJUSTMENT',
            amount: reverseAmount,
            description: `Reversal of previous game result`,
            createdBy: 'system'
          }
        });
      }
    }
  }

  /**
   * Get game details with complete information
   */
  async getGameDetails(gameId: string): Promise<any> {
    return await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        tournament: true,
        table: true,
        winningTeam: {
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
        },
        losingTeam: {
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
        },
        results: {
          include: {
            playerProfile: {
              include: {
                player: true
              }
            }
          }
        },
        chipTransactions: true
      }
    });
  }

  /**
   * Update tournament round tracking
   */
  private async updateTournamentRound(tournamentId: string): Promise<void> {
    // Get count of completed games in current round
    const completedGames = await this.prisma.game.count({
      where: {
        tournamentId,
        status: 'COMPLETED'
      }
    });

    // Update tournament round based on game progression
    // This is a simplified version - could be more sophisticated
    const currentRound = Math.floor(completedGames / 10) + 1;

    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { currentRound }
    });
  }

  /**
   * Get active games for tournament
   */
  async getActiveGames(tournamentId: string): Promise<any[]> {
    return await this.prisma.game.findMany({
      where: {
        tournamentId,
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] }
      },
      include: {
        table: true,
        winningTeam: {
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
        },
        losingTeam: {
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
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get game history for tournament
   */
  async getGameHistory(tournamentId: string, limit?: number): Promise<any[]> {
    return await this.prisma.game.findMany({
      where: {
        tournamentId,
        status: 'COMPLETED'
      },
      include: {
        table: true,
        winningTeam: {
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
        },
        losingTeam: {
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
      },
      orderBy: { completedAt: 'desc' },
      take: limit
    });
  }
}