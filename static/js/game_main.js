"use strict";

import { GameCommon } from "./game_common.js";
import { GameModel } from "./game_model.js";
import { GameView } from "./game_view.js";
import { GameLogic } from "./game_logic.js";

var game_model = new GameModel();


function game_main() {
    var game_view = new GameView();

    var game_screen = $('div.game-screen')[0];
    game_view.initPhaser(game_screen);

    var game_logic = new GameLogic(game_view);
    game_view.game_scene.my_position = 0;
}



export { game_main };