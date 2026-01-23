/**
 * Tournament Types and Validation
 * Comprehensive types, interfaces, and validation schemas for the tournament system
 */

// Re-export Prisma enums and types
export type {
  Tournament,
  Team,
  Player,
  Game,
  ChipTransaction,
  Payout,
  SidePot,
  Venue,
  Table,
  PlayerProfile,
  TeamMember,
  TournamentDirector
} from '@prisma/client';

export {
  TournamentType,
  PlayerType,
  GameType,
  TournamentStatus,
  TeamStatus,
  GameStatus,
  TableStatus,
  DirectorRole,
  ChipTransactionType,
  AssignmentType,
  BracketOrdering,
  Rules,
  RatingSystem,
  PayoutType,
  PayoutPlacesSetting,
  AccessType,
  SidePotEntryType,
  SidePotWinnerType,
  PlayerRegistrationStatus,
  AuditAction,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  ConfigType
} from '@prisma/client';

// Tournament Creation and Management Types
export interface CreateTournamentRequest {
  name: string;
  description?: string;
  venueId: string;
  playerType: PlayerType;
  gameType: GameType;
  estimatedEntrants?: number;
  playersPerTable?: number;
  raceToWins?: number;
  bracketOrdering?: BracketOrdering;
  autopilotMode?: boolean;
  randomOrderingEachRound?: boolean;
  rules?: Rules;
  ratingSystem?: RatingSystem;
  showSkillLevels?: boolean;
  access?: AccessType;
  
  // Money settings
  entryFee?: number;
  adminFee?: number;
  addedMoney?: number;
  payoutType?: PayoutType;
  payoutPlacesSetting?: PayoutPlacesSetting;
  payoutPercentage?: number;
  
  // Chip settings
  defaultChipsPerPlayer?: number;
  chipRanges?: ChipRange[];
  
  // Template settings
  isTemplate?: boolean;
  templateName?: string;
}

export interface ChipRange {
  minFargo: number;
  maxFargo: number;
  chips: number;
}

// Error Types
export interface TournamentError {
  code: string;
  message: string;
  details?: any;
}

export class TournamentValidationError extends Error {
  public code: string;
  public details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'TournamentValidationError';
    this.code = code;
    this.details = details;
  }
}

export class TournamentNotFoundError extends Error {
  constructor(tournamentId: string) {
    super(`Tournament not found: ${tournamentId}`);
    this.name = 'TournamentNotFoundError';
  }
}

export class InsufficientPermissionsError extends Error {
  constructor(action: string) {
    super(`Insufficient permissions for action: ${action}`);
    this.name = 'InsufficientPermissionsError';
  }
}

export class TournamentStateError extends Error {
  public currentState: TournamentStatus;
  public requiredState: TournamentStatus | TournamentStatus[];

  constructor(message: string, currentState: TournamentStatus, requiredState: TournamentStatus | TournamentStatus[]) {
    super(message);
    this.name = 'TournamentStateError';
    this.currentState = currentState;
    this.requiredState = requiredState;
  }
}

// Validation Functions
export function validateTournamentCreation(data: CreateTournamentRequest): void {
  if (!data.name?.trim()) {
    throw new TournamentValidationError('INVALID_NAME', 'Tournament name is required');
  }

  if (data.name.length > 100) {
    throw new TournamentValidationError('NAME_TOO_LONG', 'Tournament name must be 100 characters or less');
  }

  if (data.description && data.description.length > 5000) {
    throw new TournamentValidationError('DESCRIPTION_TOO_LONG', 'Description must be 5000 characters or less');
  }

  if (!data.venueId) {
    throw new TournamentValidationError('INVALID_VENUE', 'Venue ID is required');
  }

  if (data.raceToWins && (data.raceToWins < 1 || data.raceToWins > 10)) {
    throw new TournamentValidationError('INVALID_RACE', 'Race to wins must be between 1 and 10');
  }

  if (data.playersPerTable && (data.playersPerTable < 2 || data.playersPerTable > 8)) {
    throw new TournamentValidationError('INVALID_PLAYERS_PER_TABLE', 'Players per table must be between 2 and 8');
  }

  if (data.entryFee && data.entryFee < 0) {
    throw new TournamentValidationError('INVALID_ENTRY_FEE', 'Entry fee cannot be negative');
  }

  if (data.adminFee && data.adminFee < 0) {
    throw new TournamentValidationError('INVALID_ADMIN_FEE', 'Admin fee cannot be negative');
  }

  if (data.entryFee && data.adminFee && data.adminFee > data.entryFee) {
    throw new TournamentValidationError('ADMIN_FEE_TOO_HIGH', 'Admin fee cannot exceed entry fee');
  }

  if (data.addedMoney && data.addedMoney < 0) {
    throw new TournamentValidationError('INVALID_ADDED_MONEY', 'Added money cannot be negative');
  }

  if (data.payoutPercentage && (data.payoutPercentage < 10 || data.payoutPercentage > 50)) {
    throw new TournamentValidationError('INVALID_PAYOUT_PERCENTAGE', 'Payout percentage must be between 10% and 50%');
  }

  if (data.chipRanges) {
    validateChipRanges(data.chipRanges);
  }
}

export function validateChipRanges(chipRanges: ChipRange[]): void {
  if (chipRanges.length === 0) {
    return;
  }

  // Sort by minFargo to check for overlaps
  const sorted = chipRanges.sort((a, b) => a.minFargo - b.minFargo);

  for (let i = 0; i < sorted.length; i++) {
    const range = sorted[i];

    if (range.minFargo < -100 || range.maxFargo < -100) {
      throw new TournamentValidationError('INVALID_FARGO_RANGE', 'Fargo ratings cannot be below -100');
    }

    if (range.minFargo > 900 || range.maxFargo > 900) {
      throw new TournamentValidationError('INVALID_FARGO_RANGE', 'Fargo ratings cannot be above 900');
    }

    if (range.minFargo >= range.maxFargo) {
      throw new TournamentValidationError('INVALID_FARGO_RANGE', 'Min Fargo must be less than max Fargo');
    }

    if (range.chips < 1 || range.chips > 100) {
      throw new TournamentValidationError('INVALID_CHIP_COUNT', 'Chip count must be between 1 and 100');
    }

    // Check for overlaps with next range
    if (i < sorted.length - 1) {
      const nextRange = sorted[i + 1];
      if (range.maxFargo >= nextRange.minFargo) {
        throw new TournamentValidationError('OVERLAPPING_RANGES', 'Fargo ranges cannot overlap');
      }
    }
  }
}

// Utility Functions
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatPercentage(percentage: number): string {
  return `${percentage}%`;
}