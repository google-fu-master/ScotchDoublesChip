/**
 * Player and team validation schemas
 */

import { z } from 'zod'
import { PlayerRegistrationStatus, TeamStatus } from '@prisma/client'
import { idSchema, emailSchema, phoneSchema } from './tournament.validation'

// User and profile validation
export const createUserSchema = z.object({
  email: emailSchema,
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: phoneSchema.optional()
})

export const updateUserSchema = createUserSchema.partial().extend({
  id: idSchema
})

// Player registration validation
export const playerRegistrationSchema = z.object({
  tournamentId: idSchema,
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(30, 'Display name must be less than 30 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Display name can only contain letters, numbers, spaces, hyphens, and underscores'),
  skillLevel: z.string()
    .regex(/^[1-9]|10$/, 'Skill level must be between 1-10')
    .optional(),
  handicap: z.number()
    .min(0, 'Handicap cannot be negative')
    .max(100, 'Handicap cannot exceed 100')
    .optional(),
  contactPreferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true)
  }).optional()
})

export const updatePlayerProfileSchema = z.object({
  playerProfileId: idSchema,
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(30, 'Display name must be less than 30 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Display name can only contain letters, numbers, spaces, hyphens, and underscores')
    .optional(),
  skillLevel: z.string()
    .regex(/^[1-9]|10$/, 'Skill level must be between 1-10')
    .optional(),
  handicap: z.number()
    .min(0, 'Handicap cannot be negative')
    .max(100, 'Handicap cannot exceed 100')
    .optional(),
  settings: z.record(z.any()).optional()
})

// Team validation
export const createTeamSchema = z.object({
  tournamentId: idSchema,
  name: z.string()
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_&.]+$/, 'Team name contains invalid characters'),
  playerIds: z.array(idSchema)
    .min(1, 'At least one player is required')
    .max(4, 'Maximum 4 players per team')
}).refine((data) => {
  // Ensure no duplicate player IDs
  const uniqueIds = new Set(data.playerIds)
  return uniqueIds.size === data.playerIds.length
}, {
  message: 'Duplicate players are not allowed on the same team'
})

export const updateTeamSchema = z.object({
  teamId: idSchema,
  name: z.string()
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_&.]+$/, 'Team name contains invalid characters')
    .optional(),
  status: z.nativeEnum(TeamStatus).optional(),
  addPlayerIds: z.array(idSchema).optional(),
  removePlayerIds: z.array(idSchema).optional()
}).refine((data) => {
  // Ensure no overlap between add and remove
  if (data.addPlayerIds && data.removePlayerIds) {
    const addSet = new Set(data.addPlayerIds)
    const removeSet = new Set(data.removePlayerIds)
    const intersection = [...addSet].filter(x => removeSet.has(x))
    return intersection.length === 0
  }
  return true
}, {
  message: 'Cannot add and remove the same player simultaneously'
})

// Team pairing validation
export const teamPairingOptionsSchema = z.object({
  method: z.enum(['random', 'skill_balanced', 'manual']),
  skillBalancing: z.object({
    enabled: z.boolean().default(false),
    maxSkillDifference: z.number().min(0).max(10).optional()
  }).optional(),
  constraints: z.object({
    preventRepeats: z.boolean().default(true),
    genderBalanced: z.boolean().optional()
  }).optional()
})

// Player statistics validation
export const playerStatsFilterSchema = z.object({
  tournamentId: idSchema.optional(),
  playerId: idSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  gameType: z.string().optional(),
  minGamesPlayed: z.number().min(0).optional()
})

// Registration status validation
const allowedRegistrationStatusTransitions: Record<PlayerRegistrationStatus, PlayerRegistrationStatus[]> = {
  PENDING: ['CONFIRMED', 'DECLINED', 'CANCELLED'],
  CONFIRMED: ['CANCELLED'],
  WAITLISTED: ['CONFIRMED', 'DECLINED', 'CANCELLED'],
  DECLINED: ['CONFIRMED'], // Allow re-registration
  CANCELLED: [] // Terminal state
}

export const validateRegistrationStatusTransition = (
  currentStatus: PlayerRegistrationStatus, 
  newStatus: PlayerRegistrationStatus
): boolean => {
  return allowedRegistrationStatusTransitions[currentStatus]?.includes(newStatus) ?? false
}

// Business rules validation
export const validatePlayerRules = {
  canRegisterForTournament: (
    tournament: any, 
    user: any, 
    existingRegistration?: any
  ): { valid: boolean; reason?: string } => {
    if (existingRegistration && existingRegistration.status === 'CONFIRMED') {
      return { valid: false, reason: 'Already registered for this tournament' }
    }
    
    if (tournament.status !== 'REGISTRATION_OPEN') {
      return { valid: false, reason: 'Registration is not open' }
    }
    
    if (tournament.registrationCloseDate && new Date() > new Date(tournament.registrationCloseDate)) {
      return { valid: false, reason: 'Registration deadline has passed' }
    }
    
    return { valid: true }
  },
  
  canCreateTeam: (
    tournament: any, 
    playerIds: string[], 
    existingPlayers: any[]
  ): { valid: boolean; reason?: string } => {
    if (tournament.format === 'SINGLES') {
      return { valid: false, reason: 'Teams not allowed in singles tournament' }
    }
    
    const maxTeamSize = tournament.format === 'SCOTCH_DOUBLES' ? 2 : 4
    if (playerIds.length > maxTeamSize) {
      return { valid: false, reason: `Maximum team size is ${maxTeamSize} for this format` }
    }
    
    // Check if any players are already on teams
    const playersOnTeams = existingPlayers.filter(p => 
      p.teamMemberships && p.teamMemberships.length > 0
    )
    
    if (playersOnTeams.length > 0) {
      return { 
        valid: false, 
        reason: 'Some players are already on teams' 
      }
    }
    
    return { valid: true }
  }
}

// Export inferred types
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type PlayerRegistrationInput = z.infer<typeof playerRegistrationSchema>
export type UpdatePlayerProfileInput = z.infer<typeof updatePlayerProfileSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>
export type TeamPairingOptions = z.infer<typeof teamPairingOptionsSchema>
export type PlayerStatsFilter = z.infer<typeof playerStatsFilterSchema>