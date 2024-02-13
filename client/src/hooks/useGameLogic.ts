import { useCallback, useEffect, useState } from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';
import { useInterval } from './useInterval';
import {
  useTetrisBoard,
  hasCollisions,
  BOARD_HEIGHT,
  getEmptyBoard,
  getRandomBlock,
  getBoardWithCharBlocks,
} from './useBoard';
import {chosenBlockEmitter} from "../components/AvailableBlocks";
import {cellHoverEmitter} from "../components/Board";

enum TickSpeed {
  Normal = 800,
  Sliding = 100,
  Fast = 50,
}

export function useGameLogic() {
  const [score, setScore] = useState(0);
  const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
const [selectedBlockCount, setSelectedBlockCount] = useState(0);


  const [
    { board, droppingRow, droppingColumn, droppingBlock, droppingShape, collisions, numberOfBlocksOnBoard },
    dispatchBoardState,
  ] = useTetrisBoard();

  const startGame = useCallback(() => {
    const startingBlocks = [
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock(),
    ];
    setScore(0);
    setUpcomingBlocks(startingBlocks);
    setIsCommitting(false);
    setIsPlaying(true);
    setTickSpeed(TickSpeed.Normal);
    dispatchBoardState({ type: 'start' });
  }, [dispatchBoardState]);
   
  const commitPosition = useCallback(() => {
    if (hasCollisions(board, droppingShape, droppingRow, droppingColumn)) {
      return;
    } 
    const newBoard = structuredClone(board) as BoardShape;

    console.log("drop block: "+ droppingBlock);
    console.log("drop shape: "+ droppingShape);
    console.log("drop row: "+ droppingRow);
    console.log("drop column: "+ droppingColumn);

    addShapeToBoard(
      newBoard,
      droppingBlock,
      droppingShape,
      droppingRow,
      droppingColumn
    );
    let numCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every((entry) => entry !== EmptyCell.Empty)) {
        numCleared++;
        newBoard.splice(row, 1);
      }
    }
    
    dispatchBoardState({
      type: 'commit',
      newBoard: [...getEmptyBoard(BOARD_HEIGHT - newBoard.length), ...newBoard],
    });
   
    const blocksWithoutCommittedOne = upcomingBlocks.filter(block => block !== droppingBlock);
    setUpcomingBlocks(blocksWithoutCommittedOne);
  }, [
    board,
    dispatchBoardState,
    isPlaying,
    droppingBlock,
    droppingColumn,
    droppingRow,
    droppingShape,
    upcomingBlocks,
    numberOfBlocksOnBoard
  ]);

  useEffect(() => {
    // if (!isPlaying) {
    //   return;
    // }

    let isPressingLeft = false;
    let isPressingRight = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === 'ArrowDown') {
        setTickSpeed(TickSpeed.Fast);
      }

      if (event.key === 'ArrowUp') {
        console.log("up pressed");
        dispatchBoardState({
          type: 'move',
          isRotating: true,
        });
      }

      if (event.key === 'ArrowLeft') {
        isPressingLeft = true;
      }

      if (event.key === 'ArrowRight') {
        isPressingRight = true;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatchBoardState]);

  const renderedBoard = structuredClone(board) as BoardShape; 
  if (isPlaying) {
    addShapeToBoard(
      renderedBoard,
      droppingBlock,
      droppingShape,
      droppingRow,
      droppingColumn
    );
  }

//hook za lkik na AVAILABLE BLOCK
  useEffect(() => {
    const handleBlockSelection = ({ blockId, blockShape }: { blockId: number; blockShape: Block }) => {
      console.log('Selected Block ID:', blockId);
      console.log('Selected Block:', blockShape);

      dispatchBoardState({type: 'setChosenBlock', chosenBlock: blockShape, chosenBlockId: blockId} );
    };

    chosenBlockEmitter.on('blockSelected', handleBlockSelection);

    return () => {
        chosenBlockEmitter.off('blockSelected', handleBlockSelection);
    };
  }, [
    board,
    dispatchBoardState,
    droppingBlock,
    droppingColumn,
    droppingRow,
    droppingShape,
    upcomingBlocks,
  ]); 
  
  //hook za HOVER
  useEffect(() => {
    const handleCellHover = ({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
      console.log('Hovered Cell Row:', rowIndex + ' Hovered Cell Column:', colIndex);

    dispatchBoardState({ type: 'drop', hoveredColumnIndex: colIndex, hoveredRowIndex: rowIndex});
    };

    cellHoverEmitter.on('cellHover', handleCellHover);

    return () => {
      cellHoverEmitter.off('cellHover', handleCellHover);
    };
  }, [
    board,
    dispatchBoardState,
    droppingBlock,
    droppingColumn,
    droppingRow,
    droppingShape,
    upcomingBlocks,
]); 

//hook za CELL CLICK
useEffect(() => {
    const handleCellClick = ({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
      console.log('Clicked Cell Row:', rowIndex + ' Clicked Cell Column:', colIndex);

      commitPosition();
    };

    cellHoverEmitter.on('cellClick', handleCellClick);

    return () => {
      cellHoverEmitter.off('cellClick', handleCellClick);
    };
  }, [
    board,
    commitPosition,
    droppingBlock,
    droppingColumn,
    droppingRow,
    droppingShape,
    upcomingBlocks,
]);

//hook za kraj igre
useEffect(() => {
    if (numberOfBlocksOnBoard  == 3) {
      setIsPlaying(false);
    }
  }, [numberOfBlocksOnBoard]); 


  return {
    board: renderedBoard,
    startGame,
    isPlaying,
    score,
    upcomingBlocks,
    collisions
  };
}

function addShapeToBoard(
  board: BoardShape,
  droppingBlock: Block,
  droppingShape: BlockShape,
  droppingRow: number,
  droppingColumn: number
) {
    if (droppingBlock == Block.None || droppingShape == SHAPES.None.shape || droppingRow == -1 || droppingColumn == -1 ) {
        return;
      }
  droppingShape
    .filter((row) => row.some((isSet) => isSet)) 
    .forEach((row: boolean[], rowIndex: number) => { 
      row.forEach((isSet: boolean, colIndex: number) => {
        if (isSet) {
            const newRow = droppingRow + rowIndex;
          const newCol = droppingColumn + colIndex;
          if (
            newRow < 0 || newRow >= board.length ||
            newCol < 0 || newCol >= board[0].length 
          ) {
            return; 
          }
          board[newRow][newCol] = droppingBlock; 
        }
      });
    });
}