"use strict";

import { GameConfig } from "./game_config.js";

class GameState {
    constructor() {
        this._score = [0, 0];
    }

    get score() {
        return this._score
    }

    resetScore() {
        this._score = [0, 0];
    }

    addScore(player_position) {
        this._score[player_position] += 1;
    }
}

class GameLogic {
    constructor(game_view) {
        this.config = GameConfig;
        this._game_view = game_view;
        this._game_scene = game_view.game_scene;
        this._game_state = new GameState();
        this._in_round = false;

        var self = this;
        this._game_scene.on_edge_overlapped = function(loser_pos) {
            self.onRoundFinished(loser_pos);
        }

        this._game_scene.on_start_clicked = function() {
            self.resetGame();
            self.onRoundStarted();
            self._game_scene.startRound();
        }
    }

    isValidPosition(position) {
        return (0 <= position && position <= 1);
    }

    onRoundStarted() {
        this._in_round = true;
        this._game_scene.start_button.setVisible(false);
    }

    onRoundFinished(loser_pos) {
        if (!this._in_round) {
            return;
        }
        console.log(loser_pos + ' lose');

        this._in_round = false;

        if (!this.isValidPosition(loser_pos)) {
            throw new Error("Invalid player positoin " + player_pos);
        }
        console.log(this);
        this._game_state.addScore(1 == loser_pos ? 0 : 1);
        if (this.config.match_score <= Math.max(...this._game_state.score)) {
            console.log('Game end');
            this.processEndGame();
        } else {
            this.onRoundStarted();
            this._game_scene.startRound();
        }
    }

    processEndGame() {
        //ToDo : 승자 표시, 혹은 결과 표시
        this._game_scene.start_button.setVisible(true);
    }

    resetGame() {
        this._game_state.resetScore();
    }
};

export { GameLogic };