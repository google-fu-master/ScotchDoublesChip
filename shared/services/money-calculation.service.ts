/**
 * Money Calculation Service - Handles all tournament money operations
 * Manages entry fees, admin fees, added money, payouts, splits, and side pots
 */

import { PrismaClient } from '@prisma/client';
import { PayoutType, PayoutPlacesSetting } from '../types/tournament.types';

export interface PayoutStructure {
  position: number;
  percentage: number;
  amount: number;
  description: string;
}

export interface PayoutSplitData {
  teamId: string;
  amount: number;
  percentage: number;
}

export interface MoneyBreakdown {
  totalEntryFees: number;
  totalAdminFees: number;
  addedMoney: number;
  totalPayout: number;
  adminFeeTotal: number;
}

export class MoneyCalculationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Calculate tournament money breakdown
   */
  async calculateTournamentMoney(tournamentId: string): Promise<MoneyBreakdown> {
    try {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          teams: true
        }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const entrantCount = tournament.teams.length;
      const entryFee = Number(tournament.entryFee || 0);
      const adminFee = Number(tournament.adminFee || 0);
      const addedMoney = Number(tournament.addedMoney || 0);

      // Calculate totals
      const totalEntryFees = entryFee * entrantCount;
      const totalAdminFees = adminFee * entrantCount;
      
      // Total payout = (Entry Fee - Admin Fee) × Entrants + Added Money
      const netEntryPerTeam = entryFee - adminFee;
      const totalPayout = (netEntryPerTeam * entrantCount) + addedMoney;

      return {
        totalEntryFees,
        totalAdminFees,
        addedMoney,
        totalPayout,
        adminFeeTotal: totalAdminFees
      };

    } catch (error) {
      throw new Error(`Failed to calculate tournament money: ${error}`);
    }
  }

  /**
   * Calculate automatic payout structure
   */
  async calculateAutomaticPayouts(tournamentId: string): Promise<PayoutStructure[]> {
    try {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { teams: true }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const entrantCount = tournament.teams.length;
      const moneyBreakdown = await this.calculateTournamentMoney(tournamentId);

      if (moneyBreakdown.totalPayout <= 0) {
        return []; // No money to pay out
      }

      let payoutStructure: PayoutStructure[] = [];

      if (tournament.payoutType === 'PLACES') {
        payoutStructure = this.calculatePlacesPayout(
          entrantCount,
          moneyBreakdown.totalPayout,
          tournament.payoutPlacesSetting
        );
      } else if (tournament.payoutType === 'PERCENTAGE') {
        payoutStructure = this.calculatePercentagePayout(
          entrantCount,
          moneyBreakdown.totalPayout,
          tournament.payoutPercentage || 25
        );
      }

      return payoutStructure;

    } catch (error) {
      throw new Error(`Failed to calculate automatic payouts: ${error}`);
    }
  }

  /**
   * Calculate places-based payout structure
   */
  private calculatePlacesPayout(
    entrantCount: number,
    totalPayout: number,
    placesSetting?: PayoutPlacesSetting
  ): PayoutStructure[] {
    
    // Determine number of places and percentages based on setting and entrant count
    let placesConfig: { places: number; percentages: number[] };

    if (placesSetting === 'CUSTOM') {
      // Return empty for manual configuration
      return [];
    }

    switch (placesSetting) {
      case 'WINNER_TAKE_ALL':
        placesConfig = { places: 1, percentages: [100] };
        break;
      case 'TOP_2':
        placesConfig = { places: 2, percentages: [60, 40] };
        break;
      case 'TOP_3':
        placesConfig = { places: 3, percentages: [50, 30, 20] };
        break;
      case 'TOP_4':
        placesConfig = { places: 4, percentages: [40, 25, 20, 15] };
        break;
      case 'TOP_6':
        placesConfig = { places: 6, percentages: [35, 25, 15, 12, 8, 5] };
        break;
      case 'TOP_8':
        placesConfig = { places: 8, percentages: [30, 20, 15, 12, 10, 6, 4, 3] };
        break;
      default:
        // Default based on entrant count
        if (entrantCount <= 4) {
          placesConfig = { places: 1, percentages: [100] };
        } else if (entrantCount <= 8) {
          placesConfig = { places: 2, percentages: [60, 40] };
        } else if (entrantCount <= 16) {
          placesConfig = { places: 3, percentages: [50, 30, 20] };
        } else if (entrantCount <= 24) {
          placesConfig = { places: 4, percentages: [40, 25, 20, 15] };
        } else if (entrantCount <= 31) {
          placesConfig = { places: 6, percentages: [35, 25, 15, 12, 8, 5] };
        } else {
          placesConfig = { places: 8, percentages: [30, 20, 15, 12, 10, 6, 4, 3] };
        }
    }

    // Generate payout structure
    const payouts: PayoutStructure[] = [];
    const placeNames = ['1st Place', '2nd Place', '3rd Place', '4th Place', '5th Place', '6th Place', '7th Place', '8th Place'];

    for (let i = 0; i < placesConfig.places && i < entrantCount; i++) {
      const percentage = placesConfig.percentages[i];
      const amount = Math.round((totalPayout * percentage / 100) * 100) / 100; // Round to nearest cent

      payouts.push({
        position: i + 1,
        percentage,
        amount,
        description: placeNames[i] || `${i + 1}th Place`
      });
    }

    return payouts;
  }

  /**
   * Calculate percentage-based payout structure
   */
  private calculatePercentagePayout(
    entrantCount: number,
    totalPayout: number,
    payoutPercentage: number
  ): PayoutStructure[] {
    
    // Calculate how many places to pay
    const placesToPay = Math.round(entrantCount * payoutPercentage / 100);
    
    if (placesToPay <= 0) {
      return [];
    }

    // Use sliding percentage scale
    const payouts: PayoutStructure[] = [];
    let remainingPercentage = 100;
    const placeNames = ['1st Place', '2nd Place', '3rd Place', '4th Place', '5th Place', '6th Place', '7th Place', '8th Place'];

    for (let i = 0; i < placesToPay; i++) {
      let percentage: number;

      if (placesToPay === 1) {
        percentage = 100;
      } else if (i === 0) {
        // First place gets larger share
        percentage = Math.round(40 + (20 / placesToPay));
      } else {
        // Distribute remaining percentage across other places
        const remainingPlaces = placesToPay - 1;
        percentage = Math.round((100 - (40 + (20 / placesToPay))) / remainingPlaces);
      }

      const amount = Math.round((totalPayout * percentage / 100) * 100) / 100;

      payouts.push({
        position: i + 1,
        percentage,
        amount,
        description: placeNames[i] || `${i + 1}th Place`
      });

      remainingPercentage -= percentage;
    }

    return payouts;
  }

  /**
   * Create payout records for tournament
   */
  async createPayouts(tournamentId: string): Promise<void> {
    try {
      // Delete existing payouts
      await this.prisma.payout.deleteMany({
        where: { tournamentId }
      });

      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      let payoutStructure: PayoutStructure[];

      if (tournament.customPayoutStructure) {
        // Use custom payout structure
        payoutStructure = JSON.parse(tournament.customPayoutStructure as string);
      } else {
        // Calculate automatic payout structure
        payoutStructure = await this.calculateAutomaticPayouts(tournamentId);
      }

      // Create payout records
      for (const payout of payoutStructure) {
        await this.prisma.payout.create({
          data: {
            tournamentId,
            position: payout.position,
            amount: payout.amount,
            percentage: payout.percentage,
            description: payout.description
          }
        });
      }

    } catch (error) {
      throw new Error(`Failed to create payouts: ${error}`);
    }
  }

  /**
   * Calculate final payouts based on tournament results
   */
  async calculateFinalPayouts(tournamentId: string): Promise<void> {
    try {
      // Get final team standings
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
        },
        orderBy: [
          { status: 'asc' }, // ACTIVE teams first (winner)
          { currentChips: 'desc' }, // Then by chips descending
          { totalChipsWon: 'desc' } // Then by total chips won
        ]
      });

      // Create payouts if they don't exist
      await this.createPayouts(tournamentId);

      // Get payout structure
      const payouts = await this.prisma.payout.findMany({
        where: { tournamentId },
        orderBy: { position: 'asc' }
      });

      // Assign payouts to teams based on final standings
      for (let i = 0; i < Math.min(teams.length, payouts.length); i++) {
        const team = teams[i];
        const payout = payouts[i];

        await this.prisma.payout.update({
          where: { id: payout.id },
          data: {
            teamId: team.id,
            originalAmount: payout.amount
          }
        });
      }

    } catch (error) {
      throw new Error(`Failed to calculate final payouts: ${error}`);
    }
  }

  /**
   * Create manual payout split
   */
  async createPayoutSplit(
    tournamentId: string,
    splitData: {
      splitName: string;
      description?: string;
      splits: PayoutSplitData[];
    },
    directorId: string
  ): Promise<void> {
    try {
      // Verify director access
      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      // Calculate total split amount
      const totalAmount = splitData.splits.reduce((sum, split) => sum + split.amount, 0);

      // Create payout split record
      await this.prisma.payoutSplit.create({
        data: {
          tournamentId,
          splitName: splitData.splitName,
          description: splitData.description,
          totalAmount,
          splitData: JSON.stringify(splitData.splits),
          createdBy: directorId
        }
      });

      // Update affected payout records to mark as split
      for (const split of splitData.splits) {
        // Find the team's payout record
        const payout = await this.prisma.payout.findFirst({
          where: {
            tournamentId,
            teamId: split.teamId
          }
        });

        if (payout) {
          await this.prisma.payout.update({
            where: { id: payout.id },
            data: {
              amount: split.amount,
              isSplit: true
            }
          });
        }
      }

    } catch (error) {
      throw new Error(`Failed to create payout split: ${error}`);
    }
  }

  /**
   * Manage side pot operations
   */
  async createSidePot(
    tournamentId: string,
    sidePotData: {
      name: string;
      description?: string;
      entryFee: number;
      entryType: 'TEAM' | 'INDIVIDUAL';
      criteria: any;
    },
    directorId: string
  ): Promise<string> {
    try {
      // Verify director access
      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      // Check side pot limit (10 per tournament)
      const existingSidePots = await this.prisma.sidePot.count({
        where: { tournamentId }
      });

      if (existingSidePots >= 10) {
        throw new Error('Maximum 10 side pots allowed per tournament');
      }

      // Create side pot
      const sidePot = await this.prisma.sidePot.create({
        data: {
          tournamentId,
          name: sidePotData.name,
          description: sidePotData.description,
          entryFee: sidePotData.entryFee,
          entryType: sidePotData.entryType,
          criteria: JSON.stringify(sidePotData.criteria)
        }
      });

      return sidePot.id;

    } catch (error) {
      throw new Error(`Failed to create side pot: ${error}`);
    }
  }

  /**
   * Add side pot entry
   */
  async addSidePotEntry(
    sidePotId: string,
    entrantData: {
      teamId?: string;
      playerId?: string;
      entryFee: number;
    }
  ): Promise<void> {
    try {
      const sidePot = await this.prisma.sidePot.findUnique({
        where: { id: sidePotId }
      });

      if (!sidePot) {
        throw new Error('Side pot not found');
      }

      if (!sidePot.isActive) {
        throw new Error('Side pot is not active');
      }

      // Validate entry type matches
      if (sidePot.entryType === 'TEAM' && !entrantData.teamId) {
        throw new Error('Team ID required for team-based side pot');
      }

      if (sidePot.entryType === 'INDIVIDUAL' && !entrantData.playerId) {
        throw new Error('Player ID required for individual side pot');
      }

      // Create side pot entry
      await this.prisma.sidePotEntry.create({
        data: {
          sidePotId,
          entrantType: sidePot.entryType,
          teamId: entrantData.teamId,
          playerId: entrantData.playerId,
          entryFee: entrantData.entryFee
        }
      });

      // Update side pot total
      await this.prisma.sidePot.update({
        where: { id: sidePotId },
        data: {
          totalPot: { increment: entrantData.entryFee }
        }
      });

    } catch (error) {
      throw new Error(`Failed to add side pot entry: ${error}`);
    }
  }

  /**
   * Complete side pot and declare winner
   */
  async completeSidePot(
    sidePotId: string,
    winnerId: string,
    winnerType: 'TEAM' | 'PLAYER',
    directorId: string
  ): Promise<void> {
    try {
      // Verify director access
      const sidePot = await this.prisma.sidePot.findUnique({
        where: { id: sidePotId },
        include: { tournament: true }
      });

      if (!sidePot) {
        throw new Error('Side pot not found');
      }

      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId: sidePot.tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      // Complete side pot
      await this.prisma.sidePot.update({
        where: { id: sidePotId },
        data: {
          isComplete: true,
          winnerId,
          winnerType
        }
      });

    } catch (error) {
      throw new Error(`Failed to complete side pot: ${error}`);
    }
  }

  /**
   * Mark payout as paid
   */
  async markPayoutPaid(payoutId: string, directorId: string): Promise<void> {
    try {
      const payout = await this.prisma.payout.findUnique({
        where: { id: payoutId },
        include: { tournament: true }
      });

      if (!payout) {
        throw new Error('Payout not found');
      }

      // Verify director access
      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId: payout.tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          isPaid: true,
          paidAt: new Date()
        }
      });

    } catch (error) {
      throw new Error(`Failed to mark payout as paid: ${error}`);
    }
  }

  /**
   * Mark side pot as paid out
   */
  async markSidePotPaid(sidePotId: string, directorId: string): Promise<void> {
    try {
      const sidePot = await this.prisma.sidePot.findUnique({
        where: { id: sidePotId },
        include: { tournament: true }
      });

      if (!sidePot) {
        throw new Error('Side pot not found');
      }

      // Verify director access
      const director = await this.prisma.tournamentDirector.findFirst({
        where: {
          tournamentId: sidePot.tournamentId,
          playerId: directorId
        }
      });

      if (!director) {
        throw new Error('Director access denied');
      }

      await this.prisma.sidePot.update({
        where: { id: sidePotId },
        data: {
          paidOut: true,
          paidAt: new Date()
        }
      });

    } catch (error) {
      throw new Error(`Failed to mark side pot as paid: ${error}`);
    }
  }

  /**
   * Get comprehensive money summary for tournament
   */
  async getTournamentMoneySummary(tournamentId: string): Promise<{
    moneyBreakdown: MoneyBreakdown;
    payouts: any[];
    payoutSplits: any[];
    sidePots: any[];
    totalSidePotMoney: number;
  }> {
    try {
      const moneyBreakdown = await this.calculateTournamentMoney(tournamentId);

      const payouts = await this.prisma.payout.findMany({
        where: { tournamentId },
        include: {
          team: {
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
        orderBy: { position: 'asc' }
      });

      const payoutSplits = await this.prisma.payoutSplit.findMany({
        where: { tournamentId },
        orderBy: { createdAt: 'desc' }
      });

      const sidePots = await this.prisma.sidePot.findMany({
        where: { tournamentId },
        include: {
          entries: {
            include: {
              team: true,
              player: true
            }
          }
        }
      });

      const totalSidePotMoney = sidePots.reduce((sum, pot) => sum + Number(pot.totalPot), 0);

      return {
        moneyBreakdown,
        payouts,
        payoutSplits,
        sidePots,
        totalSidePotMoney
      };

    } catch (error) {
      throw new Error(`Failed to get tournament money summary: ${error}`);
    }
  }
}