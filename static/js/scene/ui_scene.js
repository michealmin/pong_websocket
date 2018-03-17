"use strict";

import { Button } from "./button.js";

class UIScene {
    constructor() {
        this._on_start_clicked = function() {

        }
    }

    set on_start_clicked(func) {
        this._on_start_clicked = func;
    }

    get key() {
        return 'ui';
    }

    getSceneConfig() {
        return {
            key: this.key,
            // preload: this.preload,
            create: this.create
        }
    }

    get preload() {
        var self = this;
        return function() {
            var this_scene = this;
            console.log('ui preload');

            this_scene.load.setBaseURL('http://localhost:5000/static/');
            this_scene.load.spritesheet('button', 'assets/ui/flixel-button.png', {
                frameWidth: 80,
                frameHeight: 20
            });
            this_scene.load.bitmapFont('hyperdrive', 'assets/fonts/bitmap/hyperdrive.png', 'assets/fonts/bitmap/hyperdrive.xml');
        }
    }

    get create() {
        var self = this;
        return function() {
            var this_scene = this;
            console.log('ui create');
            this_scene.add.text(100, 300, "hello world other scene!!");
            // self._start_button = new Button(this_scene, 'Start', 'StartText', 200, 200, function() {
            //     self._on_start_clicked();
            // });
        }
    }
};

export { UIScene };