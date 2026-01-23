"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.ApiClient = exports.MatchCreateSchema = exports.TeamCreateSchema = exports.PlayerCreateSchema = exports.TournamentCreateSchema = void 0;
const zod_1 = require("zod");
// Validation schemas for Tournament creation
exports.TournamentCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tournament name is required'),
    date: zod_1.z.string().min(1, 'Tournament date is required'),
    startTime: zod_1.z.string().min(1, 'Start time is required'),
    format: zod_1.z.enum(['scotch_doubles', 'singles', 'team_event']),
    gameType: zod_1.z.enum(['8_ball', '9_ball', '10_ball', 'straight_pool']),
    raceToWins: zod_1.z.number().min(1).max(15),
    totalTables: zod_1.z.number().min(1).max(32),
    rules: zod_1.z.string().min(1),
    estimatedDuration: zod_1.z.number().min(60).max(720),
    venueName: zod_1.z.string().optional(),
    venueAddress: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    // Chip settings
    startingChips: zod_1.z.number().min(100),
    chipDistributionMethod: zod_1.z.enum(['equal_distribution', 'skill_based', 'random_distribution']),
    autopilotMode: zod_1.z.boolean(),
    winnerStays: zod_1.z.boolean(),
    preventRepeats: zod_1.z.boolean(),
    // Financial settings
    entryFee: zod_1.z.number().min(0),
    adminFee: zod_1.z.number().min(0),
    addedMoney: zod_1.z.number().min(0),
    payoutStructure: zod_1.z.array(zod_1.z.object({
        place: zod_1.z.number(),
        percentage: zod_1.z.number(),
        amount: zod_1.z.number()
    })),
    // Access settings
    accessType: zod_1.z.enum(['public', 'private', 'invitation_only'])
});
exports.PlayerCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    phone: zod_1.z.string().optional(),
    skillRating: zod_1.z.number().min(0).max(10).optional()
});
exports.TeamCreateSchema = zod_1.z.object({
    tournamentId: zod_1.z.string(),
    player1Id: zod_1.z.string(),
    player2Id: zod_1.z.string(),
    name: zod_1.z.string().optional()
});
exports.MatchCreateSchema = zod_1.z.object({
    tournamentId: zod_1.z.string(),
    team1Id: zod_1.z.string(),
    team2Id: zod_1.z.string(),
    tableNumber: zod_1.z.number(),
    chipsBet: zod_1.z.number().min(0)
});
// API Client class
class ApiClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, Object.assign({ headers: Object.assign({ 'Content-Type': 'application/json' }, options.headers) }, options));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
    // Tournament API methods
    async createTournament(data) {
        return this.request('/tournaments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async getTournaments() {
        return this.request('/tournaments');
    }
    async getTournament(id) {
        return this.request(`/tournaments/${id}`);
    }
    async updateTournament(id, data) {
        return this.request(`/tournaments/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async deleteTournament(id) {
        return this.request(`/tournaments/${id}`, {
            method: 'DELETE',
        });
    }
    // Player API methods
    async createPlayer(data) {
        return this.request('/players', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async getPlayers() {
        return this.request('/players');
    }
    async getPlayer(id) {
        return this.request(`/players/${id}`);
    }
    // Team API methods
    async createTeam(data) {
        return this.request('/teams', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async getTournamentTeams(tournamentId) {
        return this.request(`/tournaments/${tournamentId}/teams`);
    }
    // Match API methods
    async createMatch(data) {
        return this.request('/matches', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async getTournamentMatches(tournamentId) {
        return this.request(`/tournaments/${tournamentId}/matches`);
    }
    async updateMatch(id, data) {
        return this.request(`/matches/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}
exports.ApiClient = ApiClient;
exports.apiClient = new ApiClient();
