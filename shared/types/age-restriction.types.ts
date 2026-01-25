/**
 * Age restriction types and interfaces for the tournament system
 */

// Age group enums matching Prisma schema
export enum PlayerAgeGroup {
  UNDER_18 = 'UNDER_18',     // <18 (Minors)
  AGES_18_20 = 'AGES_18_20', // 18-20
  AGES_21_PLUS = 'AGES_21_PLUS' // 21+
}

export enum VenueAgeRestriction {
  MINORS_ALLOWED_ALL_DAY = 'MINORS_ALLOWED_ALL_DAY',                   // Minors (<18) Allowed All Day
  MINORS_ALLOWED_LIMITED_HOURS = 'MINORS_ALLOWED_LIMITED_HOURS',       // Minors (<18) Allowed Limited Hours
  MINORS_AND_18_20_LIMITED_HOURS = 'MINORS_AND_18_20_LIMITED_HOURS',   // Minors (<18) Allowed & 18-20 Limited Hours
  NO_MINORS_18_PLUS_ALL_DAY = 'NO_MINORS_18_PLUS_ALL_DAY',            // No Minors (18+ All Day)
  AGES_18_20_LIMITED_HOURS = 'AGES_18_20_LIMITED_HOURS',               // 18-20 Allowed Limited Hours
  AGES_21_PLUS_ALL_DAY = 'AGES_21_PLUS_ALL_DAY'                       // 21+ All Day
}

export enum TableAgeRestriction {
  UNDER_18 = 'UNDER_18',         // <18
  AGES_18_20 = 'AGES_18_20',     // 18-20
  AGES_21_PLUS = 'AGES_21_PLUS'  // 21+
}

export enum VenueEditRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

// Human-readable labels for UI
export const PlayerAgeGroupLabels = {
  [PlayerAgeGroup.UNDER_18]: '<18',
  [PlayerAgeGroup.AGES_18_20]: '18-20',
  [PlayerAgeGroup.AGES_21_PLUS]: '21+'
} as const;

export const VenueAgeRestrictionLabels = {
  [VenueAgeRestriction.MINORS_ALLOWED_ALL_DAY]: 'Minors (<18) Allowed All Day',
  [VenueAgeRestriction.MINORS_ALLOWED_LIMITED_HOURS]: 'Minors (<18) Allowed Limited Hours',
  [VenueAgeRestriction.MINORS_AND_18_20_LIMITED_HOURS]: 'Minors (<18) Allowed & 18-20 Limited Hours',
  [VenueAgeRestriction.NO_MINORS_18_PLUS_ALL_DAY]: 'No Minors (18+ All Day)',
  [VenueAgeRestriction.AGES_18_20_LIMITED_HOURS]: '18-20 Allowed Limited Hours',
  [VenueAgeRestriction.AGES_21_PLUS_ALL_DAY]: '21+ All Day'
} as const;

export const TableAgeRestrictionLabels = {
  [TableAgeRestriction.UNDER_18]: '<18',
  [TableAgeRestriction.AGES_18_20]: '18-20',  
  [TableAgeRestriction.AGES_21_PLUS]: '21+'
} as const;

// Interface for time restrictions
export interface AgeTimeRestriction {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

// Interface for player age override in tournaments
export interface PlayerAgeOverride {
  id: string;
  playerId: string;
  tournamentId: string;
  originalAge: PlayerAgeGroup;
  overrideAge: PlayerAgeGroup;
  createdById: string;
  reason?: string;
  createdAt: Date;
  expiresAt?: Date;
}

// Interface for venue edit requests
export interface VenueEditRequest {
  id: string;
  venueId: string;
  requesterId: string;
  proposedChanges: Record<string, any>;
  status: VenueEditRequestStatus;
  reviewedById?: string;
  rejectionReason?: string;
  createdAt: Date;
  reviewedAt?: Date;
  expiresAt: Date;
}

// Age restriction validation interfaces
export interface AgeRestrictionValidation {
  isValid: boolean;
  conflicts: AgeRestrictionConflict[];
  warnings: AgeRestrictionWarning[];
}

export interface AgeRestrictionConflict {
  type: 'PLAYER_INELIGIBLE' | 'TABLE_UNAVAILABLE' | 'TIME_RESTRICTION';
  playerId?: string;
  tableId?: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface AgeRestrictionWarning {
  type: 'OVERRIDE_REQUIRED' | 'TIME_CONFLICT' | 'LAST_TABLE';
  message: string;
  affectedPlayers?: string[];
  affectedTables?: string[];
}

// Helper functions for age restriction logic
export class AgeRestrictionUtils {
  /**
   * Check if a player age group can access a table age restriction
   */
  static canPlayerAccessTable(playerAge: PlayerAgeGroup, tableRestriction: TableAgeRestriction): boolean {
    // Progressive access model - each option includes all above it
    const ageHierarchy = [
      PlayerAgeGroup.UNDER_18,
      PlayerAgeGroup.AGES_18_20,
      PlayerAgeGroup.AGES_21_PLUS
    ];
    
    const tableHierarchy = [
      TableAgeRestriction.UNDER_18,
      TableAgeRestriction.AGES_18_20,
      TableAgeRestriction.AGES_21_PLUS
    ];
    
    const playerIndex = ageHierarchy.indexOf(playerAge);
    const tableIndex = tableHierarchy.indexOf(tableRestriction);
    
    return playerIndex >= tableIndex;
  }

  /**
   * Check if a player can participate in tournament based on venue restrictions
   */
  static canPlayerParticipateInTournament(
    playerAge: PlayerAgeGroup,
    venueRestriction: VenueAgeRestriction,
    tournamentStartTime: Date,
    venueTimeRestrictions?: {
      minorStartTime?: string;
      minorEndTime?: string;
      ages18To20StartTime?: string;
      ages18To20EndTime?: string;
    }
  ): boolean {
    // If no time restrictions, check basic venue access
    if (!venueTimeRestrictions) {
      return this.playerMeetsVenueRestriction(playerAge, venueRestriction);
    }

    const tournamentHour = tournamentStartTime.getHours();
    const tournamentMinute = tournamentStartTime.getMinutes();
    const tournamentTime = tournamentHour * 100 + tournamentMinute;

    // Check time-based restrictions
    if (playerAge === PlayerAgeGroup.UNDER_18 && venueTimeRestrictions.minorStartTime && venueTimeRestrictions.minorEndTime) {
      const startTime = this.parseTime(venueTimeRestrictions.minorStartTime);
      const endTime = this.parseTime(venueTimeRestrictions.minorEndTime);
      
      if (tournamentTime < startTime || tournamentTime > endTime) {
        return false;
      }
    }

    if (playerAge === PlayerAgeGroup.AGES_18_20 && venueTimeRestrictions.ages18To20StartTime && venueTimeRestrictions.ages18To20EndTime) {
      const startTime = this.parseTime(venueTimeRestrictions.ages18To20StartTime);
      const endTime = this.parseTime(venueTimeRestrictions.ages18To20EndTime);
      
      if (tournamentTime < startTime || tournamentTime > endTime) {
        return false;
      }
    }

    return this.playerMeetsVenueRestriction(playerAge, venueRestriction);
  }

  /**
   * Check if player meets basic venue restriction (without time considerations)
   */
  private static playerMeetsVenueRestriction(playerAge: PlayerAgeGroup, venueRestriction: VenueAgeRestriction): boolean {
    switch (venueRestriction) {
      case VenueAgeRestriction.MINORS_ALLOWED_ALL_DAY:
      case VenueAgeRestriction.MINORS_ALLOWED_LIMITED_HOURS:
      case VenueAgeRestriction.MINORS_AND_18_20_LIMITED_HOURS:
        return true; // All ages allowed
      
      case VenueAgeRestriction.NO_MINORS_18_PLUS_ALL_DAY:
      case VenueAgeRestriction.AGES_18_20_LIMITED_HOURS:
        return playerAge !== PlayerAgeGroup.UNDER_18;
      
      case VenueAgeRestriction.AGES_21_PLUS_ALL_DAY:
        return playerAge === PlayerAgeGroup.AGES_21_PLUS;
      
      default:
        return false;
    }
  }

  /**
   * Parse time string (HH:MM) to numeric value (HHMM) for comparison
   */
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 100 + minutes;
  }

  /**
   * Get effective table age restriction (venue or table-specific)
   */
  static getEffectiveTableAgeRestriction(
    venueAgeRestriction: VenueAgeRestriction,
    useVenueAgeForAllTables: boolean,
    tableAgeRestriction?: TableAgeRestriction
  ): TableAgeRestriction {
    if (useVenueAgeForAllTables) {
      return this.venueToTableRestriction(venueAgeRestriction);
    }
    return tableAgeRestriction || TableAgeRestriction.UNDER_18;
  }

  /**
   * Convert venue age restriction to equivalent table restriction
   */
  private static venueToTableRestriction(venueRestriction: VenueAgeRestriction): TableAgeRestriction {
    switch (venueRestriction) {
      case VenueAgeRestriction.MINORS_ALLOWED_ALL_DAY:
      case VenueAgeRestriction.MINORS_ALLOWED_LIMITED_HOURS:
      case VenueAgeRestriction.MINORS_AND_18_20_LIMITED_HOURS:
        return TableAgeRestriction.UNDER_18;
      
      case VenueAgeRestriction.NO_MINORS_18_PLUS_ALL_DAY:
      case VenueAgeRestriction.AGES_18_20_LIMITED_HOURS:
        return TableAgeRestriction.AGES_18_20;
      
      case VenueAgeRestriction.AGES_21_PLUS_ALL_DAY:
        return TableAgeRestriction.AGES_21_PLUS;
      
      default:
        return TableAgeRestriction.UNDER_18;
    }
  }
}

// Tournament-specific age restriction types
export interface TournamentAgeRestriction {
  isAgeRestricted: boolean;
  useUniformAgeRestriction?: boolean;
  uniformAgeRestriction?: TableAgeRestriction;
}

// Input types for forms
export interface PlayerProfileAgeInput {
  ageGroup: PlayerAgeGroup;
}

export interface VenueAgeRestrictionInput {
  ageRestriction: VenueAgeRestriction;
  useVenueAgeForAllTables: boolean;
  minorStartTime?: string;
  minorEndTime?: string;
  ages18To20StartTime?: string;
  ages18To20EndTime?: string;
}

export interface TableAgeRestrictionInput {
  ageRestriction: TableAgeRestriction;
}

export interface TournamentAgeRestrictionInput {
  isAgeRestricted: boolean;
  useUniformAgeRestriction?: boolean;
  uniformAgeRestriction?: TableAgeRestriction;
}

export interface PlayerAgeOverrideInput {
  playerId: string;
  tournamentId: string;
  overrideAge: PlayerAgeGroup;
  reason?: string;
}