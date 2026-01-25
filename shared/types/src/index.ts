// Export all age restriction types
export * from '../age-restriction.types';

// Tournament related types
export interface Tournament {
  id: string;
  name: string;
  date: string;
  startTime: string;
  format: 'scotch_doubles' | 'singles' | 'team_event';
  gameType: '8_ball' | '9_ball' | '10_ball' | 'straight_pool';
  raceToWins: number;
  totalTables: number;
  rules: string;
  estimatedDuration: number;
  venueName?: string;
  venueAddress?: string;
  description?: string;
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  accessType: 'public' | 'private' | 'invitation_only';
  
  // Chip settings
  startingChips: number;
  chipDistributionMethod: 'equal_distribution' | 'skill_based' | 'random_distribution';
  autopilotMode: boolean;
  winnerStays: boolean;
  preventRepeats: boolean;
  
  // Financial settings
  entryFee: number;
  adminFee: number;
  addedMoney: number;
  payoutStructure: PayoutEntry[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PayoutEntry {
  place: number;
  percentage: number;
  amount: number;
}

// Team related types
export interface Team {
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  name?: string;
  chips: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  isActive: boolean;
  createdAt: string;
}

// Player related types
export interface Player {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  skillRating?: number;
  totalWins?: number;
  totalLosses?: number;
  totalTournaments?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Match related types
export interface Match {
  id: string;
  tournamentId: string;
  team1Id: string;
  team2Id: string;
  tableNumber: number;
  chipsBet: number;
  winnerId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types for Tournament Creation Wizard
export interface TournamentFormData {
  // Basic Information
  name: string;
  date: string;
  startTime: string;
  format: Tournament['format'];
  venueName: string;
  venueAddress: string;
  description: string;
  
  // Game Configuration
  gameType: Tournament['gameType'];
  raceToWins: number;
  totalTables: number;
  rules: string;
  estimatedDuration: number;
  
  // Chip Settings
  startingChips: number;
  chipDistributionMethod: Tournament['chipDistributionMethod'];
  autopilotMode: boolean;
  winnerStays: boolean;
  preventRepeats: boolean;
  
  // Financial Settings
  entryFee: number;
  adminFee: number;
  addedMoney: number;
  payoutStructure: PayoutEntry[];
  
  // Access Settings
  accessType: Tournament['accessType'];
}