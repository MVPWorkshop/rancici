import { useCallback, useEffect, useState } from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';
import { useInterval } from './useInterval';
import soundEffectFile from "../assets/click-button-140881.mp3"; 
import commitEffectFile from "../assets/commit-sound.mp3";
import {
  useTetrisBoard,
  hasCollisions,
  BOARD_HEIGHT,
  getEmptyBoard,
  getBoardWithCharBlocks,
  getRandomUniqueBlocks,
} from './useBoard';
import {chosenBlockEmitter} from "../components/AvailableBlocks";
import {cellHoverEmitter} from "../components/Board";

enum TickSpeed {
  Normal = 800,
  Sliding = 100,
  Fast = 50,
}

export function useGameLogic() {
  const audio = new Audio(soundEffectFile);
  const commitAudio = new Audio(commitEffectFile);

  const [score, setScore] = useState(0);
  const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);
  const [upcomingBlock, setUpcomingBlock] = useState<Block>();
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
  const initialStats = [{ charBlock: Block.Char1, health: 100, armor: 0, attack: 50, blockId: 11 },
  { charBlock: Block.Char2, health: 100, armor: 0, attack: 50, blockId: 12 },
  { charBlock: Block.Char3, health: 100, armor: 0, attack: 50, blockId: 13 },
  { charBlock: Block.Char4, health: 100, armor: 0, attack: 50, blockId: 14 },
  { charBlock: Block.Char5, health: 100, armor: 0, attack: 50, blockId: 15 }];
    const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];

  const [stats, setStats] = useState(initialStats);

  const [
    { board, droppingRow, droppingColumn, droppingBlock, droppingShape, collisions, numberOfBlocksOnBoard, chosenBlock },
    dispatchBoardState,
  ] = useTetrisBoard();

  useEffect(() => {
    const startGame = () => {
      const startingBlocks = getRandomUniqueBlocks();
      setScore(0);
      setUpcomingBlocks(startingBlocks);
      setIsCommitting(false);
      setIsPlaying(true);
      setTickSpeed(TickSpeed.Normal);
      dispatchBoardState({ type: 'start', chosenBlock: startingBlocks[0]});
      setStats(initialStats);
    };
  
    startGame();
  }, []);

  const setLeftBlock = () => {
    console.log('move left');
  }
  const setRightBlock = () => {
    console.log('move right');
  }
  
  
  const commitPosition = useCallback(() => {
    console.log("you entered commitPosition");
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
    const blocksWithoutCommittedOne = upcomingBlocks.filter(block => block !== chosenBlock);
    setUpcomingBlocks(blocksWithoutCommittedOne);
    const newChosenBlock = blocksWithoutCommittedOne[0];

    dispatchBoardState({
      type: 'commit',
      newBoard: newBoard,
      chosenBlock: newChosenBlock
    });
   
    commitAudio.play();
    setIsCommitting(true);
  }, [
    board,
    dispatchBoardState,
    isPlaying,
    droppingBlock,
    droppingColumn,
    droppingRow,
    droppingShape,
    upcomingBlocks,
    numberOfBlocksOnBoard,
    chosenBlock
  ]);

  useEffect(() => {
    // if (!isPlaying) {
    //   return;
    // }

    let isPressingLeft = false;
    let isPressingRight = false;

   
        console.log("upcoming blocks: "+ upcomingBlocks);
        // console.log("newupcoming blocks: "+ newUpcomingBlocks);
        let newBlock: Block;
        let indexofChosenBlock = chosenBlock !== Block.None ? upcomingBlocks.indexOf(chosenBlock) : 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === 'ArrowDown') {
        // setTickSpeed(TickSpeed.Fast);
      }

      if (event.key === 'ArrowUp') {
        console.log("up pressed");
        dispatchBoardState({
          type: 'move',
          isRotating: true,
        });
      }

      if (event.key === 'ArrowLeft') {
        audio.play();
        isPressingLeft = true;
        const newIndex = indexofChosenBlock === 0 ? newUpcomingBlocks.length - 1 : indexofChosenBlock - 1;

        newBlock = upcomingBlocks[newIndex];

        dispatchBoardState({type: 'drop', chosenBlock: newBlock});
      }

      if (event.key === 'ArrowRight') {
        audio.play();
        isPressingRight = true;
        const newIndex = indexofChosenBlock === newUpcomingBlocks.length - 1 ? 0 : indexofChosenBlock + 1;

        newBlock = upcomingBlocks[newIndex];

        dispatchBoardState({type: 'drop', chosenBlock: newBlock});
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatchBoardState, upcomingBlocks, chosenBlock]);

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

//hook za lkik na AVAILABLE BLOCK  : OVAJ HOOK MI NVISE NE TREBA PROVERI
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
    chosenBlock
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
    chosenBlock
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
    chosenBlock
]);

// hook za kraj igre
useEffect(() => {
    if (numberOfBlocksOnBoard  == 10) {
      setIsPlaying(false);
    }
  }, [numberOfBlocksOnBoard]); 

  //hook za stats
  useEffect(() => {
    const handleBoardChange = () => {
      if(isCommitting){
        const newStats = getNewStats(initialStats, board);
      setStats(newStats);
      }
    };

    handleBoardChange();

    return () => {
        setIsCommitting(false);
    };
  }, [isCommitting]);

  return {
    board: renderedBoard,
    isPlaying,
    stats,
    chosenBlock,
    collisions,
    setLeftBlock,
    setRightBlock
  };
}

function getNewStats(initialStats, board: BoardShape) : any{
  let finalCharacterArray = initialStats;
  let arrayOfBoard = transformBoardToArray(board);

  for (let i = 11; i < 16; i++) {
    let charPosition = arrayOfBoard.indexOf(i);
    let character = finalCharacterArray.find(stat => stat.blockId === i); 
    let leftOfCharacter = arrayOfBoard[charPosition - 1];
    let rightOfCharacter = arrayOfBoard[charPosition + 1];
    let upOfCharacter = arrayOfBoard[charPosition - 7];
    let downOfCharacter = arrayOfBoard[charPosition + 7];

    if (leftOfCharacter === 2) {
      character.health += 10;
    } else if (leftOfCharacter === 3) {
      character.attack += 10;
    } else if (leftOfCharacter === 4) {
      character.armor += 10;
    }

    if (rightOfCharacter === 2) {
      character.health += 10;
    } else if (rightOfCharacter === 3) {
      character.attack += 10;
    } else if (rightOfCharacter === 4) {
      character.armor += 10;
    }

    if (downOfCharacter === 2) {
      character.health += 10;
    } else if (downOfCharacter === 3) {
      character.attack += 10;
    } else if (downOfCharacter === 4) {
      character.armor += 10;
    }

    if (upOfCharacter === 2) {
      character.health += 10;
    } else if (upOfCharacter === 3) {
      character.attack += 10;
    } else if (upOfCharacter === 4) {
      character.armor += 10;
    }

    console.log(character);
  }

  return finalCharacterArray;
}


function transformBoardToArray(board: BoardShape): number[] {
  const transformedArray: number[] = [];

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const cell = board[i][j];
      switch (cell) {
        case Block.Char1:
          transformedArray.push(11);
          break;
        case Block.Char2:
          transformedArray.push(12);
          break;
        case Block.Char3:
          transformedArray.push(13);
          break;
        case Block.Char4:
          transformedArray.push(14);
          break;
        case Block.Char5:
          transformedArray.push(15);
          break;
        case Block.I_R:
        case Block.L_R:
        case Block.O_R:
        case Block.T_R:
        case Block.Z_R:
          transformedArray.push(3);
          break;
        case Block.I_G:
        case Block.L_G:
        case Block.O_G:
        case Block.T_G:
        case Block.Z_G:
          transformedArray.push(2);
          break;
        case Block.I_B:
        case Block.L_B:
        case Block.O_B:
        case Block.T_B:
        case Block.Z_B:
          transformedArray.push(4);
          break;
        case EmptyCell.Empty:
          transformedArray.push(0);
          break;
        default:
          transformedArray.push(0);
          break;
      }
    }
  }
  return transformedArray;
}


function addShapeToBoard(
  board: BoardShape,
  droppingBlock: Block,
  droppingShape: BlockShape,
  droppingRow: number,
  droppingColumn: number
) {
    // if (droppingBlock == Block.None || droppingShape == SHAPES.None.shape || droppingRow == -1 || droppingColumn == -1 ) {
    //     return;
    //   }
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