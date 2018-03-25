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

    checkAndShowStartBtn() {
        console.log('checkStartBtn');
        console.log(this._game_main.my_position);
        console.log
        if (2 <= this._game_main.players.size &&
            0 == this._game_main.my_position) {

            this._game_view.game_scene.start_button.setVisible(true);
        }
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
            this._game_main.setPlayer(elem.position, elem.name, false);
            game_scene.setPlayerName(elem.position, elem.name);
            game_scene.showPlayer(elem.position, true);
        });
        checkAndShowStartBtn();
    }

    _onEnteredRoomNtf(msg) {
        console.log('WaitingGame onenteredroomntf');
        var game_scene = this._game_view.game_scene;

        this._game_main.setPlayer(msg.position, msg.name, false);
        game_scene.setPlayerName(msg.position, msg.name);
        game_scene.showPlayer(msg.position, true);

        this.checkAndShowStartBtn();

    }

};

class GameState {
    constructor() {
        this._round = 0;
        this._scores = [0, 0];
    }

    clear() {
        this._round = 0;
        this.resetScores();
    }

    get scores() {
        return this._scores
    }

    set scores(val) {
        this._scores = val;
    }

    resetScores() {
        this._scores = [0, 0];
    }

    setScores(score) {
        this._scores = score;
    }
}

class InGameLogic extends GameMsgHandler {
    constructor(game_main, game_view) {
        super(game_main);
        this._state = "InGame";
        this.config = GameConfig;
        this._game_view = game_view;
        this._game_scene = game_view.game_scene;
        this._ui_scene = game_view.ui_scene;
        this._game_state = new GameState();
        this._in_round = false;

        var self = this;
        this._game_scene.on_edge_overlapped = (loser_pos) => {

            if (this._in_round && loser_pos == this._game_main.my_position) {
                this._game_main.sendMessage({
                    type: 'RoundEnd',
                    loser_pos: loser_pos
                })
            }
            this._in_round = false;
        }

        this._last_my_block_pos_x = -100;
        this._registerMsgHandler("BlockPosNtf", (msg) => {
            this._onBlockPosNtf(msg);
        });

        this._registerMsgHandler("BallBlockCollideNtf", (msg) => {
            this._onBallBlockCollideNtf(msg);
        });

        this._registerMsgHandler("RoundEndNtf", (msg) => {
            this._onRoundEndNtf(msg);
        });
    }

    isValidPosition(position) {
        return (0 <= position && position <= 1);
    }

    startGame() {
        this.resetGame();
        this.onGameStarted();
        this._ui_scene.showStatusText(false);
        this._game_scene.setScores(this._game_state.scores);

        this._in_round = true;
        this._game_scene.startRound();

        this._game_scene.on_block_pos_sync_timer = (x) => {
            if (1 < Math.abs(this._last_my_block_pos_x - x)) {
                this._game_main.sendMessage({
                    type: 'SyncBlockPos',
                    x: x
                });
                this._last_my_block_pos_x = x;
            };
        }

        this._game_scene.on_my_block_and_ball_collide =
            (ball_x, ball_y, block_x) => {
                this._game_main.sendMessage({
                    type: 'SyncBallBlockCollide',
                    ball_pos: [ball_x, ball_y],
                    block_x: block_x
                })
            };
    }

    onGameStarted() {

        this._game_scene.start_button.setVisible(false);
    }

    startNextRound() {
        this._in_round = true;
        this._game_scene.startRound();


        // if (this.config.match_score <= Math.max(...this._game_state.score)) {
        //     console.log('Game end');
        //     this.processEndGame();
        // } else {
        //     this.onRoundStarted();
        //     this._game_scene.startRound();
        // }
    }

    processEndGame() {
        //ToDo : 승자 표시, 혹은 결과 표시
        this._game_scene.on_block_pos_sync_timer = (x) => {};
        this._game_scene.on_my_block_and_ball_collide = () => {};
        this._game_scene.resetGame();
    }

    resetGame() {
        this._game_state.resetScores();
    }

    //message handlers
    _onBlockPosNtf(msg) {
        this._game_scene.setPlayerBlockPos(msg.position, msg.x);
    }

    _onBallBlockCollideNtf(msg) {
        this._game_scene.setPlayerBlockPos(msg.position, msg.block_x);
        this._game_scene.setBallPos(msg.ball_pos[0], msg.ball_pos[1]);
    }

    _onRoundEndNtf(msg) {
        var is_game_end = msg.winner !== undefined && msg.winner !== null;

        this._game_state.setScores(msg.score_info);
        this._game_scene.setScores(this._game_state.scores);

        if (is_game_end) {
            this.processEndGame();
            var result_text = this._game_main.players.get(msg.winner).name + " Wins!";
            console.log(result_text);
            this._ui_scene.setStausText(result_text);
            this._ui_scene.showStatusText(true);
            this._game_main.endGame();
        } else {
            this.startNextRound(msg.score_info);
        }
    }
};

export { WaitingForGameLogic, InGameLogic };