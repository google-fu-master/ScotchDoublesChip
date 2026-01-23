import { z } from 'zod';
export declare const TournamentCreateSchema: z.ZodObject<{
    name: z.ZodString;
    date: z.ZodString;
    startTime: z.ZodString;
    format: z.ZodEnum<["scotch_doubles", "singles", "team_event"]>;
    gameType: z.ZodEnum<["8_ball", "9_ball", "10_ball", "straight_pool"]>;
    raceToWins: z.ZodNumber;
    totalTables: z.ZodNumber;
    rules: z.ZodString;
    estimatedDuration: z.ZodNumber;
    venueName: z.ZodOptional<z.ZodString>;
    venueAddress: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    startingChips: z.ZodNumber;
    chipDistributionMethod: z.ZodEnum<["equal_distribution", "skill_based", "random_distribution"]>;
    autopilotMode: z.ZodBoolean;
    winnerStays: z.ZodBoolean;
    preventRepeats: z.ZodBoolean;
    entryFee: z.ZodNumber;
    adminFee: z.ZodNumber;
    addedMoney: z.ZodNumber;
    payoutStructure: z.ZodArray<z.ZodObject<{
        place: z.ZodNumber;
        percentage: z.ZodNumber;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        place: number;
        percentage: number;
        amount: number;
    }, {
        place: number;
        percentage: number;
        amount: number;
    }>, "many">;
    accessType: z.ZodEnum<["public", "private", "invitation_only"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    date: string;
    startTime: string;
    format: "scotch_doubles" | "singles" | "team_event";
    gameType: "8_ball" | "9_ball" | "10_ball" | "straight_pool";
    raceToWins: number;
    totalTables: number;
    rules: string;
    estimatedDuration: number;
    startingChips: number;
    chipDistributionMethod: "equal_distribution" | "skill_based" | "random_distribution";
    autopilotMode: boolean;
    winnerStays: boolean;
    preventRepeats: boolean;
    entryFee: number;
    adminFee: number;
    addedMoney: number;
    payoutStructure: {
        place: number;
        percentage: number;
        amount: number;
    }[];
    accessType: "public" | "private" | "invitation_only";
    venueName?: string | undefined;
    venueAddress?: string | undefined;
    description?: string | undefined;
}, {
    name: string;
    date: string;
    startTime: string;
    format: "scotch_doubles" | "singles" | "team_event";
    gameType: "8_ball" | "9_ball" | "10_ball" | "straight_pool";
    raceToWins: number;
    totalTables: number;
    rules: string;
    estimatedDuration: number;
    startingChips: number;
    chipDistributionMethod: "equal_distribution" | "skill_based" | "random_distribution";
    autopilotMode: boolean;
    winnerStays: boolean;
    preventRepeats: boolean;
    entryFee: number;
    adminFee: number;
    addedMoney: number;
    payoutStructure: {
        place: number;
        percentage: number;
        amount: number;
    }[];
    accessType: "public" | "private" | "invitation_only";
    venueName?: string | undefined;
    venueAddress?: string | undefined;
    description?: string | undefined;
}>;
export declare const PlayerCreateSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    skillRating: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    skillRating?: number | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    skillRating?: number | undefined;
}>;
export declare const TeamCreateSchema: z.ZodObject<{
    tournamentId: z.ZodString;
    player1Id: z.ZodString;
    player2Id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tournamentId: string;
    player1Id: string;
    player2Id: string;
    name?: string | undefined;
}, {
    tournamentId: string;
    player1Id: string;
    player2Id: string;
    name?: string | undefined;
}>;
export declare const MatchCreateSchema: z.ZodObject<{
    tournamentId: z.ZodString;
    team1Id: z.ZodString;
    team2Id: z.ZodString;
    tableNumber: z.ZodNumber;
    chipsBet: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    tournamentId: string;
    team1Id: string;
    team2Id: string;
    tableNumber: number;
    chipsBet: number;
}, {
    tournamentId: string;
    team1Id: string;
    team2Id: string;
    tableNumber: number;
    chipsBet: number;
}>;
export declare class ApiClient {
    private baseUrl;
    constructor(baseUrl?: string);
    private request;
    createTournament(data: z.infer<typeof TournamentCreateSchema>): Promise<unknown>;
    getTournaments(): Promise<unknown>;
    getTournament(id: string): Promise<unknown>;
    updateTournament(id: string, data: Partial<z.infer<typeof TournamentCreateSchema>>): Promise<unknown>;
    deleteTournament(id: string): Promise<unknown>;
    createPlayer(data: z.infer<typeof PlayerCreateSchema>): Promise<unknown>;
    getPlayers(): Promise<unknown>;
    getPlayer(id: string): Promise<unknown>;
    createTeam(data: z.infer<typeof TeamCreateSchema>): Promise<unknown>;
    getTournamentTeams(tournamentId: string): Promise<unknown>;
    createMatch(data: z.infer<typeof MatchCreateSchema>): Promise<unknown>;
    getTournamentMatches(tournamentId: string): Promise<unknown>;
    updateMatch(id: string, data: {
        winnerId?: string;
        status?: string;
    }): Promise<unknown>;
}
export declare const apiClient: ApiClient;
