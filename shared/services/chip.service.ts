/**
 * Chip Service - Handles all chip-related calculations and transactions
 * Manages chip assignments, birthday chips, game wins/losses, and manual adjustments
 */

import { PrismaClient } from '@prisma/client';
import { ChipTransactionType } from '../types/tournament.types';

export interface ChipRange {
  minFargo: number;
  maxFargo: number;
  chips: number;
}

export class ChipService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Calculate initial chips for a team based on their combined Fargo rating
   */
  async calculateInitialChips(tournamentId: string, combinedFargo?: number): Promise<number> {
    try {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Default chips if no Fargo provided or no chip ranges configured
      const defaultChips = tournament.defaultChipsPerPlayer;

      if (!combinedFargo || !tournament.chipRanges) {
        return defaultChips;
      }

      // Parse chip ranges from JSON
      let chipRanges: ChipRange[];
      try {
        chipRanges = JSON.parse(tournament.chipRanges as string);
      } catch {
        return defaultChips;
      }

      // Find matching chip range for combined Fargo
      const matchingRange = chipRanges.find(range =>
        combinedFargo >= range.minFargo && combinedFargo <= range.maxFargo
      );

      return matchingRange ? matchingRange.chips : defaultChips;
    } catch (error) {
      throw new Error(`Failed to calculate initial chips: ${error}`);
    }
  }

  /**
   * Initialize chips for all teams in a tournament when it starts
   */
  async initializeTeamChips(tournamentId: string): Promise<void> {
    try {
      const teams = await this.prisma.team.findMany({
        where: { tournamentId },
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

      for (const team of teams) {
        // Calculate chips (either use pre-calculated or calculate now)
        let initialChips = team.initialChips;
        if (!initialChips) {
          initialChips = await this.calculateInitialChips(tournamentId, team.combinedFargo || undefined);
        }

        // Check for birthday chips for team members
        const birthdayChips = await this.calculateBirthdayChips(team.members);

        const totalChips = initialChips + birthdayChips;

        // Update team chips
        await this.prisma.team.update({
          where: { id: team.id },
          data: {
            currentChips: totalChips,
            initialChips: initialChips
          }
        });

        // Create initial chip transaction
        await this.createChipTransaction({
          tournamentId,
          teamId: team.id,
          type: 'INITIAL_CHIPS',
          amount: initialChips,
          description: `Initial chips based on combined Fargo: ${team.combinedFargo || 'Default'}`
        });

        // Create birthday chip transactions if any
        if (birthdayChips > 0) {
          for (const member of team.members) {
            if (await this.isBirthdayChipEligible(member.playerProfile)) {
              await this.createChipTransaction({
                tournamentId,
                teamId: team.id,
                playerProfileId: member.playerProfileId,
                type: 'BIRTHDAY_CHIP',
                amount: 1,
                description: `Birthday chip for ${member.playerProfile.displayName}`
              });

              // Mark birthday chip as received
              await this.markBirthdayChipReceived(member.playerProfileId, tournamentId);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to initialize team chips: ${error}`);
    }
  }

  /**
   * Calculate birthday chips for team members
   */
  private async calculateBirthdayChips(teamMembers: any[]): Promise<number> {
    let birthdayChips = 0;

    for (const member of teamMembers) {
      if (await this.isBirthdayChipEligible(member.playerProfile)) {
        birthdayChips += 1; // 1 chip per birthday
      }
    }

    return birthdayChips;
  }

  /**
   * Check if player is eligible for birthday chip
   */
  private async isBirthdayChipEligible(playerProfile: any): Promise<boolean> {
    const player = playerProfile.player;
    
    // Must have birthday month/day set
    if (!player.birthdayMonth || !player.birthdayDay) {
      return false;
    }

    // Check if already received birthday chip in this tournament
    if (playerProfile.receivedBirthdayChip) {
      return false;
    }

    // Check if today is their birthday (month and day match)
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // getMonth() is 0-indexed
    const todayDay = today.getDate();

    return player.birthdayMonth === todayMonth && player.birthdayDay === todayDay;
  }

  /**
   * Mark birthday chip as received for a player in tournament
   */
  private async markBirthdayChipReceived(playerProfileId: string, tournamentId: string): Promise<void> {
    await this.prisma.playerProfile.update({
      where: { id: playerProfileId },
      data: {
        receivedBirthdayChip: true,
        birthdayChipDate: new Date()
      }
    });

    // Also update player's last birthday chip date
    const playerProfile = await this.prisma.playerProfile.findUnique({
      where: { id: playerProfileId },
      include: { player: true }
    });

    if (playerProfile) {
      await this.prisma.player.update({
        where: { id: playerProfile.playerId },
        data: {
          lastBirthdayChip: new Date()
        }
      });
    }
  }

  /**
   * Process game result and handle chip transfers
   */
  async processGameResult(gameId: string): Promise<void> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameId },
        include: {
          winningTeam: true,
          losingTeam: true,
          tournament: true
        }
      });

      if (!game || !game.winningTeam || !game.losingTeam) {
        throw new Error('Game or teams not found');
      }

      const chipsAwarded = game.chipsAwarded;

      // Winner gains chips
      await this.addChipsToTeam(game.winningTeam.id, chipsAwarded, 'GAME_WIN', gameId);

      // Loser loses chips
      await this.removeChipsFromTeam(game.losingTeam.id, chipsAwarded, 'GAME_LOSS', gameId);

    } catch (error) {
      throw new Error(`Failed to process game result: ${error}`);
    }
  }

  /**
   * Add chips to a team
   */
  async addChipsToTeam(
    teamId: string,
    amount: number,
    type: ChipTransactionType,
    gameId?: string,
    description?: string
  ): Promise<void> {
    try {
      // Update team chip count
      const team = await this.prisma.team.update({
        where: { id: teamId },
        data: {
          currentChips: { increment: amount },
          totalChipsWon: { increment: amount }
        },
        include: { tournament: true }
      });

      // Create transaction record
      await this.createChipTransaction({
        tournamentId: team.tournamentId,
        teamId: teamId,
        gameId: gameId,
        type: type,
        amount: amount,
        description: description || `${amount} chips awarded`
      });

    } catch (error) {
      throw new Error(`Failed to add chips to team: ${error}`);
    }
  }

  /**
   * Remove chips from a team
   */
  async removeChipsFromTeam(
    teamId: string,
    amount: number,
    type: ChipTransactionType,
    gameId?: string,
    description?: string
  ): Promise<void> {
    try {
      // Get current team state
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        include: { tournament: true }
      });

      if (!team) {
        throw new Error('Team not found');
      }

      // Calculate new chip count (can't go below 0)
      const newChipCount = Math.max(0, team.currentChips - amount);
      const actualLoss = team.currentChips - newChipCount;

      // Update team chip count
      await this.prisma.team.update({
        where: { id: teamId },
        data: {
          currentChips: newChipCount,
          totalChipsLost: { increment: actualLoss }
        }
      });

      // Create transaction record (negative amount for loss)
      await this.createChipTransaction({
        tournamentId: team.tournamentId,
        teamId: teamId,
        gameId: gameId,
        type: type,
        amount: -actualLoss,
        description: description || `${actualLoss} chips lost`
      });

      // Check if team is eliminated
      if (newChipCount === 0) {
        await this.eliminateTeam(teamId);
      }

    } catch (error) {
      throw new Error(`Failed to remove chips from team: ${error}`);
    }
  }

  /**
   * Manually adjust team chips (director override)
   */
  async manualChipAdjustment(
    teamId: string,
    amount: number,
    directorId: string,
    reason?: string
  ): Promise<void> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        include: { tournament: true }
      });

      if (!team) {
        throw new Error('Team not found');
      }

      // Verify director access
      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId: team.tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      if (amount > 0) {
        await this.addChipsToTeam(teamId, amount, 'MANUAL_ADJUSTMENT', undefined, reason);
      } else {
        await this.removeChipsFromTeam(teamId, Math.abs(amount), 'MANUAL_ADJUSTMENT', undefined, reason);
      }

      // Mark team as having manual chip override
      await this.prisma.team.update({
        where: { id: teamId },
        data: { manualChipOverride: true }
      });

    } catch (error) {
      throw new Error(`Failed to manually adjust chips: ${error}`);
    }
  }

  /**
   * Eliminate team when they run out of chips
   */
  private async eliminateTeam(teamId: string): Promise<void> {
    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        status: 'ELIMINATED',
        isQueued: false,
        queuePosition: null,
        currentTableId: null
      }
    });
  }

  /**
   * Create a chip transaction record
   */
  private async createChipTransaction(data: {
    tournamentId: string;
    teamId?: string;
    playerProfileId?: string;
    gameId?: string;
    type: ChipTransactionType;
    amount: number;
    description?: string;
    reason?: string;
    createdBy?: string;
  }): Promise<void> {
    await this.prisma.chipTransaction.create({
      data: {
        tournamentId: data.tournamentId,
        teamId: data.teamId,
        playerProfileId: data.playerProfileId,
        gameId: data.gameId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        reason: data.reason,
        createdBy: data.createdBy
      }
    });
  }

  /**
   * Get chip transaction history for a team
   */
  async getTeamChipHistory(teamId: string): Promise<any[]> {
    return await this.prisma.chipTransaction.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
      include: {
        game: {
          include: {
            winningTeam: true,
            losingTeam: true
          }
        },
        playerProfile: {
          include: {
            player: true
          }
        }
      }
    });
  }

  /**
   * Get tournament chip statistics
   */
  async getTournamentChipStats(tournamentId: string): Promise<{
    totalChipsInPlay: number;
    averageChipsPerTeam: number;
    teamsWithChips: number;
    eliminatedTeams: number;
  }> {
    const teams = await this.prisma.team.findMany({
      where: { tournamentId },
      select: {
        currentChips: true,
        status: true
      }
    });

    const totalChipsInPlay = teams.reduce((sum, team) => sum + team.currentChips, 0);
    const teamsWithChips = teams.filter(team => team.currentChips > 0).length;
    const eliminatedTeams = teams.filter(team => team.status === 'ELIMINATED').length;
    const averageChipsPerTeam = teamsWithChips > 0 ? totalChipsInPlay / teamsWithChips : 0;

    return {
      totalChipsInPlay,
      averageChipsPerTeam,
      teamsWithChips,
      eliminatedTeams
    };
  }
}