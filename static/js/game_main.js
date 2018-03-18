"use strict";

import { GameCommon } from "./game_common.js";
import { GameModel } from "./game_model.js";
import { GameView } from "./game_view.js";
import { GameLogic } from "./game_logic.js";

var game_model = new GameModel();

class GameMain {
    constructor(url_base) {
        this._url_base = url_base;
        this._ws = null;
        this._msg_queue = Array();
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
            self.onSocketMessage(evt)
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

    onSocketMessage(evt) {

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

    enterRoom(room_no, token, player_name) {
        var data = {
            type: 'EnterRoomReq',
            room_no: room_no,
            token: token,
            name: player_name
        }
        this.sendMessage(JSON.stringify(data));
    }

    createGame() {
        var game_view = new GameView(this._url_base);

        var game_screen = $('div.game-screen')[0];
        game_view.initPhaser(game_screen);

        var game_logic = new GameLogic(game_view);
        game_view.game_scene.my_position = 0;

        this._game_view = game_view;
        this._game_logic = game_logic;
    }
}

export { GameMain };