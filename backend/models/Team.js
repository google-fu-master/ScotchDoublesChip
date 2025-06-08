class Team {
    constructor(id, player1, player2, chips = 3) {
        this.id = id;
        this.players = [player1, player2];
        this.chips = chips;
        this.eliminated = false;
    }
}

module.exports = Team;
