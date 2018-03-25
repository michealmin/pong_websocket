"use strict";

import { GameConfig } from "./game_config.js";

class GameMsgHandler {
    constructor(game_main) {
        this._game_main = game_main;
        this._msg_handlers = new Map();
    }

    _registerMsgHandler(msg_type, handler) {
        var self = this;
        this._msg_handlers.set(msg_type, handler);
    }

    handleMessage(message) {
        var type = message.type;
        var handler = this._msg_handlers.get(type);
        if (undefined === handler) {
            throw ("InGameLogic: Unknow message type " + type);
        }
        console.log('Handle Message.. ' + type);
        handler(message);
    }
}

class WaitingForGameLogic extends GameMsgHandler {
    constructor(game_main, game_view) {
        super(game_main);
        this._state = "WaitingForGame";
        this.config = GameConfig;
        this._game_view = game_view;

        this._game_view._game_scene.on_start_clicked = () => { this.startGame(); }

        this._registerMsgHandler("EnteredRoom", (msg) => { this._onEnteredRoom(msg); });
        this._registerMsgHandler("EnteredRoomNtf", (msg) => { this._onEnteredRoomNtf(msg); });
        this._registerMsgHandler("StartGameNtf", (msg) => { this._onStartGameNtf(msg); });

    }

    startGame() {
        this._game_main.sendMessage({
            type: 'StartGame'
        });
    }

    _onStartGameNtf() {
        this._game_main.startGame();
    }

    _onEnteredRoom(msg) {
        console.log('WaitingGame onenteredroom');
        var my_position = msg.position;
        var other_player = msg.other_player;
        var game_scene = this._game_view.game_scene;

        this._game_main.setPlayer(msg.position, msg.name, true);
        game_scene.setPlayerName(msg.position, msg.name);
        game_scene.showPlayer(msg.position, true);

        other_player.forEach((elem) => {
            this._game_main.setPlayer(msg.position, msg.name, false);
            game_scene.setPlayerName(elem.position, elem.name);
            game_scene.showPlayer(elem.position, true);
        });


    }

    _onEnteredRoomNtf(msg) {
        console.log('WaitingGame onenteredroomntf');
        var game_scene = this._game_view.game_scene;

        this._game_main.setPlayer(msg.position, msg.name, false);
        game_scene.setPlayerName(msg.position, msg.name);
        game_scene.showPlayer(msg.position, true);

        this.checkAndStartGame();

    }

    //
    checkAndStartGame() {
        if (2 <= this._game_main.players.size &&
            0 == this._game_main.my_position) {

            this._game_view.game_scene.start_button.setVisible(true);
        }
    }

};

class GameState {
    constructor() {
        this._round = 0;
        this._score = [0, 0];
        this._cur_turn_pos = 0;
    }

    clear() {
        this._round = 0;
        this.resetScore();
        this._cur_turn_pos = 0;
    }

    get turn_pos() {
        return _cur_turn_pos;
    }

    set turn_pos(val) {
        this._cur_turn_pos = turn;
    }

    get round() {
        return this._round;
    }

    addRound() {
        ++this.round;
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

class InGameLogic extends GameMsgHandler {
    constructor(game_main, game_view) {
        super(game_main);
        this._state = "InGame";
        this.config = GameConfig;
        this._game_view = game_view;
        this._game_scene = game_view.game_scene;
        this._game_state = new GameState();
        this._in_round = false;

        var self = this;
        this._game_scene.on_edge_overlapped = function(loser_pos) {
            self.onRoundFinished(loser_pos);
        }

        this._last_my_block_pos_x = -100;
        this._registerMsgHandler("BlockPosNtf", (msg) => {
            this._onBlockPosNtf(msg);
        })
    }

    isValidPosition(position) {
        return (0 <= position && position <= 1);
    }

    startGame() {
        this.resetGame();
        this.onRoundStarted();
        this._game_scene.startRound();

        this._game_scene.on_block_pos_sync_timer = (x) => {
            console.log(1 < Math.abs(this._last_my_block_pos_x - x));
            if (1 < Math.abs(this._last_my_block_pos_x - x)) {
                console.log('blocksyncsend 2');
                this._game_main.sendMessage({
                    type: 'SyncBlockPos',
                    x: x
                });
                this._last_my_block_pos_x = x;
            };
        }
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
        this._game_scene.resetGame();
        this._game_scene.start_button.setVisible(true);
    }

    resetGame() {
        this._game_state.resetScore();
    }

    //message handlers
    _onBlockPosNtf(msg) {
        console.log('OnBlockPosNtf');
        console.log(msg);
        this._game_scene.setPlayerBlockPos(msg.position, msg.x);
    }
};

export { WaitingForGameLogic, InGameLogic };