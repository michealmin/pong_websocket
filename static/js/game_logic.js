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
    }

    clear() {
        this._round = 0;
        this.resetScore();
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

    set score(val) {
        this._score = val;
    }

    resetScore() {
        this._score = [0, 0];
    }

    setScore(score) {
        this._score = score;
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

        var self = this;
        this._game_scene.on_edge_overlapped = (loser_pos) => {
            if (loser_pos == this._game_main.my_position) {
                this._game_main.sendMessage({
                    type: 'RoundEnd',
                    loser_pos: loser_pos
                })
            }

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
        this.onRoundStarted();
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

    onRoundStarted() {
        this._game_scene.start_button.setVisible(false);
    }

    startNextRound() {
        this.onRoundStarted();
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
        this._game_scene.start_button.setVisible(true);
    }

    resetGame() {
        this._game_state.resetScore();
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
        console.log('RoundEndNtf');
        console.log(msg);
        console.log(is_game_end);
        if (is_game_end) {
            //ToDo : 결과창 표시 
            this._game_main.endGame();
        } else {
            // ToDo 점수판 표시
            //round end. start next round
            console.log('Start Next round');
            console.log(msg.score_info);
            this._game_state.setScore(msg.score_info);

            this.startNextRound(msg.score_info);
        }
    }
};

export { WaitingForGameLogic, InGameLogic };