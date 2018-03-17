"use strict";

import { GameCommon } from './game_common.js';

class Player {
    constructor(name, position) {
        this.name = name;
        this.position = position;
    }
}

class GameModel {

    constructor() {
        this.players = Array(2);
    }

    isValidPosition(position) {
        return (0 <= position && position <= 1);
    }

    getPlayers() {
        return this.players;
    }

    getPlayer(position) {
        if (!this.isValidPosition(position)) {
            throw new Error("Invalid position " + position);
        }
        return this.getPlayers()[position];
    }

    setPlayer(name, position) {
        if (!this.isValidPosition(position)) {
            throw new Error("Invalid position " + position);
        }
        this.players[position] = new Player(name, position);
    }

    removePlayer(position) {
        if (!this.isValidPosition(position)) {
            throw new Error("Invalid position " + position);
        }
        this.players[position] = null;

    }

}

export { Player, GameModel };

/*var game_model = (function() {

    function isValidPosition(position) {
        return (0 <= position && position <= 1);
    }

    function Player(name, position) {

        var _this = this;
        this.name = name;
        this.position = position;
    }

    var players = Array(2);

    function getPlayers() {
        return players;
    }

    function getPlayer(position) {
        if (!isValidPosition(position)) {
            game_common.handle_error("Invalid position " + position);
        }
        return getPlayers()[position];
    }

    function setPlayer(name, position) {
        if (!isValidPosition(position)) {
            game_common.handle_error("Invalid position " + position);
        }
        players[positions] = new Player(name, position);
    }

    function removePlayer(position) {
        if (!isValidPosition(position)) {
            game_common.handle_error("Invalid position " + position);
        }
        players[position] = null;

    }

    return {
        getPlayers: getPlayers,
        getPlayer: getPlayer,
        setPlayer: setPlayer,
        removePlayer: removePlayer
    }
})();*/