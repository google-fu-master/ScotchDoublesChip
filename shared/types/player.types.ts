/**
 * Player and team related types
 */

import type {
  User as PrismaUser,
  PlayerProfile as PrismaPlayerProfile,
  Team as PrismaTeam,
  TeamMember as PrismaTeamMember,
  PlayerRegistrationStatus,
  TeamStatus
} from '@prisma/client'

// Extended user profile with tournament context
export interface PlayerProfile extends PrismaPlayerProfile {
  user: PrismaUser
  currentChips?: number // For chip tournaments
  ranking?: number
  winLossRecord?: {
    wins: number
    losses: number
    winPercentage: number
  }
  averageScore?: number
  gamesPlayed?: number
  isCheckedIn?: boolean
}

// Player registration and onboarding
export interface PlayerRegistrationInput {
  tournamentId: string
  displayName: string
  skillLevel?: string
  handicap?: number
  contactPreferences?: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

export interface UpdatePlayerProfileInput {
  playerProfileId: string
  displayName?: string
  skillLevel?: string
  handicap?: number
  settings?: Record<string, any>
}

// Team management for doubles/team formats
export interface Team extends PrismaTeam {
  members: Array<PrismaTeamMember & {
    playerProfile: PlayerProfile
  }>
  totalChips?: number // For chip tournaments
  teamRanking?: number
  matchRecord?: {
    wins: number
    losses: number
    winPercentage: number
  }
}

export interface CreateTeamInput {
  tournamentId: string
  name: string
  playerIds: string[] // PlayerProfile IDs
}

export interface UpdateTeamInput {
  teamId: string
  name?: string
  status?: TeamStatus
  addPlayerIds?: string[]
  removePlayerIds?: string[]
}

// Team pairing for Scotch Doubles
export interface TeamPairingOptions {
  method: 'random' | 'skill_balanced' | 'manual'
  skillBalancing?: {
    enabled: boolean
    maxSkillDifference?: number
  }
  constraints?: {
    preventRepeats: boolean
    genderBalanced?: boolean
  }
}

export interface PairingResult {
  teams: Team[]
  unpaired: PlayerProfile[]
  pairingMethod: string
  notes?: string[]
}

// Player statistics and performance
export interface PlayerStats {
  playerId: string
  tournamentId: string
  gamesPlayed: number
  wins: number
  losses: number
  winPercentage: number
  averageScore: number
  totalChips?: number // For chip tournaments
  bestGame?: {
    gameId: string
    score: number
    chips?: number
    date: Date
  }
  recentPerformance: Array<{
    gameId: string
    result: 'win' | 'loss'
    score?: number
    chips?: number
    date: Date
  }>
}

// Real-time player status
export interface PlayerStatus {
  playerId: string
  isOnline: boolean
  currentActivity: 'idle' | 'playing' | 'waiting' | 'break'
  lastSeen: Date
  currentGameId?: string
  estimatedAvailableAt?: Date
}

// Leaderboard and rankings
export interface LeaderboardEntry {
  rank: number
  playerId: string
  playerName: string
  totalChips?: number
  wins: number
  losses: number
  winPercentage: number
  gamesPlayed: number
  averageScore: number
  trend: 'up' | 'down' | 'stable'
  change: number // positions moved up/down
}

export interface Leaderboard {
  tournamentId: string
  lastUpdated: Date
  entries: LeaderboardEntry[]
  totalPlayers: number
}

export type PlayerWithStats = PlayerProfile & {
  stats: PlayerStats
  status: PlayerStatus
}