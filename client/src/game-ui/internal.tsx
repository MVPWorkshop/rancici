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

export const calculateCell_Dim = (xIdx, yIdx) => {
  const w = GRID_X_LEN / GRID_W - 2 * GRID_CELL_PADDING;
  const h = GRID_Y_LEN / GRID_H - 2 * GRID_CELL_PADDING;
  const x = GRID_00_X + xIdx * (GRID_X_LEN / GRID_W) + GRID_CELL_PADDING;
  const y = GRID_00_Y + yIdx * (GRID_Y_LEN / GRID_H) + GRID_CELL_PADDING;

  return [x, y, w, h];
};

export const overlapPercent = (rect0, rect1) => {
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

export const inPointerPaddedArea = (pointer, rect) => {
  const X_PAD = 300;
  const Y_PAD = 300;

  return (
    pointer.x - X_PAD < rect.x &&
    rect.x < pointer.x + X_PAD &&
    pointer.y - Y_PAD < rect.y &&
    rect.y < pointer.y + Y_PAD
  );
};

export const shapePlacementInfo = (cursor, grid, pointerShapeHandler) => {
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
