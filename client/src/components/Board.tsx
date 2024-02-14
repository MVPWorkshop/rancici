import Cell from "./Cell";
import { BoardShape } from "../types";
import { EventEmitter } from "events";

interface Props {
  currentBoard: BoardShape;
  collidedCells: [number, number][];
}

export const cellHoverEmitter = new EventEmitter();
export const cellClickEmitter = new EventEmitter();

function Board({ currentBoard, collidedCells }: Props) {
  let timeoutId: NodeJS.Timeout | null = null;

  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    timeoutId = setTimeout(() => {
      cellHoverEmitter.emit("cellHover", { rowIndex, colIndex });
      timeoutId = null;
    }, 100);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const handleClick = (rowIndex: number, colIndex: number) => {
    cellHoverEmitter.emit("cellClick", { rowIndex, colIndex });
  };

  return (
    <div className="board">
      {currentBoard.map((row, rowIndex) => (
        <div className="row" key={`${rowIndex}`}>
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(rowIndex, colIndex)}
            >
              <Cell
                type={cell}
                isCollided={
                  collidedCells &&
                  collidedCells.some(
                    ([r, c]) => r === rowIndex && c === colIndex
                  )
                }
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
