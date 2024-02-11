import Phaser from "phaser";
import {
  GRID_W,
  GRID_H,
  GRID_00_X,
  GRID_00_Y,
  GRID_CELL_PADDING,
  GRID_X_LEN,
  GRID_Y_LEN,
  CELL_H_LEN,
  CELL_W_LEN,
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
  massCenterX: number = 0.0;
  massCenterY: number = 0.0;
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT" = "UP";
  graphics: null;

  constructor(name: string) {
    if (name === "L") {
      this.cells = [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 2],
      ];
      this.color = 0x1101ff;
      this.massCenterY = 1.5;
      this.massCenterX = 1.0;
      this.direction = "UP";
    }
  }

  setGraphics(_graphics) {
    this.graphics = _graphics;
  }
}

class GameUI extends Phaser.Scene {
  /**
   *
   * {
   *  grid: ...
   *  selectedShape:
   *
   * }
   */
  state = {};

  create() {
    const cursor = this.input.activePointer;
    const notTakenGraphics = this.add.graphics({
      fillStyle: { color: 0x202020 },
      // lineStyle: { color: 0x0000aa },
    });

    const mightBeTakenGraphics = this.add.graphics({
      fillStyle: { color: 0x505020 },
      // lineStyle: { color: 0x0000aa },
    });

    const errorCannotBeTakenGaphics = this.add.graphics({
      fillStyle: { color: 0x20ff20 },
      // lineStyle: { color: 0x0000aa },
    });

    const redGraphics = this.add.graphics({
      fillStyle: { color: 0xff0000 },
      // lineStyle: { color: 0x0000aa },
    });

    const allGraphics = [
      notTakenGraphics,
      mightBeTakenGraphics,
      errorCannotBeTakenGaphics,
      redGraphics,
    ];
    //init grid
    const grid = Array.from(Array(GRID_W).keys()).map((xIdx) =>
      Array.from(Array(GRID_W).keys()).map((yIdx) => {
        const [x, y, w, h] = calculateCell_Dim(xIdx, yIdx);
        return {
          rect: new Phaser.Geom.Rectangle(x, y, w, h),
          taken: false,
          graphics: notTakenGraphics,
        };
      })
    );

    const gridHandler = {
      grid,
      redraw: (pointerShapeHandler) => {
        for (let xIdx = 0; xIdx < GRID_W; xIdx++) {
          for (let yIdx = 0; yIdx < GRID_H; yIdx++) {
            const cell = grid[xIdx][yIdx];

            cell.graphics.fillRectShape(cell.rect);
          }
        }

        for (const ptrShapeOkGridCell of pointerShapeHandler.okGridCells) {
          mightBeTakenGraphics.fillRectShape(ptrShapeOkGridCell.rect);
        }

        for (const ptrShapeErrorGridCell of pointerShapeHandler.errorGridCells) {
          errorCannotBeTakenGaphics.fillRectShape(ptrShapeErrorGridCell.rect);
        }
      },
    };

    const ptrShape = new Shape("L");
    ptrShape.setGraphics(redGraphics);
    const pointerShapeHandler = {
      shape: ptrShape,
      getCell_0_Rect: () => {
        const cell = ptrShape.cells[0];
        const x = cursor.x - (ptrShape.massCenterX - cell[0]) * CELL_W_LEN;
        const y = cursor.y - (ptrShape.massCenterY - cell[1]) * CELL_H_LEN;

        return new Phaser.Geom.Rectangle(x, y, CELL_W_LEN, CELL_H_LEN);
      },
      redraw: () => {
        const ptr = this.input.activePointer;
        const shapeCellRectangles = [];
        for (let cellIdx = 0; cellIdx < ptrShape.cells.length; ++cellIdx) {
          const cell = ptrShape.cells[cellIdx];
          const x = ptr.x - (ptrShape.massCenterX - cell[0]) * CELL_W_LEN;
          const y = ptr.y - (ptrShape.massCenterY - cell[1]) * CELL_H_LEN;

          shapeCellRectangles.push(
            new Phaser.Geom.Rectangle(x, y, CELL_W_LEN, CELL_H_LEN)
          );

          ptrShape.graphics.fillRectShape(shapeCellRectangles[cellIdx]);
        }
        return shapeCellRectangles;
      },

      shapeCanBePlaced: false,
      okGridCells: [],
      errorGridCells: [],
    };

    this.state = { grid, pointerShapeHandler };

    this.input.on("pointermove", () => {
      const { canBePlaced, okGridCells, errorGridCells } = shapePlacementInfo(
        cursor,
        grid,
        pointerShapeHandler
      );

      pointerShapeHandler.shapeCanBePlaced = canBePlaced;
      pointerShapeHandler.okGridCells = okGridCells;
      pointerShapeHandler.errorGridCells = errorGridCells;

      redraw();
    });

    this.input.on("pointerdown", () => {
      redraw();
    });

    const redraw = () => {
      allGraphics.map((graphic) => graphic.clear());

      gridHandler.redraw(pointerShapeHandler);
      pointerShapeHandler.redraw();
    };

    redraw();
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
        base = (rect1.x + rect1.w - point[0]) * (rect1.y + rect1.h - point[1]);
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

const inPointerPaddedArea = (pointer, rect) => {
  const X_PAD = 300;
  const Y_PAD = 300;

  return (
    pointer.x - X_PAD < rect.x &&
    rect.x < pointer.x + X_PAD &&
    pointer.y - Y_PAD < rect.y &&
    rect.y < pointer.y + Y_PAD
  );
};

const shapePlacementInfo = (cursor, grid, pointerShapeHandler) => {
  // const affectedGridCells = []
  const okGridCells = [];
  const errorGridCells = [];

  const ptrShapeCell_0_rect = pointerShapeHandler.getCell_0_Rect();
  for (let xIdx = 0; xIdx < GRID_W; xIdx++) {
    for (let yIdx = 0; yIdx < GRID_H; yIdx++) {
      const cell = grid[xIdx][yIdx];

      if (
        inPointerPaddedArea(cursor, cell.rect) &&
        overlapPercent(ptrShapeCell_0_rect, cell.rect) > 35.0
      ) {
        //potential placement
        for (const [i, j] of pointerShapeHandler.shape.cells) {
          const [cellX, cellY] = [xIdx + i, yIdx + j];
          console.log({ cellX, cellY });

          if (cellX < GRID_W && cellY < GRID_H) {
            const cell = grid[cellX][cellY];
            if (cell.taken == false) {
              okGridCells.push(cell);
            } else {
              errorGridCells.push(cell);
            }
          }
        }

        const canBePlaced =
          errorGridCells.length == 0 &&
          okGridCells.length == pointerShapeHandler.shape.cells.length;

        return { canBePlaced, okGridCells, errorGridCells };
      }
    }
  }

  for (const [i, j] of pointerShapeHandler.shape.cells) {
    const [cellX, cellY] = [xIdx + i, yIdx + j];

    if (cellX < GRID_W && cellY < GRID_H) {
      const cell = grid[cellX][cellY];
      if (cell.taken == false) {
        cell.graphics = mightBeTakenGraphics;
      } else {
        cell.graphics = errorCannotBeTakenGaphics;
      }

      cell.graphics.fillRectShape(cell.rect);
    }
  }
};
