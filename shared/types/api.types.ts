/**
 * API request and response types
 */

// Standard API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

// Pagination and filtering
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  status?: string
  tournamentType?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: any
}

export interface ListParams extends PaginationParams, FilterParams {}

// Tournament API types
export interface TournamentListResponse {
  tournaments: Array<{
    id: string
    name: string
    tournamentType: string
    status: string
    playerCount: number
    startDate?: string
    endDate?: string
  }>
  total: number
}

// Real-time subscription types
export interface WebSocketMessage<T = any> {
  type: string
  payload: T
  timestamp: Date
  correlationId?: string
}

export interface TournamentUpdateMessage {
  type: 'tournament_update'
  payload: {
    tournamentId: string
    updates: {
      status?: string
      playerCount?: number
      currentRound?: number
      leaderboard?: any
    }
  }
}

export interface GameUpdateMessage {
  type: 'game_update'
  payload: {
    gameId: string
    status: string
    score?: Record<string, number>
    timeElapsed?: number
    events: any[]
  }
}

// Error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiError extends Error {
  code: string
  statusCode: number
  details?: any
  validationErrors?: ValidationError[]
}