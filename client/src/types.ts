export enum Block {
  I_R = 'IR',
  I_B = 'IB',
  I_G = 'IG',
  L_R = 'LR',
  L_B = 'LB',
  L_G = 'LG',
  O_R = 'OR',
  O_B = 'OB',
  O_G = 'OG',
  T_R = 'TR',
  T_B = 'TB',
  T_G = 'TG',
  Z_R = 'ZR',
  Z_B = 'ZB',
  Z_G = 'ZG',
    None = 'None',
    Char1 = 'Char1',
    Char2 = 'Char2',
    Char3 = 'Char3',
    Char4 = 'Char4',
    Char5 = 'Char5'
  }
  
  export enum EmptyCell {
    Empty = 'Empty',
  }

  export enum CellColor {
    Green = 'Green',  //2
    Blue = 'Blue', //4
    Red = 'Red', //3
  }

  export interface BlockWithColor {
    block: Block;
    color: CellColor;
  }
  
  export type CellOptions = Block | EmptyCell;
  
  export type BoardShape = CellOptions[][];
  
  export type BlockShape = boolean[][];
  type ShapesObj = {
    [key in Block]: {
      shape: BlockShape;
    };
  };
  
  export const SHAPES: ShapesObj = {
    IR: {
      shape: [
        [false, false, true, false],
        [false, false, true, false],
        [false, false, true, false],
        [false, false, true, false],
      ],
    },
    IB: {
      shape: [
        [false, false, false, false],
        [false, false, false, false],
        [true, true, true, true],
        [false, false, false, false],
      ],
    },
    IG: {
      shape: [
        [true, false, false, false],
        [true, false, false, false],
        [true, false, false, false],
        [true, false, false, false],
      ],
    },
    LR: {
      shape: [
        [true, true, false],
        [false, true, false],
        [false, true, false],
      ],
    },
    LB: {
      shape: [
        [false, false, true],
        [true, true, true],
        [false, false, false],
      ],
    },
    LG: {
      shape: [
        [false, true, false],
        [false, true, false],
        [false, true, true],
      ],
    },
    OR: {
      shape: [
        [true, true],
        [true, true],
      ],
    },
    OB: {
      shape: [
        [true, true],
        [true, true],
      ],
    },
    OG: {
      shape: [
        [true, true],
        [true, true],
      ],
    },
    TR: {
      shape: [
        [false, true, false],
        [true, true, false],
        [false, true, false],
      ],
    },
    TB: {
      shape: [
        [false, false, false],
        [true, true, true],
        [false, true, false],
      ],
    },
    TG: {
      shape: [
        [false, true, false],
        [false, true, true],
        [false, true, false],
      ],
    },
    ZR: {
      shape: [
        [false, true, false],
        [true, true, false],
        [true, false, false],
      ],
    },
    ZB: {
      shape: [
        [false, false, false],
        [true, true, false],
        [false, true, true],
      ],
    },
    ZG: {
      shape: [
        [true, false, false],
        [true, true, false],
        [false, true, false],
      ],
    },
    None: {
        shape: [
            [false]
          ],
    },
    Char1: {
        shape: [
            [true]
        ]
    },
    Char2: {
      shape: [
          [true]
      ]
  },
  Char3: {
    shape: [
        [true]
    ]
},
Char4: {
  shape: [
      [true]
  ]
},
Char5: {
  shape: [
      [true]
  ]
}
  };