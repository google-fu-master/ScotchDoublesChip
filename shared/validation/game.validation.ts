/**
 * Game and match validation schemas
 */

import { z } from 'zod'
import { GameStatus, ChipTransactionType } from '@prisma/client'
import { idSchema } from './tournament.validation'

// Game data validation schemas
const poolGameDataSchema = z.object({
  gameFormat: z.enum(['8ball', '9ball', '10ball', 'straight']),
  rackNumber: z.number().min(1).optional(),
  breakPlayer: idSchema.optional(),
  scratchesOnBreak: z.boolean().optional(),
  eightBallOnBreak: z.boolean().optional(),
  tableNumber: z.string().max(10).optional(),
  duration: z.number().min(0).optional() // seconds
})

const dartsGameDataSchema = z.object({
  gameFormat: z.enum(['501', '301', 'cricket']),
  finishType: z.enum(['double', 'single']).optional(),
  legs: z.number().min(1).optional(),
  sets: z.number().min(1).optional()
})

const scoringDataSchema = z.object({
  maxScore: z.number().min(0).optional(),
  scoringMethod: z.enum(['points', 'time', 'custom']),
  tieBreakerMethod: z.string().optional()
})

export const gameDataSchema = z.object({
  gameType: z.string().min(1, 'Game type is required'),
  pool: poolGameDataSchema.optional(),
  darts: dartsGameDataSchema.optional(),
  scoring: scoringDataSchema.optional(),
  notes: z.string().max(500).optional(),
  referee: z.string().max(100).optional(),
  witnesses: z.array(z.string()).max(5).optional()
}).refine((data) => {
  // Ensure game-specific data matches game type
  if (data.gameType === 'pool' && !data.pool) {
    return false
  }
  if (data.gameType === 'darts' && !data.darts) {
    return false
  }
  return true
}, {
  message: 'Game-specific data must match game type'
})

// Game creation and management
export const createGameSchema = z.object({
  tournamentId: idSchema,
  matchId: idSchema.optional(),
  gameNumber: z.number().min(1),
  gameType: z.string().min(1),
  gameData: gameDataSchema.partial(),
  playerIds: z.array(idSchema).min(1, 'At least one player is required')
})

export const updateGameSchema = z.object({
  gameId: idSchema,
  status: z.nativeEnum(GameStatus).optional(),
  gameData: gameDataSchema.partial().optional(),
  winnerId: idSchema.optional(),
  notes: z.string().max(1000).optional()
})

// Game result recording
export const gameResultSchema = z.object({
  playerProfileId: idSchema,
  score: z.number().min(0).optional(),
  chips: z.number().optional(),
  position: z.number().min(1).optional(),
  performance: z.record(z.string(), z.any()).optional()
})

export const recordGameResultSchema = z.object({
  gameId: idSchema,
  playerResults: z.array(gameResultSchema).min(1),
  gameData: gameDataSchema.partial().optional(),
  notes: z.string().max(1000).optional()
}).refine((data) => {
  // Ensure unique player IDs in results
  const playerIds = data.playerResults.map(r => r.playerProfileId)
  const uniqueIds = new Set(playerIds)
  return uniqueIds.size === playerIds.length
}, {
  message: 'Duplicate player results are not allowed'
}).refine((data) => {
  // Validate position numbering if provided
  const positions = data.playerResults
    .map(r => r.position)
    .filter((p): p is number => p !== undefined)
  
  if (positions.length > 0) {
    const sortedPositions = [...positions].sort((a, b) => a - b)
    const expectedPositions = Array.from({length: positions.length}, (_, i) => i + 1)
    return JSON.stringify(sortedPositions) === JSON.stringify(expectedPositions)
  }
  
  return true
}, {
  message: 'Positions must be consecutive starting from 1'
})

// Chip transaction validation
export const createChipTransactionSchema = z.object({
  tournamentId: idSchema,
  playerProfileId: idSchema.optional(),
  teamId: idSchema.optional(), 
  gameId: idSchema.optional(),
  type: z.nativeEnum(ChipTransactionType),
  amount: z.number().refine((val) => {
    // Amount can be negative for penalties/deductions
    return Math.abs(val) >= 1
  }, 'Amount must be at least 1 (positive or negative)'),
  reason: z.string().max(100).optional(),
  description: z.string().max(500).optional()
})

// Live game updates
export const liveGameUpdateSchema = z.object({
  gameId: idSchema,
  status: z.nativeEnum(GameStatus),
  currentScore: z.record(z.string(), z.number()).optional(),
  timeElapsed: z.number().min(0).optional(),
  estimatedTimeRemaining: z.number().min(0).optional(),
  events: z.array(z.object({
    type: z.enum(['score_update', 'penalty', 'timeout', 'game_complete', 'chip_award']),
    playerId: idSchema.optional(),
    data: z.record(z.string(), z.any()),
    description: z.string().max(200)
  }))
})

// Status transition validation
const allowedGameStatusTransitions: Record<GameStatus, GameStatus[]> = {
  NOT_STARTED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], // Terminal state
  CANCELLED: ['NOT_STARTED'] // Can restart cancelled games
}

export const validateGameStatusTransition = (currentStatus: GameStatus, newStatus: GameStatus): boolean => {
  return allowedGameStatusTransitions[currentStatus]?.includes(newStatus) ?? false
}

// Business rules validation
export const validateGameRules = {
  canStartGame: (game: any, players: any[]): { valid: boolean; reason?: string } => {
    if (game.status !== 'NOT_STARTED') {
      return { valid: false, reason: 'Game already started or completed' }
    }
    
    const requiredPlayers = game.tournament?.format === 'SCOTCH_DOUBLES' ? 2 : 1
    if (players.length < requiredPlayers) {
      return { valid: false, reason: `Minimum ${requiredPlayers} players required` }
    }
    
    // Check if all players are checked in
    const uncheckedPlayers = players.filter(p => !p.checkedInAt)
    if (uncheckedPlayers.length > 0) {
      return { valid: false, reason: 'All players must be checked in' }
    }
    
    return { valid: true }
  },
  
  canRecordResult: (game: any, results: any[]): { valid: boolean; reason?: string } => {
    if (game.status !== 'COMPLETED') {
      return { valid: false, reason: 'Game must be completed to record results' }
    }
    
    const expectedPlayerCount = game.results?.length || 0
    if (results.length !== expectedPlayerCount) {
      return { valid: false, reason: 'Results required for all game participants' }
    }
    
    return { valid: true }
  }
}

// Export inferred types
export type CreateGameInput = z.infer<typeof createGameSchema>
export type UpdateGameInput = z.infer<typeof updateGameSchema>
export type RecordGameResultInput = z.infer<typeof recordGameResultSchema>
export type CreateChipTransactionInput = z.infer<typeof createChipTransactionSchema>
export type LiveGameUpdate = z.infer<typeof liveGameUpdateSchema>
export type GameData = z.infer<typeof gameDataSchema>