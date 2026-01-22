/**
 * Validation schemas for tournament management
 * Using Zod for runtime validation and TypeScript integration
 */

import { z } from 'zod'
import { TournamentType, TournamentFormat, TournamentStatus } from '@prisma/client'

// Base validation schemas
export const idSchema = z.string().min(1, 'ID is required')
export const emailSchema = z.string().email('Invalid email format')
export const phoneSchema = z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number')

// Tournament settings validation
const chipTournamentSettingsSchema = z.object({
  startingChips: z.number().min(1, 'Starting chips must be positive'),
  chipMultipliers: z.object({
    win: z.number().min(0),
    loss: z.number().min(0),
    breakAndRun: z.number().min(0),
    eightOnBreak: z.number().min(0)
  }),
  penaltyChips: z.object({
    lateness: z.number().min(0),
    unsportsmanlike: z.number().min(0),
    noShow: z.number().min(0)
  })
})

const eliminationSettingsSchema = z.object({
  eliminationType: z.enum(['single', 'double']),
  seedingMethod: z.enum(['random', 'skill', 'manual'])
})

const roundRobinSettingsSchema = z.object({
  pointsPerWin: z.number().min(0),
  pointsPerLoss: z.number().min(0),
  tiebreakMethod: z.enum(['headToHead', 'pointDifferential', 'totalPoints'])
})

const swissSettingsSchema = z.object({
  rounds: z.number().min(1),
  pairingMethod: z.enum(['swiss', 'modified'])
})

const generalSettingsSchema = z.object({
  gameType: z.string().min(1, 'Game type is required'),
  timeLimit: z.number().min(1).optional(),
  allowLateRegistration: z.boolean(),
  requireCheckin: z.boolean(),
  autoPairTeams: z.boolean()
})

export const tournamentSettingsSchema = z.object({
  chipTournament: chipTournamentSettingsSchema.optional(),
  elimination: eliminationSettingsSchema.optional(),
  roundRobin: roundRobinSettingsSchema.optional(),
  swiss: swissSettingsSchema.optional(),
  general: generalSettingsSchema
}).refine((data) => {
  // Ensure at least one tournament type setting exists
  return data.chipTournament || data.elimination || data.roundRobin || data.swiss
}, {
  message: 'At least one tournament type configuration is required'
})

// Tournament validation schemas
export const createTournamentSchema = z.object({
  name: z.string()
    .min(3, 'Tournament name must be at least 3 characters')
    .max(100, 'Tournament name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tournamentType: z.nativeEnum(TournamentType),
  format: z.nativeEnum(TournamentFormat),
  settings: tournamentSettingsSchema,
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  registrationOpenDate: z.date().optional(),
  registrationCloseDate: z.date().optional(),
  maxPlayers: z.number().min(2).max(1000).optional(),
  minPlayers: z.number().min(2).max(100).optional(),
  entryFee: z.number().min(0).optional()
}).refine((data) => {
  // Validate date relationships
  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    return false
  }
  if (data.registrationOpenDate && data.registrationCloseDate && 
      data.registrationOpenDate >= data.registrationCloseDate) {
    return false
  }
  if (data.minPlayers && data.maxPlayers && data.minPlayers > data.maxPlayers) {
    return false
  }
  return true
}, {
  message: 'Invalid date ranges or player limits'
})

export const updateTournamentSchema = createTournamentSchema.partial().extend({
  id: idSchema,
  status: z.nativeEnum(TournamentStatus).optional()
})

// Tournament filtering and pagination
export const tournamentFilterSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(TournamentStatus).optional(),
  tournamentType: z.nativeEnum(TournamentType).optional(),
  format: z.nativeEnum(TournamentFormat).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  organizationId: idSchema.optional()
})

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const listTournamentsSchema = paginationSchema.merge(tournamentFilterSchema)

// Status transition validation
const allowedStatusTransitions: Record<TournamentStatus, TournamentStatus[]> = {
  SETUP: ['REGISTRATION_OPEN', 'CANCELLED'],
  REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'CANCELLED'],
  REGISTRATION_CLOSED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['PAUSED', 'COMPLETED', 'CANCELLED'],
  PAUSED: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: [], // Terminal state
  CANCELLED: [] // Terminal state
}

export const validateStatusTransition = (currentStatus: TournamentStatus, newStatus: TournamentStatus): boolean => {
  return allowedStatusTransitions[currentStatus]?.includes(newStatus) ?? false
}

// Tournament business rules validation
export const validateTournamentRules = {
  canRegister: (tournament: any, playerCount: number): { valid: boolean; reason?: string } => {
    if (tournament.status !== 'REGISTRATION_OPEN') {
      return { valid: false, reason: 'Registration is not open' }
    }
    if (tournament.maxPlayers && playerCount >= tournament.maxPlayers) {
      return { valid: false, reason: 'Tournament is full' }
    }
    if (tournament.registrationCloseDate && new Date() > new Date(tournament.registrationCloseDate)) {
      return { valid: false, reason: 'Registration deadline has passed' }
    }
    return { valid: true }
  },
  
  canStart: (tournament: any, playerCount: number): { valid: boolean; reason?: string } => {
    if (tournament.status !== 'REGISTRATION_CLOSED') {
      return { valid: false, reason: 'Tournament registration must be closed first' }
    }
    if (tournament.minPlayers && playerCount < tournament.minPlayers) {
      return { valid: false, reason: `Minimum ${tournament.minPlayers} players required` }
    }
    return { valid: true }
  }
}

// Export types derived from schemas
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>
export type TournamentFilterInput = z.infer<typeof tournamentFilterSchema>
export type ListTournamentsInput = z.infer<typeof listTournamentsSchema>
export type TournamentSettings = z.infer<typeof tournamentSettingsSchema>