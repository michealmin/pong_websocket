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

    showStausText(text) {

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
            console.log(this_scene);
            this_scene.load.bitmapFont('hyperdrive', 'assets/fonts/bitmap/hyperdrive.png', 'assets/fonts/bitmap/hyperdrive.xml');
        }
    }

    get create() {
        var self = this;
        return function() {
            var this_scene = this;
            console.log('ui create');
            var text = this_scene.add.text(100, 300, "!", {
                fill: 'rgba(0,255,0,1)',
                fontSize: 40,
                fixedWidth: 400,
                fixedHeight: 100
            });

            text.setAlign('center');
            text.setWordWrapWidth('400', false);
            text.setText('setText');
            this.center_text = text;

            // self._start_button = new Button(this_scene, 'Start', 'StartText', 200, 200, function() {
            //     self._on_start_clicked();
            // });
        }
    }

    setCenterText(text) {
        this.center_text.setText(text);
    }
};

export { UIScene };