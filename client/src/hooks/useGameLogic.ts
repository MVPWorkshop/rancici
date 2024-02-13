import { useCallback, useEffect, useState } from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';
import { useInterval } from './useInterval';
import {
  useTetrisBoard,
  hasCollisions,
  BOARD_HEIGHT,
  getEmptyBoard,
  getRandomBlock,
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
  const [isPlaying, setIsPlaying] = useState(false); //da li je pocela igra
  const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null); //kojom brzinom pada block
//   const [collidedCells, setCollidedCells] = useState<[number, number][]>([]);


  const [
    { board, droppingRow, droppingColumn, droppingBlock, droppingShape, collisions },
    dispatchBoardState,
  ] = useTetrisBoard();

  const startGame = useCallback(() => {
    const startingBlocks = [
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
    if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
      setIsCommitting(false);
      setTickSpeed(TickSpeed.Normal);
      return;
    } //ovde proverimo da li je user otklonio onaj collision(imao je dodatno vreme za to) i ako jeste onda nastavlja da pada block
    //a za slucaj da nije, onda znaci da je block nasao svoje mesto i spreman je za commit i onda cemo da sacuvamo to stanje, to jest kako izgleda ceo board kad taj novi blok se pozicionira na njega!!!
    const newBoard = structuredClone(board) as BoardShape;
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

    const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];
    const newBlock = newUpcomingBlocks.pop() as Block;
    newUpcomingBlocks.unshift(getRandomBlock());

    if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
      setIsPlaying(false);
      setTickSpeed(null);
    } else {
      setTickSpeed(TickSpeed.Normal);
    }
    //setUpcomingBlocks(newUpcomingBlocks);
    setScore((prevScore) => prevScore + getPoints(numCleared));
    dispatchBoardState({
      type: 'commit',
      newBoard: [...getEmptyBoard(BOARD_HEIGHT - newBoard.length), ...newBoard],
      newBlock,
    });
    setIsCommitting(false);
  }, [
    board,
    dispatchBoardState,
    droppingBlock,
    droppingColumn,
    droppingRow,
    droppingShape,
    upcomingBlocks,
  ]);

//   const gameTick = useCallback(() => {
//     if (isCommitting) {
//       commitPosition();
//     } else if (
//       hasCollisions(board, droppingShape, droppingRow, droppingColumn)
//     ) {
//       //setTickSpeed(TickSpeed.Sliding); //ako postoji collision sa nekim drugim blokom onda cemo da usporimo ticker, da bi user imao vremena da pomeri blok levo ili desno(to je ono kad padne na pod)
      
//       //setIsCommitting(true);
//     } 
//     // else {
//     //   dispatchBoardState({ type: 'drop' });
//     // }
//   }, [
//     board,
//     commitPosition,
//     dispatchBoardState,
//     droppingColumn,
//     droppingRow,
//     droppingShape,
//     isCommitting,
//   ]); //eslint nam daje sugestiju sta treba u [] da se

//   useInterval(() => {
//     return;
//     if (!isPlaying) {
//       return;
//     }
//     gameTick();
//   }, tickSpeed);

  useEffect(() => {
    // if (!isPlaying) {
    //   return;
    // }

    let isPressingLeft = false;
    let isPressingRight = false;
//     let moveIntervalID: NodeJS.Timeout | undefined;

//     const updateMovementInterval = () => {
//       clearInterval(moveIntervalID);
//       dispatchBoardState({
//         type: 'move',
//         isPressingLeft,
//         isPressingRight,
//       });
//       moveIntervalID = setInterval(() => {
//         dispatchBoardState({
//           type: 'move',
//           isPressingLeft,
//           isPressingRight,
//         });
//       }, 300);
//     };

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

//     const handleKeyUp = (event: KeyboardEvent) => {
//       if (event.key === 'ArrowDown') {
//         setTickSpeed(TickSpeed.Normal);
//       }

//       if (event.key === 'ArrowLeft') {
//         isPressingLeft = false;
//         updateMovementInterval();
//       }

//       if (event.key === 'ArrowRight') {
//         isPressingRight = false;
//         updateMovementInterval();
//       }
//     };

    document.addEventListener('keydown', handleKeyDown);
//     document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
//       document.removeEventListener('keyup', handleKeyUp);
//       clearInterval(moveIntervalID);
//       setTickSpeed(TickSpeed.Normal);
    };
  }, [dispatchBoardState]);

  const renderedBoard = structuredClone(board) as BoardShape; //posto nam se pomera block sve dok se ne komituje, i menja nam se njegova pozicija onda kloniramo postojeci board i sa klonom radimo(to mi treba u slucaju da user moze da pomera shape, ali mi to nema smisla kod mene, IZBACI OVAJ DEO)
  if (isPlaying) {
    addShapeToBoard(
      renderedBoard,
      droppingBlock,
      droppingShape,
      droppingRow,
      droppingColumn
    );
  }

//   const [chosenBlock, setChosenBlock] = useState<{ blockId: number | null; blockShape: Block | null }>({
//     blockId: null,
//     blockShape: null,
//   });

  useEffect(() => {
    const handleBlockSelection = ({ blockId, blockShape }: { blockId: number; blockShape: Block }) => {
      // Perform actions based on the selected block ID and shape
      // For example:
      console.log('Selected Block ID:', blockId);
      console.log('Selected Block:', blockShape);

      dispatchBoardState({type: 'setChosenBlock', chosenBlock: blockShape, chosenBlockId: blockId} );
    //   setChosenBlock({ blockId, blockShape });
    //   console.log('set Block ID:', chosenBlock.blockId);
    //   console.log('set Block:', chosenBlock.blockShape);
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
  ]); //treba li chosenBlock?

  useEffect(() => {
    const handleCellHover = ({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
      console.log('Hovered Cell Row:', rowIndex + ' Hovered Cell Column:', colIndex);
    //   if (chosenBlock.blockId === null || chosenBlock.blockShape === null) {
    //     console.log("block is not chosen");
    //     return;
    //   }
    //   console.log('Chosen Block ID:', chosenBlock.blockId);
    //   console.log('Chosen Block Shape:', chosenBlock.blockShape);

    //   addShapeToBoard(
    //     renderedBoard,
    //     chosenBlock.blockShape,
    //     SHAPES[chosenBlock.blockShape].shape,
    //     rowIndex,
    //     colIndex
    //   );

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
]); // [chosenBlock.blockId, chosenBlock.blockShape, chosenBlock]

  return {
    board: renderedBoard,
    startGame,
    isPlaying,
    score,
    upcomingBlocks,
    collisions
  };
}

function getPoints(numCleared: number): number {
  switch (numCleared) {
    case 0:
      return 0;
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 500;
    case 4:
      return 800;
    default:
      throw new Error('Unexpected number of rows cleared');
  }
}

function addShapeToBoard(
  board: BoardShape,
  droppingBlock: Block,
  droppingShape: BlockShape,
  droppingRow: number,
  droppingColumn: number
) {
  droppingShape
    .filter((row) => row.some((isSet) => isSet)) //uzimamo samo one true vrednosti iz matrice bloka, jer false ne uticu na renderovanje
    .forEach((row: boolean[], rowIndex: number) => { //onda za svaki true renderujemo board na toj poziciji
      row.forEach((isSet: boolean, colIndex: number) => {
        if (isSet) {
          board[droppingRow + rowIndex][droppingColumn + colIndex] =
            droppingBlock;
        }
      });
    });
}