class Match {
    constructor(id, teamA, teamB, tableNumber) {
        this.id = id;
        this.teamA = teamA;
        this.teamB = teamB;
        this.tableNumber = tableNumber;
        this.winner = null;
        this.status = 'pending'; // pending, in_progress, complete
        this.startTime = null;
        this.endTime = null;
    }
}

module.exports = Match;
