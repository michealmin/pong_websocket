"use strict";

import { GameCommon } from "./game_common.js";
import { GameModel } from "./game_model.js";
import { GameView } from "./game_view.js";
import { WaitingForGameLogic, InGameLogic } from "./game_logic.js";

var game_model = new GameModel();

class Player {
    constructor(position, name) {
        this.name = name;
        this.position = position;
    }
}

class GameMain {
    constructor(url_base) {
        this._url_base = url_base;
        this._ws = null;
        clear();
    }

    clear() {
        this._game_logic = null;
        this._on_entered_room = null;
        this._players = new Map();
    }

    setPlayer(position, name) {
        this._players[position] = new Player(position, name);
    }

    initConnection(url) {
        if (null !== this._ws) {
            this._ws.close();
        }

        this._ws = new WebSocket(url);
        this._msg_queue = Array();

        var self = this;
        this._ws.onopen = function() {
            self.onSocketOpen();
        }

        this._ws.onmessage = function(evt) {
            console.log('receved ' + evt);
            console.log(evt.data);
            try {
                self.onSocketMessage(JSON.parse(evt.data));
            } catch (e) {
                console.error(e);
            }

        }

        this._ws.onclose = function() {
            self.onSocketClose();
        }

        this._ws.onerror = function(evt) {
            self.onSocketError(evt);
        }
    }

    onSocketOpen() {
        var socket = this._ws;
        this._msg_queue.forEach(function(elem) {
            socket.send(elem);
        });
        this._msg_queue = Array();
    }

    onEnteredRoom() {
        this._on_entered_room();
    }

    onSocketMessage(msg) {
        console.log("Message Recved" + msg);
        this._game_logic.handleMessage(msg);
    }

    onSocketClose() {

    }

    onSeocketError(evt) {

    }

    sendMessage(message) {
        var sock_state = this._ws.readyState;
        if (0 == sock_state) {
            this._msg_queue.push(message);
        } else {
            this._ws.send(message);
        }
    }

    changeGameLogic(new_state) {
        if ("InGame" == new_state) {
            this._game_logic = new InGameLogic(this, this._game_view);
        } else if ("WaitingForGame" == new_state) {
            this._game_logic = new WaitingForGameLogic(this, this._game_view)
        } else {
            throw ("Invalid game state " + new_state);
        }
    }

    enterRoom(room_no, token, player_name, on_entered_room) {
        var data = {
            type: 'EnterRoom',
            room_no: room_no,
            token: token,
            name: player_name
        }
        this._on_entered_room = on_entered_room;
        this.sendMessage(JSON.stringify(data));
    }

    isScenesActive() {
        return this._game_view.isActive();
    }

    createGame() {
        this.clear();
        var game_view = new GameView(this._url_base);
        var game_screen = $('div.game-screen')[0];
        game_view.init(game_screen);
        this._game_view = game_view;

        this.changeGameLogic("WaitingForGame");
    }
}

export { GameMain };