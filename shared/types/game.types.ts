/**
 * Game, match, and scoring related types
 */

import type {
  Game as PrismaGame,
  GameResult as PrismaGameResult,
  GameStatus,
  ChipTransaction as PrismaChipTransaction,
  ChipTransactionType,
  Team as PrismaTeam
} from '@prisma/client'

// Extended game interfaces
export interface Game extends Omit<PrismaGame, 'gameData'> {
  gameData: GameData
  results: GameResult[]
  chipTransactions?: ChipTransaction[]
  isComplete: boolean
  winner?: {
    playerId: string
    playerName: string
    teamId?: string
  }
}

// Flexible game data structure for different game types
export interface GameData {
  gameType: string // 'pool', 'darts', etc.
  
  // Pool-specific data
  pool?: {
    gameFormat: '8ball' | '9ball' | '10ball' | 'straight'
    rackNumber?: number
    breakPlayer?: string
    scratchesOnBreak?: boolean
    eightBallOnBreak?: boolean
    tableNumber?: string
    duration?: number // seconds
  }
  
  // Darts-specific data
  darts?: {
    gameFormat: '501' | '301' | 'cricket'
    finishType?: 'double' | 'single'
    legs?: number
    sets?: number
  }
  
  // General scoring data
  scoring?: {
    maxScore?: number
    scoringMethod: 'points' | 'time' | 'custom'
    tieBreakerMethod?: string
  }
  
  // Additional metadata
  notes?: string
  referee?: string
  witnesses?: string[]
}

// Game results with enhanced data
export interface GameResult extends PrismaGameResult {
  playerProfile?: {
    id: string
    displayName: string
    user: {
      firstName: string
      lastName: string
    }
  }
  detailedPerformance?: {
    accuracy?: number
    efficiency?: number
    timeToComplete?: number
    errorsCount?: number
  }
}

// Game creation and management
export interface CreateGameInput {
  tournamentId: string
  gameNumber: number
  gameType: string
  gameData: Partial<GameData>
  tableId?: string
  raceToWins?: number
}

export interface UpdateGameInput {
  gameId: string
  status?: GameStatus
  gameData?: Partial<GameData>
  winningTeamId?: string
  losingTeamId?: string
  winningTeamScore?: number
  losingTeamScore?: number
  scoresSubmitted?: boolean
  scoresApproved?: boolean
  notes?: string
}

export interface RecordGameResultInput {
  gameId: string
  playerResults: Array<{
    playerProfileId: string
    score?: number
    chips?: number
    position?: number
    performance?: Record<string, any>
  }>
  gameData?: Partial<GameData>
  notes?: string
}

// Chip transaction management for chip tournaments
export interface ChipTransaction extends PrismaChipTransaction {
  playerProfile?: {
    id: string
    displayName: string
  }
  team?: {
    id: string
    name: string
  }
}

export interface CreateChipTransactionInput {
  tournamentId: string
  playerProfileId: string
  gameId?: string
  type: ChipTransactionType
  amount: number
  reason?: string
  description?: string
}

// Live scoring and updates
export interface LiveGameUpdate {
  gameId: string
  status: GameStatus
  currentScore?: Record<string, number>
  timeElapsed?: number
  estimatedTimeRemaining?: number
  events: GameEvent[]
}

export interface GameEvent {
  id: string
  gameId: string
  timestamp: Date
  type: 'score_update' | 'penalty' | 'timeout' | 'game_complete' | 'chip_award'
  playerId?: string
  data: Record<string, any>
  description: string
}

// Scoring calculations and utilities
export interface ScoreCalculation {
  playerId: string
  baseScore: number
  bonusPoints: number
  penaltyPoints: number
  finalScore: number
  chipsAwarded?: number
}

export interface ChipCalculation {
  playerId: string
  gamePerformance: {
    won: boolean
    score?: number
    position?: number
    bonusActions: string[] // e.g., ['break_and_run', 'eight_on_break']
  }
  chipsBefore: number
  chipsAwarded: number
  chipsAfter: number
  multipliers: Record<string, number>
  transactions: Array<{
    type: ChipTransactionType
    amount: number
    reason: string
  }>
}

export type GameWithDetails = Game & {
  tournament: {
    id: string
    name: string
    tournamentType: string
  }
  table?: {
    id: string
    number: string
    venue: {
      name: string
    }
  }
}