"use strict";

import { GameCommon } from "./game_common.js";
import { GameModel } from "./game_model.js";

var game_model = new GameModel();

function game_main() {
    var game_screen_canvas = $('div.game-screen')[0];
    var config = {
        type: Phaser.CANVAS,
        parent: game_screen_canvas,
        width: 600,
        height: 600,
        debugShowBody: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 0
                },
                debugShowBody: true
            }
        },
        debug: true,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config);
    var cursors = null;
    var player = null;


    function preload() {
        //this.load.setBaseURL('http://labs.phaser.io');
        // this.load.image('sky', 'assets/skies/space3.png');
        // this.load.image('logo', 'assets/sprites/phaser3-logo.png');
        // this.load.image('red', 'assets/particles/red.png');
        // this.load.image('block', 'assets/sprites/50x50-white.png');
        this.load.setBaseURL('http://localhost:5000/static/');

        this.load.spritesheet('button', 'assets/ui/flixel-button.png', {
            frameWidth: 80,
            frameHeight: 20
        });
        this.load.bitmapFont('hyperdrive', 'assets/fonts/bitmap/hyperdrive.png', 'assets/fonts/bitmap/hyperdrive.xml');

        this.load.image('sky', 'assets/skies/sky.png');
        this.load.image('logo', 'assets/sprites/aqua_ball.png');
        this.load.image('red', 'assets/particles/red.png');
        this.load.image('block', 'assets/sprites/50x50-white.png');
    }

    var objects = {
        player_blocks: [],
        ball: null,
        scoreboard: []
    }

    var score = [0, 0];

    function resetGame() {
        objects.ball.setMaxVelocity(100, 800);
    }

    var start_button = null;
    var round_finished = false;

    function onRoundFinished() {
        round_finished = true;
        var matchScore = 2;
        if (matchScore <= score[0] ||
            matchScore <= score[1]) {
            console.log('Game Finished');
            start_button.setVisible(true);
        } else {
            startRound();
        }
    }

    function startRound() {
        resetRound();
        round_finished = false;
        objects.ball.setVelocity(200, 200);
    }

    function resetRound() {;

        objects.ball.setVelocity(0, 0);
        objects.ball.setBounce(0.5, 1.05);
        objects.ball.setPosition(400, 100);

    }

    function create() {
        this.add.image(400, 300, 'sky');

        var particles = this.add.particles('red');

        var emitter = particles.createEmitter({
            speed: 100,
            scale: {
                start: 1,
                end: 0
            },
            blendMode: 'ADD'
        });
        console.log(this);
        console.log(this.boot);
        this.focus = function(a, ...args) {
            console.log('focus');
            console.log(a);
            console.log(args);
        }

        this.physics.world.createDebugGraphic();
        this.physics.world.drawDebug = true;
        var logo = this.physics.add.image(400, 100, 'logo');

        // logo.setCollideWorldBounds(true);
        logo.body.enable = true;
        // logo.body.bounce.y = 1.5;
        emitter.startFollow(logo);


        var opponent = this.physics.add.sprite(100, 100, 'block');
        opponent.body.enable = true;
        opponent.body.bounce.y = 1.5;
        opponent.body.immovable = true;
        opponent.setDebug(true, true, true);
        // opponent.setScale(10, 1);
        // opponent.setSize ( 500, 100);
        opponent.setDisplaySize(10, 50);
        opponent.setOrigin(0, 0);
        this.physics.add.collider(logo, opponent);

        player = this.physics.add.sprite(400, 400, 'block');
        player.body.enable = true;
        player.body.bounce.y = 1.5;
        player.body.immovable = true;
        player.setOrigin(0, 0);
        player.setDisplaySize(100, 50);
        this.physics.add.collider(logo, player);

        objects.player_blocks.push(opponent);
        objects.player_blocks.push(player);
        objects.ball = logo;

        cursors = this.input.keyboard.createCursorKeys();


        //add bounds
        //ToDo: 아래는 지형으로 바꿀 것
        var left = this.physics.add.sprite(0, 0, 'sky');
        left.body.enable = true;
        left.body.immovable = true;
        left.setOrigin(0, 0);
        left.setDisplaySize(10, 600);

        var right = this.physics.add.sprite(590, 0, 'sky');
        right.body.enable = true;
        right.body.immovable = true;
        right.setOrigin(0, 0);
        right.setDisplaySize(10, 600);

        this.physics.add.collider(logo, left);
        this.physics.add.collider(logo, right);

        var top = this.physics.add.sprite(0, 0);
        //top.body.enable=true;
        //top.body.immovable = true;
        top.setOrigin(0, 0);
        top.setDisplaySize(600, 10);

        var bottom = this.physics.add.sprite(0, 590);
        //top.body.enable=true;
        //top.body.immovable = true;
        bottom.setOrigin(0, 0);
        bottom.setDisplaySize(600, 10);

        this.physics.add.overlap(logo, top, function() {
            if (round_finished)
                return;
            console.log('collide on top');
            ++score[1];
            console.log(score[1]);
            objects.scoreboard[1].setText(score[1].toString());
            onRoundFinished();

        });
        this.physics.add.overlap(logo, bottom, function() {
            if (round_finished)
                return;
            console.log('collide on bottom');
            ++score[0];
            console.log(score[0]);
            objects.scoreboard[0].setText(score[0].toString());
            onRoundFinished();
        });
        objects.scoreboard.push(this.add.text(10, 10, score[0].toString()));
        objects.scoreboard.push(this.add.text(10, 590, score[1].toString()));

        var input_for_gameobject_handlers = {};

        function registerInputForGameObject(go, handlers) {
            input_for_gameobject_handlers[go.key] = handlers;
        }

        start_button = makeButton(this, 'Start', 'StartText', 200, 200, startRound);



        // var blocks = this.physics.add.group(
        //     {
        //         key: 'block',
        //         repeat: 1,
        //         setXY: { x: 400, y: 100, stepX: 100, stepY: 500 }
        //     }
        // );

        // var ph = this.physics;
        // blocks.children.iterate(function (block) {
        //     block.setCollideWorldBounds(true);
        //     console.log(block);
        //     block.body.enable = true;
        //     block.body.bounce.y = 1.5;
        //     block.body.immovable = true;
        //     ph.add.collider(logo, block);
        // });

        resetGame();
    }

    function update() {

        if (cursors.left.isDown) {
            player.setVelocityX(-160);

        } else if (cursors.right.isDown) {
            player.setVelocityX(160);

        } else {
            player.setVelocityX(0);

        }

    }

    function setButtonFrame(button, frame) {
        button.frame = button.scene.textures.getFrame('button', frame);
    }

    function makeButton(scene, name, text, x, y, on_click_handler) {
        var button = scene.add.image(x, y, 'button', 1).setInteractive();
        button.name = name;
        button.setScale(4, 3);

        var text = scene.add.bitmapText(x - 40, y - 20, 'hyperdrive', text, 34);
        text.x += (button.width - text.width) / 2;

        var btn_group = scene.add.group();
        btn_group.add(button);
        btn_group.add(text);




        function setVisible(value) {
            btn_group.getChildren().forEach(function(elem) {
                elem.setVisible(value);
            });
        }

        scene.input.on('gameobjectover', function(pointer, btn) {
            if (btn.key == button.key)
                setButtonFrame(button, 0);

        });

        scene.input.on('gameobjectout', function(pointer, btn) {
            if (btn.key == button.key)
                setButtonFrame(button, 1);
        });
        scene.input.on('gameobjectdown', function(pointer, btn) {
            if (btn.key == button.key) {
                setButtonFrame(button, 2);
                setVisible(false);
                console.log('button deactivate');
                on_click_handler();
            }

        }, scene);
        scene.input.on('gameobjectup', function(pointer, btn) {
            if (btn.key == button.key)
                setButtonFrame(button, 0);
        });

        return {
            button: button,
            text: text,
            group: btn_group,
            setVisible: setVisible
        }
    }
}

export { game_main };