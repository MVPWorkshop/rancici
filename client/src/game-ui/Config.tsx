import Phaser from "phaser";
import GameUI from "./GameUI";

export const SCENE_W = 800;
export const SCENE_H = 600;

//start drawing grid relative to the scene [ 00 == GRID(x=0, y=0) ]
export const GRID_00_X = 100;
export const GRID_00_Y = 100;

export const GRID_X_LEN = 500;
export const GRID_Y_LEN = 500;

export const GRID_W = 7;
export const GRID_H = 7;

export const GRID_W_LEN = 60;
export const GRID_H_LEN = 60;

export const GRID_CELL_PADDING = 2;

const config = {
  width: SCENE_W,
  height: SCENE_H,
  type: Phaser.AUTO,
  parent: "game-ui-root",
  scene: GameUI,
};

export default config;
