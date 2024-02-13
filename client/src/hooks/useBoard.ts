import { useReducer, Dispatch } from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';

export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 7;

type BoardState = {
  board: BoardShape;
  droppingRow: number;
  droppingColumn: number;
  droppingBlock: Block;
  droppingShape: BlockShape; //ako user rotira block da zapamtimo kakav mu je shape posle rotacije
  collisions: [number, number][];
  chosenBlockId: number | null;
  chosenBlock: Block | null; //na koji smo kliknuli
  chosenBlockShape: BlockShape | null;
};

export function useTetrisBoard(): [BoardState, Dispatch<Action>] {
  const [boardState, dispatchBoardState] = useReducer(
    boardReducer,
    {
      board: [],
      droppingRow: 0,
      droppingColumn: 0,
      droppingBlock: Block.I,
      droppingShape: SHAPES.I.shape,
      collisions: [],
      chosenBlockId: null,
      chosenBlock: null,
      chosenBlockShape: null
    },
    (emptyState) => { //inicijalizujemo boardpre nego sto igrica i pocne
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
  const numBlocks = 5; // Number of blocks to place

  // Initialize the board with empty cells
  for (let i = 0; i < height; i++) {
    const row = Array(width).fill(EmptyCell.Empty);
    board.push(row);
  }

  // Place the blocks randomly within the board
  for (let i = 0; i < numBlocks; i++) {
    const randomRow = Math.floor(Math.random() * height);
    const randomCol = Math.floor(Math.random() * width);
    board[randomRow][randomCol] = Block.Char;
  }

  return board;
}


export function hasCollisions( //da li se block preklapa sa nekim drugim
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
export function checkCollisions2(
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
export function checkCollisions(
  board: BoardShape,
  currentShape: BlockShape,
  row: number,
  column: number
): [number, number][] {
  const collidedCells: [number, number][] = [];

  currentShape.forEach((shapeRow: boolean[], rowIndex: number) => {
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
  const blockValues = Object.values(Block);
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
  type: 'start' | 'drop' | 'commit' | 'move' | 'setChosenBlock';//start game, drop a block, commiting=saving postition of the block when it hits the bottom(kod mene je to kad user klikne na polje)
  newBoard?: BoardShape;
  newBlock?: Block;
  isPressingLeft?: boolean;
  isPressingRight?: boolean;
  isRotating?: boolean;
  block?: Block; //ovo sam ja dodala i koristila sa useEffect
  hoveredRowIndex?: number;
  hoveredColumnIndex?: number;
  chosenBlockId?:number;
  chosenBlock?: Block;
};

function boardReducer(state: BoardState, action: Action): BoardState {
  let newState = { ...state };

  switch (action.type) {
    case 'start':
      const firstBlock = Block.None;//getRandomBlock();
      // const emptyBoard= getEmptyBoard();
      const boardWithChars = getBoardWithCharBlocks();
      return {
        board: boardWithChars,
        droppingRow: 0, //block nam pada sa vrha
        droppingColumn: 3, //da blok bude na centru
        droppingBlock: firstBlock,
        droppingShape: SHAPES[firstBlock].shape,
        collisions: [],
        chosenBlockId: null,
        chosenBlock: null,
      chosenBlockShape: null
      };
    case 'drop':
      console.log('case drop'); 
      // newState.droppingRow++;
      // const block = action.block ?? Block.L;
      // newState.droppingBlock = block;
      // newState.droppingRow= action.droppingRow ?? 0;
      // newState.droppingColumn=action.droppingColumn ?? 0;
      // newState.droppingShape=SHAPES[block].shape;
      // newState.collisions =  checkCollisions(
      //   newState.board,
      //   newState.droppingShape,
      //   newState.droppingRow,
      //   newState.droppingColumn
      // );

      const block = newState.chosenBlock ?? Block.None;
      newState.droppingBlock = block;
      newState.droppingShape = newState.chosenBlockShape ?? SHAPES[block].shape;
      newState.droppingRow= action.hoveredRowIndex ?? 0;
      newState.droppingColumn=action.hoveredColumnIndex ?? 0;
      newState.collisions = checkCollisions2(newState.board,
          newState.droppingShape,
          newState.droppingRow,
          newState.droppingColumn);

      // console.log("collisions row: " + +newState.droppingRow + "column: " + newState.droppingColumn );
      // console.log("for values: " + action.droppingRow + "and " + action.droppingColumn);
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
        droppingRow: 0,
        droppingColumn: 3,
        droppingBlock: action.newBlock!,
        droppingShape: SHAPES[action.newBlock!].shape,
        collisions: [],
        chosenBlockId: null,
        chosenBlock: null,
        chosenBlockShape: null
      };
    case 'move':
      const rotatedShape = action.isRotating
        ? rotateBlock(newState.droppingShape)
        : newState.droppingShape;
      console.log(rotatedShape);
      // let columnOffset = action.isPressingLeft ? -1 : 0;
      // columnOffset = action.isPressingRight ? 1 : columnOffset;
      // if (
      //   !hasCollisions(
      //     newState.board,
      //     rotatedShape,
      //     newState.droppingRow,
      //     newState.droppingColumn //+ columnOffset
      //   )
      // ) {
        // newState.droppingColumn += columnOffset;
        
        newState.chosenBlockShape = rotatedShape;
        newState.droppingShape = rotatedShape;
        newState.collisions = checkCollisions2(newState.board,
          rotatedShape,
          newState.droppingRow,
          newState.droppingColumn);
      // }
      break;
    default:
      const unhandledType: never = action.type;
      throw new Error(`Unhandled action type: ${unhandledType}`);
  }

  return newState;
}