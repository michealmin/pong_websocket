"use strict";

import { GameConfig } from "../game_config.js";
import { Button } from "./button.js";


class GameScene {
    constructor() {
        this._player_blocks = Array(2);
        this.ball = null;
        this.edges = Object();
        this._my_position = -1; //invalid

        //callbacks
        this._on_edge_overlapped = function(player_position) {
            console.log('overlapped ' + player_position);
        }

        this._on_start_clicked = function() {}
    }

    get config() {
        return GameConfig
    }

    set on_edge_overlapped(func) {
        this._on_edge_overlapped = func;
    }

    set on_start_clicked(func) {
        this._on_start_clicked = func;
    }

    set my_position(pos) {
        this._my_position = pos;
    }

    get start_button() {
        return this._start_button;
    }

    get key() {
        return 'game';
    }

    getSceneConfig() {
        return {
            key: this.key,
            preload: this.preload,
            create: this.create,
            update: this.update
        }
    }

    get preload() {
        var self = this;
        return function() {
            var this_scene = this;
            //ToDo. windows location 같은걸 써서 바꿀 것
            this_scene.load.setBaseURL('http://localhost:5000/static/');

            this_scene.load.spritesheet('button', 'assets/ui/flixel-button.png', {
                frameWidth: 80,
                frameHeight: 20
            });
            this_scene.load.bitmapFont('hyperdrive', 'assets/fonts/bitmap/hyperdrive.png', 'assets/fonts/bitmap/hyperdrive.xml');

            this_scene.load.image('sky', 'assets/skies/sky.png');
            this_scene.load.image('ball', 'assets/sprites/aqua_ball.png');
            this_scene.load.image('red', 'assets/particles/red.png');
            this_scene.load.image('block', 'assets/sprites/50x50-white.png');
        }
    }

    get create() {
        var self = this;
        return function() {
            var this_scene = this;
            console.log(this_scene);
            // Create world
            this_scene.add.image(400, 300, 'sky');

            this_scene.physics.world.createDebugGraphic();
            this_scene.physics.world.drawDebug = true;

            self.createBall(this_scene);
            self.createPlayerBlocks(this_scene);
            self.createEdges(this_scene);

            self.initCollider(this_scene);
            self.initOverlap(this_scene);

            self.cursors = this_scene.input.keyboard.createCursorKeys();



            //Ui Scene 으로 옯길 것들
            // var score = [0, 0];
            // objects.scoreboard.push(this_scene.add.text(10, 10, score[0].toString()));
            // objects.scoreboard.push(this_scene.add.text(10, 590, score[1].toString()));

            // var input_for_gameobject_handlers = {};

            // function registerInputForGameObject(go, handlers) {
            //     input_for_gameobject_handlers[go.key] = handlers;
            // }
            var screen_size = self.config.screen_size;
            var x = (screen_size.width / 2);
            var y = (screen_size.height / 2);
            console.log(x);
            console.log(y);
            self._start_button = new Button(this_scene, 'Start', 'StartText', 300, y, function() {
                self._on_start_clicked();
            });
            self.resetRound();
        }
    }

    get update() {
        var self = this;
        return function() {
            var this_scene = this;
            var player_block = self._player_blocks[self._my_position];
            if (player_block) {
                if (self.cursors.left.isDown) {
                    player_block.setVelocityX(-160);

                } else if (self.cursors.right.isDown) {
                    player_block.setVelocityX(160);

                } else {
                    player_block.setVelocityX(0);

                }
            }
        }
    }

    resetGame() {
        this.resetRound();
        this.ball.setMaxVelocity(100, 800);
    }

    resetRound() {
        var screen_size = this.config.screen_size;
        this.ball.setVelocity(0, 0);
        this.ball.setBounce(0.5, 1.05);
        this.ball.setPosition(screen_size.width / 2, screen_size.height / 2);
        this.ball.setVisible(false);
        this.ball_emitter.setVisible(false);
    }

    startRound() {
        this.resetRound();
        // round_finished = false;
        this.ball.setVelocity(200, 200);
        this.ball.setVisible(true);
        this.ball_emitter.setVisible(true);
    }

    createBall(this_scene) {
        var screen_size = this.config.screen_size;

        var particles = this_scene.add.particles('red');

        var emitter = particles.createEmitter({
            speed: 100,
            scale: {
                start: 1,
                end: 0
            },
            blendMode: 'ADD'
        });

        var ball = this_scene.physics.add.image(
            screen_size.width / 2, screen_size.height / 2, 'ball');

        ball.body.enable = true;
        emitter.startFollow(ball);

        this.ball = ball;
        this.ball_emitter = emitter;
    }

    createPlayerBlocks(this_scene) {
        var block_pos_and_size = this.config.player_block_pos_size;
        for (var i = 0; i < block_pos_and_size.length; ++i) {
            var pos_and_size = block_pos_and_size[i];
            var block = this_scene.physics.add.sprite(
                pos_and_size.x, pos_and_size.y, 'block');
            block.body.enable = true;
            block.body.bounce.y = 1.5;
            block.body.immovable = true;
            block.setOrigin(0, 0);
            block.setDisplaySize(pos_and_size.width, pos_and_size.height);

            block.setDebug(true, true, true);
            this._player_blocks[i] = block;
        }
    }

    createEdges(this_scene) {
        //add bounds
        //ToDo: 아래는 지형으로 바꿀 것
        var edges_pos_and_size = this.config.edge_pos_size;

        function createEdge(pos_and_size) {
            var edge = this_scene.physics.add.sprite(pos_and_size.x, pos_and_size.y, 'sky');
            edge.body.enable = true;
            edge.body.immovable = true;
            edge.setOrigin(0, 0);
            edge.setDisplaySize(pos_and_size.width, pos_and_size.height);
            return edge;
        }
        this.edges.left = createEdge(edges_pos_and_size.left);
        this.edges.right = createEdge(edges_pos_and_size.right);
        this.edges.top = createEdge(edges_pos_and_size.top);
        this.edges.bottom = createEdge(edges_pos_and_size.bottom);
    }

    initCollider(this_scene) {
        var ball = this.ball;
        this._player_blocks.forEach(function(block) {
            this_scene.physics.add.collider(ball, block);
        });
        this_scene.physics.add.collider(ball, this.edges.left);
        this_scene.physics.add.collider(ball, this.edges.right);
    }

    initOverlap(this_scene) {
        var self = this;
        this_scene.physics.add.overlap(this.ball, this.edges.top, function() {
            // player positon 은 아랫쪽이 0
            self._on_edge_overlapped(1);


        });
        this_scene.physics.add.overlap(this.ball, this.edges.bottom, function() {
            // player positon 은 아랫쪽이 0
            self._on_edge_overlapped(0);
        });
    }
};

export { GameScene };