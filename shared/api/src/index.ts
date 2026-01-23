import { z } from 'zod';

// Validation schemas for Tournament creation
export const TournamentCreateSchema = z.object({
  name: z.string().min(1, 'Tournament name is required'),
  date: z.string().min(1, 'Tournament date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  format: z.enum(['scotch_doubles', 'singles', 'team_event']),
  gameType: z.enum(['8_ball', '9_ball', '10_ball', 'straight_pool']),
  raceToWins: z.number().min(1).max(15),
  totalTables: z.number().min(1).max(32),
  rules: z.string().min(1),
  estimatedDuration: z.number().min(60).max(720),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  description: z.string().optional(),
  
  // Chip settings
  startingChips: z.number().min(100),
  chipDistributionMethod: z.enum(['equal_distribution', 'skill_based', 'random_distribution']),
  autopilotMode: z.boolean(),
  winnerStays: z.boolean(),
  preventRepeats: z.boolean(),
  
  // Financial settings
  entryFee: z.number().min(0),
  adminFee: z.number().min(0),
  addedMoney: z.number().min(0),
  payoutStructure: z.array(z.object({
    place: z.number(),
    percentage: z.number(),
    amount: z.number()
  })),
  
  // Access settings
  accessType: z.enum(['public', 'private', 'invitation_only'])
});

export const PlayerCreateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  skillRating: z.number().min(0).max(10).optional()
});

export const TeamCreateSchema = z.object({
  tournamentId: z.string(),
  player1Id: z.string(),
  player2Id: z.string(),
  name: z.string().optional()
});

export const MatchCreateSchema = z.object({
  tournamentId: z.string(),
  team1Id: z.string(),
  team2Id: z.string(),
  tableNumber: z.number(),
  chipsBet: z.number().min(0)
});

// API Client class
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Tournament API methods
  async createTournament(data: z.infer<typeof TournamentCreateSchema>) {
    return this.request('/tournaments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTournaments() {
    return this.request('/tournaments');
  }

  async getTournament(id: string) {
    return this.request(`/tournaments/${id}`);
  }

  async updateTournament(id: string, data: Partial<z.infer<typeof TournamentCreateSchema>>) {
    return this.request(`/tournaments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTournament(id: string) {
    return this.request(`/tournaments/${id}`, {
      method: 'DELETE',
    });
  }

  // Player API methods
  async createPlayer(data: z.infer<typeof PlayerCreateSchema>) {
    return this.request('/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPlayers() {
    return this.request('/players');
  }

  async getPlayer(id: string) {
    return this.request(`/players/${id}`);
  }

  // Team API methods
  async createTeam(data: z.infer<typeof TeamCreateSchema>) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTournamentTeams(tournamentId: string) {
    return this.request(`/tournaments/${tournamentId}/teams`);
  }

  // Match API methods
  async createMatch(data: z.infer<typeof MatchCreateSchema>) {
    return this.request('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTournamentMatches(tournamentId: string) {
    return this.request(`/tournaments/${tournamentId}/matches`);
  }

  async updateMatch(id: string, data: { winnerId?: string; status?: string }) {
    return this.request(`/matches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();