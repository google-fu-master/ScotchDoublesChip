/**
 * Table Assignment Service - Manages table assignments and game creation
 * Handles automatic assignments, manual director assignments, and winner-stays logic
 */

import { PrismaClient } from '@prisma/client';
import { AssignmentType } from '../types/tournament.types';
import { QueueService } from './queue.service';

export interface TableAssignment {
  tableId: string;
  teamId: string;
  assignmentType: AssignmentType;
  assignedBy?: string;
}

export class TableAssignmentService {
  private prisma: PrismaClient;
  private queueService: QueueService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.queueService = new QueueService(prisma);
  }

  /**
   * Make initial table assignments when tournament starts
   */
  async makeInitialAssignments(tournamentId: string): Promise<void> {
    try {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          venue: {
            include: {
              tables: {
                where: {
                  isActive: true,
                  status: 'OPEN'
                }
              }
            }
          }
        }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const availableTables = tournament.venue.tables;
      if (availableTables.length === 0) {
        return; // No tables available
      }

      // Get queue state
      const queueTeamIds = await this.queueService.getQueueState(tournamentId);
      
      // Assign teams to tables (2 teams per table for initial matchups)
      const assignments: TableAssignment[] = [];
      let teamIndex = 0;

      for (const table of availableTables) {
        // Need at least 2 teams for a matchup
        if (teamIndex + 1 >= queueTeamIds.length) {
          break;
        }

        const team1Id = queueTeamIds[teamIndex];
        const team2Id = queueTeamIds[teamIndex + 1];

        assignments.push({
          tableId: table.id,
          teamId: team1Id,
          assignmentType: 'INITIAL'
        });

        assignments.push({
          tableId: table.id,
          teamId: team2Id,
          assignmentType: 'INITIAL'
        });

        teamIndex += 2;
      }

      // Execute assignments
      for (const assignment of assignments) {
        await this.assignTeamToTable(assignment.tableId, assignment.teamId, assignment.assignmentType);
      }

      // Create initial games for assigned tables
      await this.createGamesForAssignedTables(tournamentId);

    } catch (error) {
      throw new Error(`Failed to make initial assignments: ${error}`);
    }
  }

  /**
   * Process automatic assignments after a game completes
   */
  async processAutomaticAssignments(tournamentId: string): Promise<void> {
    try {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId }
      });

      if (!tournament?.autopilotMode) {
        return; // Autopilot not enabled
      }

      // Get open tables that need assignments
      const openTables = await this.getTablesNeedingAssignments(tournamentId);

      for (const table of openTables) {
        await this.assignNextTeamsToTable(tournamentId, table.id);
      }

      // Shuffle queue if random ordering is enabled
      if (tournament.randomOrderingEachRound) {
        await this.queueService.shuffleQueue(tournamentId);
      }

    } catch (error) {
      throw new Error(`Failed to process automatic assignments: ${error}`);
    }
  }

  /**
   * Assign next teams to a specific table
   */
  private async assignNextTeamsToTable(tournamentId: string, tableId: string): Promise<void> {
    try {
      // Check if table already has teams assigned
      const currentAssignments = await this.prisma.team.count({
        where: { currentTableId: tableId }
      });

      if (currentAssignments >= 2) {
        return; // Table is full
      }

      // Get table details including current teams
      const table = await this.prisma.table.findUnique({
        where: { id: tableId },
        include: {
          assignedTeams: true,
          games: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              winningTeam: true
            }
          }
        }
      });

      if (!table) {
        throw new Error('Table not found');
      }

      // Handle winner stays logic
      if (table.assignedTeams.length === 1 && table.games.length > 0) {
        const lastGame = table.games[0];
        const winnerAtTable = table.assignedTeams[0];

        // If winner is still at table, get next opponent
        if (lastGame.winningTeam?.id === winnerAtTable.id) {
          const nextTeamId = await this.queueService.getNextTeamForTable(tournamentId, tableId);
          
          if (nextTeamId) {
            await this.assignTeamToTable(tableId, nextTeamId, 'FROM_QUEUE');
            await this.queueService.removeTeamFromQueue(tournamentId, nextTeamId);
            
            // Create new game
            await this.createGame(tournamentId, tableId, winnerAtTable.id, nextTeamId);
          }
          return;
        }
      }

      // Table needs fresh assignments
      await this.clearTableAssignments(tableId);

      // Get next 2 teams from queue
      const queueTeamIds = await this.queueService.getQueueState(tournamentId);
      
      if (queueTeamIds.length >= 2) {
        const team1Id = queueTeamIds[0];
        const team2Id = queueTeamIds[1];

        // Assign both teams
        await this.assignTeamToTable(tableId, team1Id, 'FROM_QUEUE');
        await this.assignTeamToTable(tableId, team2Id, 'FROM_QUEUE');

        // Remove from queue
        await this.queueService.removeTeamFromQueue(tournamentId, team1Id);
        await this.queueService.removeTeamFromQueue(tournamentId, team2Id);

        // Create game
        await this.createGame(tournamentId, tableId, team1Id, team2Id);
      }

    } catch (error) {
      throw new Error(`Failed to assign next teams to table: ${error}`);
    }
  }

  /**
   * Manually assign team to table (director override)
   */
  async manualTableAssignment(
    tableId: string,
    teamId: string,
    directorId: string,
    assignmentType: AssignmentType = 'INITIAL'
  ): Promise<void> {
    try {
      // Verify director access
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        include: { tournament: true }
      });

      if (!team) {
        throw new Error('Team not found');
      }

      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId: team.tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      // Remove team from queue if queued
      if (team.isQueued) {
        await this.queueService.removeTeamFromQueue(team.tournamentId, teamId);
      }

      // Remove from current table if assigned
      if (team.currentTableId) {
        await this.removeTeamFromTable(teamId);
      }

      // Assign to new table
      await this.assignTeamToTable(tableId, teamId, assignmentType, directorId);

      // Check if table is ready for a game
      await this.checkAndCreateGame(team.tournamentId, tableId);

    } catch (error) {
      throw new Error(`Failed to manually assign team to table: ${error}`);
    }
  }

  /**
   * Assign team to table
   */
  private async assignTeamToTable(
    tableId: string,
    teamId: string,
    assignmentType: AssignmentType,
    assignedBy?: string
  ): Promise<void> {
    try {
      // Update team assignment
      await this.prisma.team.update({
        where: { id: teamId },
        data: {
          currentTableId: tableId,
          assignedAt: new Date(),
          isQueued: false,
          queuePosition: null
        }
      });

      // Update table status
      await this.prisma.table.update({
        where: { id: tableId },
        data: {
          status: 'IN_USE',
          lastAssignedAt: new Date()
        }
      });

      // Create assignment record
      await this.prisma.teamAssignment.create({
        data: {
          tournamentId: (await this.prisma.team.findUnique({ 
            where: { id: teamId }, 
            select: { tournamentId: true } 
          }))!.tournamentId,
          teamId,
          tableId,
          assignmentType,
          assignedBy
        }
      });

    } catch (error) {
      throw new Error(`Failed to assign team to table: ${error}`);
    }
  }

  /**
   * Remove team from table
   */
  private async removeTeamFromTable(teamId: string): Promise<void> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        include: { currentTable: true }
      });

      if (!team?.currentTableId) {
        return; // Team not assigned to table
      }

      // Update team
      await this.prisma.team.update({
        where: { id: teamId },
        data: {
          currentTableId: null,
          assignedAt: null
        }
      });

      // Check if table is now empty
      const remainingTeams = await this.prisma.team.count({
        where: { currentTableId: team.currentTableId }
      });

      if (remainingTeams === 0) {
        await this.prisma.table.update({
          where: { id: team.currentTableId },
          data: { status: 'OPEN' }
        });
      }

    } catch (error) {
      throw new Error(`Failed to remove team from table: ${error}`);
    }
  }

  /**
   * Clear all assignments from a table
   */
  private async clearTableAssignments(tableId: string): Promise<void> {
    // Remove all teams from table
    await this.prisma.team.updateMany({
      where: { currentTableId: tableId },
      data: {
        currentTableId: null,
        assignedAt: null
      }
    });

    // Update table status
    await this.prisma.table.update({
      where: { id: tableId },
      data: { status: 'OPEN' }
    });
  }

  /**
   * Create game for assigned teams
   */
  private async createGame(
    tournamentId: string,
    tableId: string,
    team1Id: string,
    team2Id: string
  ): Promise<void> {
    try {
      // Get tournament settings
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get next game number
      const gameCount = await this.prisma.game.count({
        where: { tournamentId }
      });

      // Create game
      await this.prisma.game.create({
        data: {
          tournamentId,
          tableId,
          gameNumber: gameCount + 1,
          raceToWins: tournament.raceToWins,
          status: 'NOT_STARTED'
        }
      });

      // Update pairing history
      await this.queueService.updatePairingHistory(tournamentId, team1Id, team2Id);

      // Update table status
      await this.prisma.table.update({
        where: { id: tableId },
        data: { status: 'IN_USE' }
      });

    } catch (error) {
      throw new Error(`Failed to create game: ${error}`);
    }
  }

  /**
   * Create games for all tables with 2+ teams assigned
   */
  private async createGamesForAssignedTables(tournamentId: string): Promise<void> {
    const tables = await this.prisma.table.findMany({
      where: {
        venue: {
          tournaments: {
            some: { id: tournamentId }
          }
        },
        assignedTeams: {
          some: {}
        }
      },
      include: {
        assignedTeams: true
      }
    });

    for (const table of tables) {
      if (table.assignedTeams.length >= 2) {
        const team1 = table.assignedTeams[0];
        const team2 = table.assignedTeams[1];

        await this.createGame(tournamentId, table.id, team1.id, team2.id);
      }
    }
  }

  /**
   * Check if table is ready for a game and create it
   */
  private async checkAndCreateGame(tournamentId: string, tableId: string): Promise<void> {
    const teamsAtTable = await this.prisma.team.findMany({
      where: { currentTableId: tableId }
    });

    if (teamsAtTable.length === 2) {
      // Check if there's already an active game at this table
      const activeGame = await this.prisma.game.findFirst({
        where: {
          tableId,
          status: { in: ['NOT_STARTED', 'IN_PROGRESS'] }
        }
      });

      if (!activeGame) {
        await this.createGame(tournamentId, tableId, teamsAtTable[0].id, teamsAtTable[1].id);
      }
    }
  }

  /**
   * Get tables that need assignments
   */
  private async getTablesNeedingAssignments(tournamentId: string): Promise<any[]> {
    return await this.prisma.table.findMany({
      where: {
        venue: {
          tournaments: {
            some: { id: tournamentId }
          }
        },
        isActive: true,
        status: 'OPEN',
        assignedTeams: {
          none: {}
        }
      }
    });
  }

  /**
   * Get table status for tournament overview
   */
  async getTableStatuses(tournamentId: string): Promise<any[]> {
    const venue = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        venue: {
          include: {
            tables: {
              include: {
                assignedTeams: {
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
                games: {
                  where: {
                    status: { in: ['NOT_STARTED', 'IN_PROGRESS'] }
                  },
                  include: {
                    winningTeam: true,
                    losingTeam: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return venue?.venue.tables || [];
  }

  /**
   * Close table (director action)
   */
  async closeTable(tableId: string, directorId: string): Promise<void> {
    try {
      // Move teams back to queue
      const teamsAtTable = await this.prisma.team.findMany({
        where: { currentTableId: tableId },
        include: { tournament: true }
      });

      for (const team of teamsAtTable) {
        await this.queueService.addTeamToQueue(team.tournamentId, team.id);
        await this.removeTeamFromTable(team.id);
      }

      // Close table
      await this.prisma.table.update({
        where: { id: tableId },
        data: {
          status: 'CLOSED',
          closedBy: directorId,
          closedAt: new Date()
        }
      });

    } catch (error) {
      throw new Error(`Failed to close table: ${error}`);
    }
  }

  /**
   * Open closed table
   */
  async openTable(tableId: string): Promise<void> {
    await this.prisma.table.update({
      where: { id: tableId },
      data: {
        status: 'OPEN',
        closedBy: null,
        closedAt: null
      }
    });
  }

  /**
   * Force winner stays at table
   */
  async forceWinnerStays(tableId: string, winningTeamId: string, directorId: string): Promise<void> {
    try {
      // Verify access
      const team = await this.prisma.team.findUnique({
        where: { id: winningTeamId },
        include: { tournament: true }
      });

      if (!team) {
        throw new Error('Team not found');
      }

      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId: team.tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      // Clear other teams from table
      await this.prisma.team.updateMany({
        where: {
          currentTableId: tableId,
          id: { not: winningTeamId }
        },
        data: {
          currentTableId: null,
          assignedAt: null
        }
      });

      // Ensure winning team stays
      await this.prisma.team.update({
        where: { id: winningTeamId },
        data: {
          currentTableId: tableId,
          assignedAt: new Date()
        }
      });

      // Get next opponent
      const nextTeamId = await this.queueService.getNextTeamForTable(team.tournamentId, tableId);
      
      if (nextTeamId) {
        await this.assignTeamToTable(tableId, nextTeamId, 'WINNER_STAYS', directorId);
        await this.queueService.removeTeamFromQueue(team.tournamentId, nextTeamId);
        
        // Create new game
        await this.createGame(team.tournamentId, tableId, winningTeamId, nextTeamId);
      }

    } catch (error) {
      throw new Error(`Failed to force winner stays: ${error}`);
    }
  }
}