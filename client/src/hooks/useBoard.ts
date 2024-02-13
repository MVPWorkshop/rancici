import { useReducer, Dispatch } from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';

export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 7;

type BoardState = {
  board: BoardShape;
  droppingRow: number;
  droppingColumn: number;
  droppingBlock: Block;
  droppingShape: BlockShape; 
  collisions: [number, number][];
  chosenBlockId: number | null;
  chosenBlock: Block | null; 
  chosenBlockShape: BlockShape | null;
  numberOfBlocksOnBoard: number;
};

export function useTetrisBoard(): [BoardState, Dispatch<Action>] {
  const [boardState, dispatchBoardState] = useReducer(
    boardReducer,
    {
      board: [],
      droppingRow: -1,
      droppingColumn: -1,
      droppingBlock: Block.None,
      droppingShape: SHAPES.None.shape,
      collisions: [],
      chosenBlockId: null,
      chosenBlock: null,
      chosenBlockShape: null,
      numberOfBlocksOnBoard: 0
    },
    (emptyState) => { 
      const state = {
        ...emptyState,
        board: getEmptyBoard(),
      };
      return state;
    }
  );

  return [boardState, dispatchBoardState];
}

export function getEmptyBoard(height = BOARD_HEIGHT): BoardShape {
  return Array(height)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(EmptyCell.Empty));
}

export function getBoardWithCharBlocks(height = BOARD_HEIGHT, width = BOARD_HEIGHT): BoardShape {
  const board: BoardShape = [];
  const numBlocks = 5; 

  for (let i = 0; i < height; i++) {
    const row = Array(width).fill(EmptyCell.Empty);
    board.push(row);
  }

  for (let i = 0; i < numBlocks; i++) {
    const randomRow = Math.floor(Math.random() * height);
    const randomCol = Math.floor(Math.random() * width);
    board[randomRow][randomCol] = Block.Char;
  }

  return board;
}


export function hasCollisions( 
  board: BoardShape,
  currentShape: BlockShape,
  row: number,
  column: number
): boolean {
  let hasCollision = false;
  currentShape
    .filter((shapeRow) => shapeRow.some((isSet) => isSet))
    .forEach((shapeRow: boolean[], rowIndex: number) => {
      shapeRow.forEach((isSet: boolean, colIndex: number) => {
        if (
          isSet &&
          (row + rowIndex >= board.length ||
            column + colIndex >= board[0].length ||
            column + colIndex < 0 ||
            board[row + rowIndex][column + colIndex] !== EmptyCell.Empty)
        ) {
          hasCollision = true;
        }
      });
    });
  return hasCollision;
}
export function getCollisions(
  board: BoardShape,
  currentShape: BlockShape,
  row: number,
  column: number
): [number, number][] {
  const collidedCells: [number, number][] = [];

  currentShape
  .filter((shapeRow) => shapeRow.some((isSet) => isSet))
  .forEach((shapeRow: boolean[], rowIndex: number) => {
    shapeRow.forEach((isSet: boolean, colIndex: number) => {
      if (
        isSet &&
        (row + rowIndex >= board.length ||
          column + colIndex >= board[0].length ||
          column + colIndex < 0 ||
          board[row + rowIndex][column + colIndex] !== EmptyCell.Empty)
      ) {
        collidedCells.push([row + rowIndex, column + colIndex]);
        console.log("Collision detected at: " + (row + rowIndex) + ", " + (column + colIndex));
      }
    });
  });

  return collidedCells;
}

export function getRandomBlock(): Block {
  const blockValues = Object.values(Block).filter(block => block !== Block.Char && block !== Block.None);
  return blockValues[Math.floor(Math.random() * blockValues.length)] as Block;
}

function rotateBlock(shape: BlockShape): BlockShape {
  const rows = shape.length;
  const columns = shape[0].length;

  const rotated = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(false));

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      rotated[column][rows - 1 - row] = shape[row][column];
    }
  }

  return rotated;
}

type Action = {
  type: 'start' | 'drop' | 'commit' | 'move' | 'setChosenBlock';
  newBoard?: BoardShape;
  newBlock?: Block;
  isPressingLeft?: boolean;
  isPressingRight?: boolean;
  isRotating?: boolean;
  block?: Block;
  hoveredRowIndex?: number;
  hoveredColumnIndex?: number;
  chosenBlockId?:number;
  chosenBlock?: Block;
};

function boardReducer(state: BoardState, action: Action): BoardState {
  let newState = { ...state };

  switch (action.type) {
    case 'start':
      const boardWithChars = getBoardWithCharBlocks();
      return {
        board: boardWithChars,
        droppingRow: -1,
        droppingColumn: -1,
        droppingBlock: Block.None,
        droppingShape: SHAPES[Block.None].shape,
        collisions: [],
        chosenBlockId: null,
        chosenBlock: null,
      chosenBlockShape: null,
      numberOfBlocksOnBoard: 0
      };
    case 'drop':
      console.log('case drop'); 
      if(newState.chosenBlock == null || newState.chosenBlockId == null){
        break;
      }
      console.log('case drop passed the check');
      const block = newState.chosenBlock ?? Block.None;
      newState.droppingBlock = block;
      newState.droppingShape = newState.chosenBlockShape ?? SHAPES[block].shape;
      newState.droppingRow= action.hoveredRowIndex ?? 0;
      newState.droppingColumn=action.hoveredColumnIndex ?? 0;
      newState.collisions = getCollisions(newState.board,
          newState.droppingShape,
          newState.droppingRow,
          newState.droppingColumn);
      break;
    case 'setChosenBlock':
      newState.chosenBlock = action.chosenBlock ?? Block.None;
      newState.chosenBlockId = action.chosenBlockId ?? -1;
      break;
    case 'commit':
      return {
        board: [
          ...getEmptyBoard(BOARD_HEIGHT - action.newBoard!.length),
          ...action.newBoard!,
        ],
        droppingRow: -1,
        droppingColumn: -1,
        droppingBlock: Block.None,
        droppingShape: SHAPES[Block.None].shape,
        collisions: [],
        chosenBlockId: null,
        chosenBlock: null,
        chosenBlockShape: null,
        numberOfBlocksOnBoard: newState.numberOfBlocksOnBoard + 1,
      };
    case 'move':
      const rotatedShape = action.isRotating
        ? rotateBlock(newState.droppingShape)
        : newState.droppingShape;
      console.log(rotatedShape);
        
        newState.chosenBlockShape = rotatedShape;
        newState.droppingShape = rotatedShape;
        newState.collisions = getCollisions(newState.board,
          rotatedShape,
          newState.droppingRow,
          newState.droppingColumn);
      break;
    default:
      const unhandledType: never = action.type;
      throw new Error(`Unhandled action type: ${unhandledType}`);
  }

  return newState;
}