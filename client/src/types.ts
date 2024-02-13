export enum Block {
    I = 'I',
    J = 'J',
    L = 'L',
    O = 'O',
    S = 'S',
    T = 'T',
    Z = 'Z',
    None = 'None',
    Char = 'Char'
  }
  
  export enum EmptyCell {
    Empty = 'Empty',
  }

  export enum CellColor {
    Green = 'Green',
    Yellow = 'Yellow',
    Blue = 'Blue',
    Red = 'Red',
  }
  
  export type CellOptions = Block | EmptyCell;
  
  export type BoardShape = CellOptions[][];
  
  export type BlockShape = boolean[][]; //2D array of booleans= true: shape fills that section, false: empty cell
  //tako ako se rotiraju jednostavno cemo da rotiramo booleans u toj matrici

  type ShapesObj = {
    [key in Block]: {
      shape: BlockShape;
    };
  };
  
  export const SHAPES: ShapesObj = {
    I: {
      shape: [
        [false, false, false, false],
        [false, false, false, false],
        [true, true, true, true],
        [false, false, false, false],
      ],
    },
    J: {
      shape: [
        [false, false, false],
        [true, false, false],
        [true, true, true],
      ],
    },
    L: {
      shape: [
        [false, false, false],
        [false, false, true],
        [true, true, true],
      ],
    },
    O: {
      shape: [
        [true, true],
        [true, true],
      ],
    },
    S: {
      shape: [
        [false, false, false],
        [false, true, true],
        [true, true, false],
      ],
    },
    T: {
      shape: [
        [false, false, false],
        [false, true, false],
        [true, true, true],
      ],
    },
    Z: {
      shape: [
        [false, false, false],
        [true, true, false],
        [false, true, true],
      ],
    },
    None: {
        shape: [
            [false]
          ],
    },
    Char: {
        shape: [
            [true]
        ]
    }
  };