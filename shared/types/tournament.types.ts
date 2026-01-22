/**
 * Core tournament types and interfaces
 * Extends Prisma-generated types with business logic types
 */

import type { 
  Tournament as PrismaTournament,
  TournamentType,
  TournamentFormat,
  TournamentStatus,
  PlayerProfile as PrismaPlayerProfile,
  Team as PrismaTeam
} from '@prisma/client'

// Tournament configuration for different tournament types
export interface TournamentSettings {
  // Chip Tournament specific settings
  chipTournament?: {
    startingChips: number
    chipMultipliers: {
      win: number
      loss: number
      breakAndRun: number
      eightOnBreak: number
    }
    penaltyChips: {
      lateness: number
      unsportsmanlike: number
      noShow: number
    }
  }
  
  // Elimination Tournament settings  
  elimination?: {
    eliminationType: 'single' | 'double'
    seedingMethod: 'random' | 'skill' | 'manual'
  }
  
  // Round Robin settings
  roundRobin?: {
    pointsPerWin: number
    pointsPerLoss: number
    tiebreakMethod: 'headToHead' | 'pointDifferential' | 'totalPoints'
  }
  
  // Swiss system settings
  swiss?: {
    rounds: number
    pairingMethod: 'swiss' | 'modified'
  }
  
  // General settings for all tournament types
  general: {
    gameType: string // 'pool', 'darts', etc.
    timeLimit?: number // minutes per game
    allowLateRegistration: boolean
    requireCheckin: boolean
    autoPairTeams: boolean // For doubles formats
  }
}

// Extended tournament interface
export interface Tournament extends Omit<PrismaTournament, 'settings'> {
  settings: TournamentSettings
  playerCount?: number
  teamCount?: number
  isRegistrationOpen: boolean
  canUserRegister: boolean
}

// Tournament creation/update types
export interface CreateTournamentInput {
  name: string
  description?: string
  tournamentType: TournamentType
  format: TournamentFormat
  settings: TournamentSettings
  startDate?: Date
  endDate?: Date
  registrationOpenDate?: Date
  registrationCloseDate?: Date
  maxPlayers?: number
  minPlayers?: number
  entryFee?: number
}

export interface UpdateTournamentInput extends Partial<CreateTournamentInput> {
  id: string
  status?: TournamentStatus
}

// Tournament statistics and analytics
export interface TournamentStats {
  totalPlayers: number
  totalTeams: number
  totalGames: number
  averageGameTime: number
  completionRate: number
  topPerformers: Array<{
    playerId: string
    playerName: string
    score: number
    gamesPlayed: number
  }>
}

// Tournament state for real-time updates
export interface TournamentState {
  id: string
  status: TournamentStatus
  currentRound?: number
  activeMatches: number
  completedMatches: number
  lastUpdated: Date
}

export type TournamentWithDetails = Tournament & {
  playerProfiles: PrismaPlayerProfile[]
  teams: PrismaTeam[]
  stats: TournamentStats
}