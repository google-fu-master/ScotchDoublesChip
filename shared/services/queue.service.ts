/**
 * Queue Service - Manages tournament queue and team ordering
 * Handles queue initialization, shuffling, assignments, and repeat matchup avoidance
 */

import { PrismaClient } from '@prisma/client';
import { BracketOrdering } from '@prisma/client';
import { TeamWithDetails } from '../types/tournament.types';

export interface QueueTeam {
  id: string;
  name: string;
  currentChips: number;
  combinedFargo?: number;
  seed?: number;
  isActive: boolean;
}

export class QueueService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Initialize tournament queue with proper team ordering
   */
  async initializeQueue(tournamentId: string, ordering: BracketOrdering): Promise<void> {
    try {
      const teams = await this.getActiveTeams(tournamentId);

      if (teams.length === 0) {
        throw new Error('No active teams found for queue initialization');
      }

      let orderedTeams: QueueTeam[];

      switch (ordering) {
        case BracketOrdering.RANDOM_DRAW:
          orderedTeams = this.shuffleTeams(teams);
          break;
        case BracketOrdering.SEEDED_DRAW:
          orderedTeams = this.orderBySeeding(teams);
          break;
        case BracketOrdering.SET_ORDER:
          orderedTeams = this.orderByManualSeed(teams);
          break;
        default:
          orderedTeams = this.shuffleTeams(teams);
      }

      // Update queue in database
      await this.updateQueue(tournamentId, orderedTeams.map(team => team.id));

      // Update team queue positions
      await this.updateTeamQueuePositions(orderedTeams);

    } catch (error) {
      throw new Error(`Failed to initialize queue: ${error}`);
    }
  }

  /**
   * Get active teams for queue management
   */
  private async getActiveTeams(tournamentId: string): Promise<QueueTeam[]> {
    const teams = await this.prisma.team.findMany({
      where: {
        tournamentId,
        status: 'ACTIVE',
        currentChips: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        currentChips: true,
        combinedFargo: true,
        seed: true
      }
    });

    return teams.map(team => ({
      ...team,
      combinedFargo: team.combinedFargo ?? undefined, // Convert null to undefined
      seed: team.seed ?? undefined, // Convert null to undefined
      isActive: true
    }));
  }

  /**
   * Shuffle teams using Fisher-Yates algorithm
   */
  private shuffleTeams(teams: QueueTeam[]): QueueTeam[] {
    const shuffled = [...teams];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Order teams by seeding (highest vs lowest)
   */
  private orderBySeeding(teams: QueueTeam[]): QueueTeam[] {
    // Sort by combined Fargo if available, otherwise by current chips
    const sorted = teams.sort((a, b) => {
      const aRating = a.combinedFargo || a.currentChips * 100;
      const bRating = b.combinedFargo || b.currentChips * 100;
      return bRating - aRating; // Descending order
    });

    // Create bracket-style pairing order (1 vs last, 2 vs second-last, etc.)
    const paired: QueueTeam[] = [];
    const remaining = [...sorted];

    while (remaining.length >= 2) {
      paired.push(remaining.shift()!); // Highest seed
      paired.push(remaining.pop()!);   // Lowest seed
    }

    // Add any remaining team
    if (remaining.length > 0) {
      paired.push(remaining[0]);
    }

    return paired;
  }

  /**
   * Order teams by manual seed values
   */
  private orderByManualSeed(teams: QueueTeam[]): QueueTeam[] {
    return teams.sort((a, b) => {
      const aSeed = a.seed || 999;
      const bSeed = b.seed || 999;
      return aSeed - bSeed;
    });
  }

  /**
   * Update queue data in database
   */
  private async updateQueue(tournamentId: string, teamIds: string[]): Promise<void> {
    await this.prisma.tournamentQueue.upsert({
      where: { tournamentId },
      update: {
        queueOrder: JSON.stringify(teamIds),
        lastShuffled: new Date()
      },
      create: {
        tournamentId,
        queueOrder: JSON.stringify(teamIds),
        lastShuffled: new Date()
      }
    });
  }

  /**
   * Update team queue positions
   */
  private async updateTeamQueuePositions(teams: QueueTeam[]): Promise<void> {
    const updates = teams.map((team, index) =>
      this.prisma.team.update({
        where: { id: team.id },
        data: {
          queuePosition: index + 1,
          isQueued: true
        }
      })
    );

    await Promise.all(updates);
  }

  /**
   * Get next team from queue (avoiding repeat matchups if possible)
   */
  async getNextTeamForTable(tournamentId: string, tableId: string): Promise<string | null> {
    try {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get current queue
      const queue = await this.getQueueState(tournamentId);
      if (queue.length === 0) {
        return null;
      }

      // Get team currently at table (if any)
      const table = await this.prisma.table.findUnique({
        where: { id: tableId },
        include: {
          assignedTeams: true
        }
      });

      const currentTeamAtTable = table?.assignedTeams?.[0];

      if (!currentTeamAtTable) {
        // No team at table, return first in queue
        return queue[0];
      }

      // Find next team that hasn't played current team recently
      if (tournament.autopilotMode) {
        const nextTeam = await this.findBestMatchup(tournamentId, currentTeamAtTable.id, queue);
        return nextTeam;
      }

      // If autopilot is off, just return first in queue
      return queue[0];

    } catch (error) {
      throw new Error(`Failed to get next team for table: ${error}`);
    }
  }

  /**
   * Find best matchup avoiding recent repeats
   */
  private async findBestMatchup(
    tournamentId: string,
    currentTeamId: string,
    queueTeamIds: string[]
  ): Promise<string | null> {
    
    if (queueTeamIds.length === 0) {
      return null;
    }

    // Get pairing history for current team
    const pairings = await this.prisma.teamPairing.findMany({
      where: {
        tournamentId,
        OR: [
          { team1Id: currentTeamId },
          { team2Id: currentTeamId }
        ]
      },
      orderBy: { gamesPlayed: 'asc' }
    });

    // Create map of opponent -> times played
    const playHistory = new Map<string, number>();
    pairings.forEach(pairing => {
      const opponentId = pairing.team1Id === currentTeamId ? pairing.team2Id : pairing.team1Id;
      playHistory.set(opponentId, pairing.gamesPlayed);
    });

    // Find team with least play history
    let bestMatch = queueTeamIds[0];
    let minPlays = playHistory.get(bestMatch) || 0;

    for (const teamId of queueTeamIds) {
      const plays = playHistory.get(teamId) || 0;
      if (plays < minPlays) {
        bestMatch = teamId;
        minPlays = plays;
      }
    }

    return bestMatch;
  }

  /**
   * Remove team from queue
   */
  async removeTeamFromQueue(tournamentId: string, teamId: string): Promise<void> {
    try {
      const queue = await this.getQueueState(tournamentId);
      const updatedQueue = queue.filter(id => id !== teamId);

      await this.updateQueue(tournamentId, updatedQueue);

      // Update team status
      await this.prisma.team.update({
        where: { id: teamId },
        data: {
          isQueued: false,
          queuePosition: null
        }
      });

      // Reorder remaining teams
      await this.reorderQueue(tournamentId);

    } catch (error) {
      throw new Error(`Failed to remove team from queue: ${error}`);
    }
  }

  /**
   * Add team to end of queue
   */
  async addTeamToQueue(tournamentId: string, teamId: string): Promise<void> {
    try {
      const queue = await this.getQueueState(tournamentId);
      queue.push(teamId);

      await this.updateQueue(tournamentId, queue);

      // Update team status
      await this.prisma.team.update({
        where: { id: teamId },
        data: {
          isQueued: true,
          queuePosition: queue.length
        }
      });

    } catch (error) {
      throw new Error(`Failed to add team to queue: ${error}`);
    }
  }

  /**
   * Shuffle queue if random ordering is enabled
   */
  async shuffleQueue(tournamentId: string, directorId?: string): Promise<void> {
    try {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId }
      });

      if (!tournament?.randomOrderingEachRound) {
        return; // Random ordering not enabled
      }

      const queueTeamIds = await this.getQueueState(tournamentId);
      const shuffledIds = this.shuffleArray(queueTeamIds);

      await this.prisma.tournamentQueue.update({
        where: { tournamentId },
        data: {
          queueOrder: JSON.stringify(shuffledIds),
          lastShuffled: new Date(),
          shuffledBy: directorId
        }
      });

      // Update team positions
      const updates = shuffledIds.map((teamId, index) =>
        this.prisma.team.update({
          where: { id: teamId },
          data: { queuePosition: index + 1 }
        })
      );

      await Promise.all(updates);

    } catch (error) {
      throw new Error(`Failed to shuffle queue: ${error}`);
    }
  }

  /**
   * Get current queue state
   */
  async getQueueState(tournamentId: string): Promise<string[]> {
    const queue = await this.prisma.tournamentQueue.findUnique({
      where: { tournamentId }
    });

    if (!queue?.queueOrder) {
      return [];
    }

    try {
      return JSON.parse(queue.queueOrder as string);
    } catch {
      return [];
    }
  }

  /**
   * Reorder queue positions after changes
   */
  private async reorderQueue(tournamentId: string): Promise<void> {
    const queueTeamIds = await this.getQueueState(tournamentId);

    const updates = queueTeamIds.map((teamId, index) =>
      this.prisma.team.update({
        where: { id: teamId },
        data: { queuePosition: index + 1 }
      })
    );

    await Promise.all(updates);
  }

  /**
   * Get queue with team details for display
   */
  async getQueueWithDetails(tournamentId: string): Promise<any[]> {
    const queueTeamIds = await this.getQueueState(tournamentId);

    if (queueTeamIds.length === 0) {
      return [];
    }

    // Get teams in queue order
    const teams = await Promise.all(
      queueTeamIds.map(async (teamId) => {
        return await this.prisma.team.findUnique({
          where: { id: teamId },
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
        });
      })
    );

    return teams.filter(Boolean); // Remove any null results
  }

  /**
   * Update pairing history after a game
   */
  async updatePairingHistory(tournamentId: string, team1Id: string, team2Id: string): Promise<void> {
    try {
      // Ensure consistent ordering (lower ID first)
      const [firstTeamId, secondTeamId] = [team1Id, team2Id].sort();

      await this.prisma.teamPairing.upsert({
        where: {
          tournamentId_team1Id_team2Id: {
            tournamentId,
            team1Id: firstTeamId,
            team2Id: secondTeamId
          }
        },
        update: {
          gamesPlayed: { increment: 1 },
          lastPlayedAt: new Date()
        },
        create: {
          tournamentId,
          team1Id: firstTeamId,
          team2Id: secondTeamId,
          round: 1,
          gamesPlayed: 1,
          lastPlayedAt: new Date()
        }
      });

    } catch (error) {
      throw new Error(`Failed to update pairing history: ${error}`);
    }
  }

  /**
   * Fisher-Yates shuffle utility
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get teams that need to be re-queued (after finishing a game)
   */
  async getTeamsToRequeue(tournamentId: string): Promise<string[]> {
    const teams = await this.prisma.team.findMany({
      where: {
        tournamentId,
        status: 'ACTIVE',
        currentChips: { gt: 0 },
        isQueued: false,
        currentTableId: null
      },
      select: { id: true }
    });

    return teams.map(team => team.id);
  }
}