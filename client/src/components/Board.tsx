import Cell from './Cell';
import { BoardShape } from '../types';
import { EventEmitter } from 'events';

interface Props {
    currentBoard: BoardShape;
    collidedCells: [number, number][];
}

export const cellHoverEmitter = new EventEmitter(); 

function Board({ currentBoard, collidedCells }: Props) {
    // const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    //     cellHoverEmitter.emit('cellHover', { rowIndex, colIndex }); // Emit an event with row and column indices
    //   };

    let timeoutId: NodeJS.Timeout | null = null; // Variable to hold the timeout ID

    const handleMouseEnter = (rowIndex: number, colIndex: number) => {
        // Clear any existing timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        // Set a timeout to emit the event after 30 milliseconds
        timeoutId = setTimeout(() => {
            cellHoverEmitter.emit('cellHover', { rowIndex, colIndex }); // Emit an event with row and column indices
            timeoutId = null; // Reset the timeout ID
        }, 200);
    };

    const handleMouseLeave = () => {
        // Clear the timeout if the mouse leaves the cell
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
    return (
        <div className="board">
            {currentBoard.map((row, rowIndex) => (
                <div className="row" key={`${rowIndex}`}>
                    {row.map((cell, colIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)} onMouseLeave={handleMouseLeave}>
                        <Cell type={cell}  isCollided={ collidedCells && collidedCells.some(([r, c]) => r === rowIndex && c === colIndex)}/>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default Board;