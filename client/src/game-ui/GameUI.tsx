import Phaser from "phaser";
import {
  GRID_W,
  GRID_H,
  GRID_00_X,
  GRID_00_Y,
  GRID_CELL_PADDING,
  GRID_X_LEN,
  GRID_Y_LEN,
  GRID_H_LEN,
  GRID_W_LEN,
} from "./Config";

/**
 * grid is 7x7
 * shapes are different Z, L, ...,  have orientations - 4 directions, and one of 5 possible colors
 * if they overlap with the grid cells, and all cells are empty, then the shape can be placed
 * in the grid there are 5 character cells - these cells are not empty, and nothing can be placed over them
 * once a shape is placed, all cells that it occupies become filled, and nothing can be placed over them
 *
 * mouse can select a shape, and once selected it follows the mouse in its color with transparency
 * grid cells change color once the mouse, with its shape, is placed over them (over 50% overlap)
 * if there's a conflict, a special color is used to indicate to the gamer, that that action is not allowed
 * once, a valid action is taken, grid cells, that are involved change color to be the same as the shape
 *
 * using some special button (i.e. ctrl+r), a shape is rotated
 */

type CellPos = Array<number>;

class Shape {
  cells: Array<CellPos> = [];
  color: number = 0x0;

  constructor(name: string) {
    if (name === "L") {
      this.cells = [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 2],
      ];
      this.color = 0x1101ff;
    }
  }
}

class GameUI extends Phaser.Scene {
  create() {
    const graphics = this.add.graphics({
      fillStyle: { color: 0x0000ff },
      lineStyle: { color: 0x0000aa },
    });

    const pointerGraphics = this.add.graphics({
      fillStyle: { color: 0xff00ff },
      lineStyle: { color: 0x0ff0aa },
    });

    const rectangles = [];
    const maskRectangle = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];

    const pointerCells = [
      new Phaser.Geom.Rectangle(0, 0, GRID_W_LEN, GRID_H_LEN),
      new Phaser.Geom.Rectangle(GRID_W_LEN, GRID_H_LEN, GRID_W_LEN, GRID_H_LEN),
    ];

    for (let xIdx = 0; xIdx < GRID_W; xIdx++) {
      rectangles[xIdx] = [];
      for (let yIdx = 0; yIdx < GRID_H; yIdx++) {
        const [x, y, w, h] = calculateCell_Dim(xIdx, yIdx);
        rectangles[xIdx][yIdx] = new Phaser.Geom.Rectangle(x, y, w, h);
      }
    }

    this.input.on("pointerdown", (pointer) => {
      const xIdx = Math.floor(pointer.x / 80);
      const yIdx = Math.floor(pointer.y / 60);

      rectangles[xIdx][yIdx].setEmpty();

      redraw(pointer);
    });

    const inPointerPaddedArea = (pointer, rect) => {
      const X_PAD = 100;
      const Y_PAD = 100;

      return (
        pointer.x - X_PAD < rect.x &&
        rect.x < pointer.x + X_PAD &&
        pointer.y - Y_PAD < rect.y &&
        rect.y < pointer.y + Y_PAD
      );
    };

    const overlapPercent = (rect0, rect1) => {
      rect0.w = rect0.width;
      rect0.h = rect0.height;
      rect1.w = rect1.width;
      rect1.h = rect1.height;

      const rect0Points = [
        [rect0.x, rect0.y],
        [rect0.x + rect0.w, rect0.y],
        [rect0.x, rect0.y + rect0.h],
        [rect0.x + rect0.w, rect0.y + rect0.h],
      ];

      for (let pIdx = 0; pIdx < rect0Points.length; ++pIdx) {
        const point = rect0Points[pIdx];
        if (
          rect1.x < point[0] &&
          point[0] < rect1.x + rect1.w &&
          rect1.y < point[1] &&
          point[1] < rect1.y + rect1.h
        ) {
          const scalingFactor = 100.0 / (rect1.w * rect1.h);
          let base = 0;

          if (pIdx == 0) {
            base =
              (rect1.x + rect1.w - point[0]) * (rect1.y + rect1.h - point[1]);
          }

          if (pIdx == 1) {
            base = (point[0] - rect1.x) * (rect1.y + rect1.h - point[1]);
          }

          if (pIdx == 2) {
            base = (rect1.x + rect1.w - point[0]) * (point[1] - rect1.y);
          }

          if (pIdx == 3) {
            base = (point[0] - rect1.x) * (point[1] - rect1.y);
          }

          return base * scalingFactor;
        }
      }
      return 0.0;
    };

    this.input.on("pointermove", (pointer) => {
      const cellPoints = [
        { x: -GRID_W_LEN, y: -GRID_H_LEN },
        { x: 0, y: 0 },
      ];
      for (let cellIdx = 0; cellIdx < pointerCells.length; cellIdx++) {
        pointerCells[cellIdx].setPosition(
          pointer.x + cellPoints[cellIdx].x,
          pointer.y + cellPoints[cellIdx].y
        );
      }

      console.log({ pointerCells });

      for (let xIdx = 0; xIdx < GRID_W; xIdx++) {
        for (let yIdx = 0; yIdx < GRID_H; yIdx++) {
          if (inPointerPaddedArea(pointer, rectangles[xIdx][yIdx]) == false)
            continue;
          for (let cellIdx = 0; cellIdx < pointerCells.length; cellIdx++) {
            const overlapPrc = overlapPercent(
              pointerCells[cellIdx],
              rectangles[xIdx][yIdx]
            );

            maskRectangle[xIdx][yIdx] = overlapPrc > 40.0 ? 1.0 : 0.0;
            if (maskRectangle[xIdx][yIdx] == 1.0) break;
          }
        }
      }

      redraw(pointer);
    });

    redraw(this.input.activePointer);

    function redraw(pointer) {
      graphics.clear();
      pointerGraphics.clear();

      for (let xIdx = 0; xIdx < GRID_W; xIdx++) {
        for (let yIdx = 0; yIdx < GRID_H; yIdx++) {
          if (maskRectangle[xIdx][yIdx] == 0.0) {
            graphics.fillRectShape(rectangles[xIdx][yIdx]);
            graphics.strokeRectShape(rectangles[xIdx][yIdx]);
          }
        }
      }

      for (let cellIdx = 0; cellIdx < pointerCells.length; cellIdx++) {
        pointerGraphics.fillRectShape(pointerCells[cellIdx]);
        pointerGraphics.strokeRectShape(pointerCells[cellIdx]);
      }
    }
  }
}

const calculateCell_Dim = (xIdx, yIdx) => {
  const w = GRID_X_LEN / GRID_W - 2 * GRID_CELL_PADDING;
  const h = GRID_Y_LEN / GRID_H - 2 * GRID_CELL_PADDING;
  const x = GRID_00_X + xIdx * (GRID_X_LEN / GRID_W) + GRID_CELL_PADDING;
  const y = GRID_00_Y + yIdx * (GRID_Y_LEN / GRID_H) + GRID_CELL_PADDING;

  return [x, y, w, h];
};

export default GameUI;
