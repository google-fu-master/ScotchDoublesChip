const Player = require('../models/Player');
const Team = require('../models/Team');
const Match = require('../models/Match');
const Table = require('../models/Table');

class TournamentController {
    constructor() {
        this.players = [];     // Array of Player
        this.teams = [];       // Array of Team
        this.matches = [];     // Array of Match
        this.tables = [];      // Array of Table
        this.nextId = 1;       // Simple ID generator
    }

    createPlayer(name) {
        const player = new Player(this.nextId++, name);
        this.players.push(player);
        return player;
    }

    createTeam(player1, player2) {
        const team = new Team(this.nextId++, player1, player2);
        this.teams.push(team);
        return team;
    }

    addTable(number) {
        const table = new Table(number);
        this.tables.push(table);
        return table;
    }

    createMatch(teamA, teamB, tableNumber) {
        const match = new Match(this.nextId++, teamA, teamB, tableNumber);
        const table = this.tables.find(t => t.number === tableNumber);
        if (table) {
            table.currentMatch = match;
            table.isAvailable = false;
        }
        this.matches.push(match);
        return match;
    }

    completeMatch(matchId, winningTeamId) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match || match.status === 'complete') return;

        match.status = 'complete';
        match.winner = winningTeamId;
        match.endTime = new Date();

        const losingTeam = match.teamA.id === winningTeamId ? match.teamB : match.teamA;
        losingTeam.chips--;

        if (losingTeam.chips <= 0) {
            losingTeam.eliminated = true;
        }

        // Free the table
        const table = this.tables.find(t => t.number === match.tableNumber);
        if (table) {
            table.currentMatch = null;
            table.isAvailable = true;
        }
    }
}

module.exports = new TournamentController();
