/**
 * Age Restriction Validation Service
 * Handles all business logic for age restrictions in tournaments
 */

import {
  PlayerAgeGroup,
  VenueAgeRestriction,
  TableAgeRestriction,
  AgeRestrictionValidation,
  AgeRestrictionConflict,
  AgeRestrictionWarning,
  AgeRestrictionUtils,
  PlayerAgeOverride,
  VenueEditRequestStatus
} from '../types/age-restriction.types';

export interface Player {
  id: string;
  ageGroup: PlayerAgeGroup;
  firstName: string;
  lastName: string;
}

export interface Venue {
  id: string;
  name: string;
  ageRestriction: VenueAgeRestriction;
  useVenueAgeForAllTables: boolean;
  minorStartTime?: string;
  minorEndTime?: string;
  ages18To20StartTime?: string;
  ages18To20EndTime?: string;
  ownerId?: string;
}

export interface Table {
  id: string;
  number: string;
  venueId: string;
  ageRestriction?: TableAgeRestriction;
  isActive: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  venueId?: string;
  startDate?: Date;
  isAgeRestricted: boolean;
  useUniformAgeRestriction?: boolean;
  uniformAgeRestriction?: TableAgeRestriction;
}

export class AgeRestrictionService {
  
  /**
   * Validate player eligibility for tournament registration
   */
  static validatePlayerTournamentEligibility(
    player: Player,
    tournament: Tournament,
    venue?: Venue,
    ageOverrides?: PlayerAgeOverride[]
  ): AgeRestrictionValidation {
    const conflicts: AgeRestrictionConflict[] = [];
    const warnings: AgeRestrictionWarning[] = [];

    // Get effective player age (check for overrides)
    const effectiveAge = this.getEffectivePlayerAge(player.id, tournament.id, player.ageGroup, ageOverrides);

    // If tournament has no venue and no age restrictions, allow all players
    if (!venue && !tournament.isAgeRestricted) {
      return { isValid: true, conflicts, warnings };
    }

    // If tournament has venue, validate against venue restrictions
    if (venue) {
      const canParticipate = AgeRestrictionUtils.canPlayerParticipateInTournament(
        effectiveAge,
        venue.ageRestriction,
        tournament.startDate || new Date(),
        {
          minorStartTime: venue.minorStartTime,
          minorEndTime: venue.minorEndTime,
          ages18To20StartTime: venue.ages18To20StartTime,
          ages18To20EndTime: venue.ages18To20EndTime
        }
      );

      if (!canParticipate) {
        conflicts.push({
          type: 'PLAYER_INELIGIBLE',
          playerId: player.id,
          message: `Player ${player.firstName} ${player.lastName} (${effectiveAge}) cannot participate due to venue age restrictions: ${venue.ageRestriction}`,
          severity: 'ERROR'
        });
      }
    }

    // If tournament is age restricted (no venue), validate against tournament restrictions
    if (!venue && tournament.isAgeRestricted && tournament.uniformAgeRestriction) {
      const canAccess = AgeRestrictionUtils.canPlayerAccessTable(effectiveAge, tournament.uniformAgeRestriction);
      
      if (!canAccess) {
        conflicts.push({
          type: 'PLAYER_INELIGIBLE',
          playerId: player.id,
          message: `Player ${player.firstName} ${player.lastName} (${effectiveAge}) cannot participate in ${tournament.uniformAgeRestriction}+ restricted tournament`,
          severity: 'ERROR'
        });
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  /**
   * Validate player assignment to specific table
   */
  static validatePlayerTableAssignment(
    player: Player,
    table: Table,
    venue: Venue,
    tournament: Tournament,
    ageOverrides?: PlayerAgeOverride[]
  ): AgeRestrictionValidation {
    const conflicts: AgeRestrictionConflict[] = [];
    const warnings: AgeRestrictionWarning[] = [];

    const effectiveAge = this.getEffectivePlayerAge(player.id, tournament.id, player.ageGroup, ageOverrides);
    
    // Get effective table age restriction
    let tableRestriction: TableAgeRestriction;
    
    if (venue.useVenueAgeForAllTables) {
      tableRestriction = AgeRestrictionUtils.getEffectiveTableAgeRestriction(
        venue.ageRestriction,
        true
      );
    } else {
      tableRestriction = table.ageRestriction || TableAgeRestriction.UNDER_18;
    }

    // Check if player can access this table
    const canAccess = AgeRestrictionUtils.canPlayerAccessTable(effectiveAge, tableRestriction);
    
    if (!canAccess) {
      conflicts.push({
        type: 'TABLE_UNAVAILABLE',
        playerId: player.id,
        tableId: table.id,
        message: `Player ${player.firstName} ${player.lastName} (${effectiveAge}) cannot be assigned to table ${table.number} (${tableRestriction}+ restricted)`,
        severity: 'ERROR'
      });
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  /**
   * Validate tournament start with current player assignments
   */
  static validateTournamentStart(
    tournament: Tournament,
    players: Player[],
    tables: Table[],
    venue?: Venue,
    ageOverrides?: PlayerAgeOverride[]
  ): AgeRestrictionValidation {
    const conflicts: AgeRestrictionConflict[] = [];
    const warnings: AgeRestrictionWarning[] = [];

    // Check each player can be assigned to at least one table
    for (const player of players) {
      const availableTables = this.getAvailableTablesForPlayer(
        player,
        tables,
        venue,
        tournament,
        ageOverrides
      );

      if (availableTables.length === 0) {
        conflicts.push({
          type: 'TABLE_UNAVAILABLE',
          playerId: player.id,
          message: `Player ${player.firstName} ${player.lastName} cannot be assigned to any available tables due to age restrictions`,
          severity: 'ERROR'
        });
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  /**
   * Validate table closure - ensure no age-restricted players will be stranded
   */
  static validateTableClosure(
    tableToClose: Table,
    remainingTables: Table[],
    activePlayers: Player[],
    venue: Venue,
    tournament: Tournament,
    ageOverrides?: PlayerAgeOverride[]
  ): AgeRestrictionValidation {
    const conflicts: AgeRestrictionConflict[] = [];
    const warnings: AgeRestrictionWarning[] = [];

    // Check if any active players would lose their last available table
    for (const player of activePlayers) {
      const availableTables = this.getAvailableTablesForPlayer(
        player,
        remainingTables,
        venue,
        tournament,
        ageOverrides
      );

      // Check if this table is the player's last option
      const canAccessClosingTable = this.canPlayerAccessTable(
        player,
        tableToClose,
        venue,
        tournament,
        ageOverrides
      );

      if (canAccessClosingTable && availableTables.length === 0) {
        warnings.push({
          type: 'LAST_TABLE',
          message: `Cannot close table ${tableToClose.number} - it's the last available table for player ${player.firstName} ${player.lastName} due to age restrictions`,
          affectedPlayers: [player.id],
          affectedTables: [tableToClose.id]
        });
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  /**
   * Validate venue edit request timing and ownership
   */
  static validateVenueEditRequest(
    venueId: string,
    requesterId: string,
    venue: Venue,
    existingPendingRequests: any[]
  ): AgeRestrictionValidation {
    const conflicts: AgeRestrictionConflict[] = [];
    const warnings: AgeRestrictionWarning[] = [];

    // Check if user owns the venue
    if (venue.ownerId === requesterId) {
      return { isValid: true, conflicts, warnings };
    }

    // Check for pending requests
    if (existingPendingRequests.length > 0) {
      conflicts.push({
        type: 'PLAYER_INELIGIBLE',
        message: 'Venue has pending edits that must be approved/rejected before new edits can be submitted',
        severity: 'ERROR'
      });
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  /**
   * Helper: Get available tables for a player based on age restrictions
   */
  private static getAvailableTablesForPlayer(
    player: Player,
    tables: Table[],
    venue: Venue | undefined,
    tournament: Tournament,
    ageOverrides?: PlayerAgeOverride[]
  ): Table[] {
    return tables.filter(table => 
      table.isActive && 
      this.canPlayerAccessTable(player, table, venue, tournament, ageOverrides)
    );
  }

  /**
   * Helper: Check if player can access a specific table
   */
  private static canPlayerAccessTable(
    player: Player,
    table: Table,
    venue: Venue | undefined,
    tournament: Tournament,
    ageOverrides?: PlayerAgeOverride[]
  ): boolean {
    const validation = this.validatePlayerTableAssignment(
      player,
      table,
      venue!,
      tournament,
      ageOverrides
    );
    return validation.isValid;
  }

  /**
   * Helper: Get effective player age (considering overrides)
   */
  private static getEffectivePlayerAge(
    playerId: string,
    tournamentId: string,
    originalAge: PlayerAgeGroup,
    ageOverrides?: PlayerAgeOverride[]
  ): PlayerAgeGroup {
    const override = ageOverrides?.find(
      o => o.playerId === playerId && 
           o.tournamentId === tournamentId &&
           (!o.expiresAt || o.expiresAt > new Date())
    );
    
    return override ? override.overrideAge : originalAge;
  }

  /**
   * Generate age override warning message for Tournament Directors
   */
  static generateAgeOverrideWarning(
    playerName: string,
    originalAge: PlayerAgeGroup,
    proposedOverride: PlayerAgeGroup
  ): string {
    return `Warning: You are about to temporarily change ${playerName}'s age setting from ${originalAge} to ${proposedOverride} for this tournament only. ` +
           `We (the system/admins) are not responsible for age verification and we highly encourage all participants to abide by their local laws and the rules/regulations of all venues. ` +
           `Click OK to apply temporary age setting for this player for this tournament, or Cancel to not apply the temporary setting.`;
  }

  /**
   * Generate player removal confirmation message
   */
  static generatePlayerRemovalWarning(
    playersToRemove: Player[]
  ): string {
    const playerNames = playersToRemove.map(p => `${p.firstName} ${p.lastName}`).join(', ');
    return `The following players will be removed from the tournament due to age restrictions: ${playerNames}. ` +
           `In order for these players to be re-added and play in this tournament, the Age Restrictions of the Venue/Tables will have to be updated or the Age Setting of each player will need to be temporarily overridden. ` +
           `Are you sure you want to remove these players?`;
  }

  /**
   * Validate venue time restrictions
   */
  static validateVenueTimeRestrictions(
    ageRestriction: VenueAgeRestriction,
    minorStartTime?: string,
    minorEndTime?: string,
    ages18To20StartTime?: string,
    ages18To20EndTime?: string
  ): AgeRestrictionValidation {
    const conflicts: AgeRestrictionConflict[] = [];
    const warnings: AgeRestrictionWarning[] = [];

    // Check if time restrictions are required
    const needsMinorTimes = [
      VenueAgeRestriction.MINORS_ALLOWED_LIMITED_HOURS,
      VenueAgeRestriction.MINORS_AND_18_20_LIMITED_HOURS
    ].includes(ageRestriction);

    const needs18To20Times = [
      VenueAgeRestriction.AGES_18_20_LIMITED_HOURS,
      VenueAgeRestriction.MINORS_AND_18_20_LIMITED_HOURS
    ].includes(ageRestriction);

    // Validate minor time restrictions
    if (needsMinorTimes) {
      if (!minorStartTime || !minorEndTime) {
        conflicts.push({
          type: 'TIME_RESTRICTION',
          message: 'Minor start and end times are required for this age restriction setting',
          severity: 'ERROR'
        });
      } else {
        const timeValidation = this.validateTimeRange(minorStartTime, minorEndTime);
        if (!timeValidation.isValid) {
          conflicts.push(...timeValidation.conflicts);
        }
      }
    }

    // Validate 18-20 time restrictions
    if (needs18To20Times) {
      if (!ages18To20StartTime || !ages18To20EndTime) {
        conflicts.push({
          type: 'TIME_RESTRICTION',
          message: '18-20 age group start and end times are required for this age restriction setting',
          severity: 'ERROR'
        });
      } else {
        const timeValidation = this.validateTimeRange(ages18To20StartTime, ages18To20EndTime);
        if (!timeValidation.isValid) {
          conflicts.push(...timeValidation.conflicts);
        }
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  /**
   * Validate time range (start must be before end, must be 1-24 hours apart)
   */
  private static validateTimeRange(startTime: string, endTime: string): AgeRestrictionValidation {
    const conflicts: AgeRestrictionConflict[] = [];

    try {
      const start = this.parseTime(startTime);
      const end = this.parseTime(endTime);

      if (start >= end) {
        conflicts.push({
          type: 'TIME_RESTRICTION',
          message: 'End time must be after start time',
          severity: 'ERROR'
        });
      }

      const diffMinutes = end - start;
      if (diffMinutes < 60) { // Less than 1 hour
        conflicts.push({
          type: 'TIME_RESTRICTION',
          message: 'Time restriction must be at least 1 hour',
          severity: 'ERROR'
        });
      }

      if (diffMinutes > (24 * 60)) { // More than 24 hours
        conflicts.push({
          type: 'TIME_RESTRICTION',
          message: 'Time restriction cannot be more than 24 hours',
          severity: 'ERROR'
        });
      }

    } catch (error) {
      conflicts.push({
        type: 'TIME_RESTRICTION',
        message: 'Invalid time format. Use HH:MM format',
        severity: 'ERROR'
      });
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      warnings: []
    };
  }

  /**
   * Parse time string to minutes since midnight
   */
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format');
    }
    return hours * 60 + minutes;
  }
}