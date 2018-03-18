"use strict";

import { GameConfig } from "./game_config.js";
import { GameScene } from "./scene/game_scene.js";
import { UIScene } from "./scene/ui_scene.js";

class GameView {
    constructor() {
        this.config = GameConfig;
        this._game_scene = new GameScene();
        this._ui_scene = new UIScene();
        this._phaser_game = null;
    }

    get game_scene() {
        return this._game_scene;
    }

    get ui_scene() {
        return this._ui_scene;
    }

    get game() {
        return this._phaser_game;
    }

    getPhaserConfig(screen_parent) {
        var screen_size = this.config.screen_size;
        var scene_config = [this.game_scene.getSceneConfig(),
            this.ui_scene.getSceneConfig()
        ];
        console.log(scene_config);
        return {
            key: 'game',
            type: Phaser.AUTO,
            parent: screen_parent,
            width: screen_size.width,
            height: screen_size.height,
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
            scene: scene_config,
            callbacks: {
                postBoot: this.postBoot
            }
        };

    }

    get postBoot() {
        var self = this;
        return function() {
            self._phaser_game.scene.start(self.ui_scene.key);
        }
    }

    initPhaser(screen_canvas) {
        var game = new Phaser.Game(this.getPhaserConfig(screen_canvas));
        this._phaser_game = game;
        this._game_scene.my_position = 1;
    }
};


export { GameView };