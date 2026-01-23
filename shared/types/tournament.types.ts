/**
 * Tournament related type definitions and interfaces
 */

// Import Prisma types and enums
import type {
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
  TournamentDirector,
  AuditLog,
  Notification,
  SystemConfig,
  TournamentType,
  TournamentFormat,
  TournamentStatus,
  TeamStatus,
  GameStatus,
  TableStatus,
  DirectorRole,
  ChipTransactionType,
  PlayerRegistrationStatus,
  AuditAction,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  ConfigType
} from '@prisma/client';

// Import missing enums from validation types
import type {
  PlayerType,
  GameType,
  AssignmentType,
  BracketOrdering,
  Rules,
  RatingSystem,
  PayoutType,
  PayoutPlacesSetting,
  AccessType,
  SidePotEntryType,
  SidePotWinnerType
} from './tournament-validation.types';

// Re-export all types
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
  TournamentDirector,
  AuditLog,
  Notification,
  SystemConfig,
  TournamentType,
  TournamentFormat,
  TournamentStatus,
  TeamStatus,
  GameStatus,
  TableStatus,
  DirectorRole,
  ChipTransactionType,
  PlayerRegistrationStatus,
  AuditAction,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  ConfigType,
  PlayerType,
  GameType,
  AssignmentType,
  BracketOrdering,
  Rules,
  RatingSystem,
  PayoutType,
  PayoutPlacesSetting,
  AccessType,
  SidePotEntryType,
  SidePotWinnerType
};

// Enhanced interfaces with relationships
export interface TeamWithDetails extends Team {
  members: TeamMember[];
  currentChips: number;
  gamesPlayed?: number;
  gamesWon?: number;
  totalWinnings?: number;
}

export interface GameWithDetails extends Game {
  homeTeam: TeamWithDetails;
  awayTeam: TeamWithDetails;
  table: Table;
  tournament: Tournament;
  scoreEnteredBy?: Player;
  scoreApprovedBy?: Player;
}

export interface TournamentWithDetails extends Tournament {
  venue: Venue;
  teams: TeamWithDetails[];
  games: GameWithDetails[];
  tables: Table[];
  directors: TournamentDirector[];
  chipTransactions?: ChipTransaction[];
  payouts?: Payout[];
  sidePots?: SidePot[];
}

export interface PlayerWithStats extends Player {
  gamesPlayed: number;
  gamesWon: number;
  totalChipsWon: number;
  totalWinnings: number;
  currentTournamentChips?: number;
  averageOpponentRating?: number;
}

// Money calculation interfaces
export interface MoneyBreakdown {
  totalEntryFees: number;
  totalAdminFees: number;
  totalAddedMoney: number;
  totalPrizePool: number;
  houseTake: number;
  payoutAmount: number;
}

export interface PayoutSplit {
  playerId: string;
  playerName: string;
  amount: number;
  percentage: number;
}

export interface PayoutCalculation {
  place: number;
  totalAmount: number;
  numberOfWinners: number;
  amountPerWinner: number;
  splits?: PayoutSplit[];
}

// Table management interfaces
export interface TableAssignment {
  tableId: string;
  tableName: string;
  homeTeamId: string;
  awayTeamId: string;
  gameNumber: number;
  estimatedStartTime?: Date;
  priority?: number;
}

export interface QueueEntry {
  teamId: string;
  priority: number;
  lastGameTime?: Date;
  gamesPlayed: number;
  waitingSince: Date;
  avoidTeamIds?: string[]; // Teams to avoid for repeat matchups
}

// Game progression interfaces
export interface GameScore {
  homeScore: number;
  awayScore: number;
  winner: 'home' | 'away';
  forfeit?: boolean;
  notes?: string;
}

export interface GameSubmission extends GameScore {
  submittedBy: string;
  submittedAt: Date;
  requiresApproval: boolean;
}

// Tournament state interfaces
export interface TournamentState {
  tournament: TournamentWithDetails;
  activeGames: GameWithDetails[];
  availableTables: Table[];
  teamQueue: QueueEntry[];
  completedGames: GameWithDetails[];
  leaderboard: TeamWithDetails[];
  moneyBreakdown: MoneyBreakdown;
  nextGameNumber: number;
}

// Director action interfaces
export interface DirectorAction {
  action: 'approve_scores' | 'modify_scores' | 'assign_table' | 'manual_payout' | 'chip_adjustment';
  targetId: string; // gameId, teamId, etc.
  parameters: Record<string, any>;
  reason?: string;
}

// Chip calculation interfaces
export interface ChipCalculationResult {
  playerId: string;
  playerName: string;
  fargoRating: number;
  birthdayChips: number;
  baseChips: number;
  bonusChips: number;
  totalChips: number;
  appliedRange?: string;
}

export interface ChipTransactionData {
  id: string;
  teamId: string;
  amount: number;
  type: ChipTransactionType;
  description: string;
  gameId?: string;
  createdBy: string;
  createdAt: Date;
}

// API request/response interfaces
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

export interface AddTeamRequest {
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  teamName?: string;
}

export interface SubmitScoresRequest {
  gameId: string;
  homeScore: number;
  awayScore: number;
  forfeit?: boolean;
  notes?: string;
}

// Error classes
export class TournamentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TournamentValidationError';
  }
}

// Service interfaces
export interface ITournamentService {
  createTournament(data: CreateTournamentRequest, createdBy: string): Promise<Tournament>;
  startTournament(tournamentId: string, directorId: string): Promise<void>;
  getTournamentState(tournamentId: string): Promise<TournamentState>;
  addTeam(request: AddTeamRequest, directorId: string): Promise<TeamWithDetails>;
  processGameResult(gameId: string, result: GameScore): Promise<void>;
}

export interface IChipService {
  calculateInitialChips(playerId: string, tournamentId: string): Promise<ChipCalculationResult>;
  initializeTeamChips(teamId: string): Promise<void>;
  processGameResult(gameId: string, winnerTeamId: string, chipsWon: number): Promise<void>;
  manualChipAdjustment(teamId: string, amount: number, reason: string, directorId: string): Promise<void>;
}

export interface IQueueService {
  initializeQueue(tournamentId: string, seedType?: 'random' | 'fargo'): Promise<void>;
  getNextTeamForTable(tournamentId: string, tableId: string): Promise<{ homeTeam: TeamWithDetails; awayTeam: TeamWithDetails } | null>;
  updatePairingHistory(tournamentId: string, homeTeamId: string, awayTeamId: string): Promise<void>;
  shuffleQueue(tournamentId: string): Promise<void>;
}

export interface ITableAssignmentService {
  makeInitialAssignments(tournamentId: string): Promise<TableAssignment[]>;
  processAutomaticAssignments(tournamentId: string): Promise<TableAssignment[]>;
  manualTableAssignment(tableId: string, homeTeamId: string, awayTeamId: string): Promise<GameWithDetails>;
}

export interface IGameProgressionService {
  submitGameScores(submission: GameSubmission): Promise<GameWithDetails>;
  approveGameScores(gameId: string, directorId: string): Promise<void>;
  processGameCompletion(gameId: string): Promise<void>;
  modifyGameScores(gameId: string, newScores: GameScore, directorId: string): Promise<void>;
}

export interface IMoneyCalculationService {
  calculateTournamentMoney(tournamentId: string): Promise<MoneyBreakdown>;
  createPayouts(tournamentId: string, payouts: PayoutCalculation[]): Promise<void>;
  createPayoutSplit(payoutId: string, splits: PayoutSplit[]): Promise<void>;
  processPayment(payoutId: string, amount: number, method: string): Promise<void>;
}