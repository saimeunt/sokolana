// 0 floor
// 1 wall
// 2 player
// 3 block
// 4 arrival
// 5 block on arrival
// 6 player on arrival

type ObjectValues<T> = T[keyof T];

export type Position = { x: number; y: number };

export const Directions = {
  UP: 'u',
  RIGHT: 'r',
  DOWN: 'd',
  LEFT: 'l',
} as const;

export type Direction = ObjectValues<typeof Directions>;

export const Cells = {
  FLOOR: ' ',
  WALL: '#',
  PLAYER: '@',
  PLAYER_ON_GOAL: '+',
  BOX: '$',
  BOX_ON_GOAL: '*',
  GOAL: '.',
} as const;

export type Cell = ObjectValues<typeof Cells>;

export const Inputs = {
  MOVE_UP: 'u',
  MOVE_RIGHT: 'r',
  MOVE_DOWN: 'd',
  MOVE_LEFT: 'l',
  PUSH_UP: 'U',
  PUSH_RIGHT: 'R',
  PUSH_DOWN: 'D',
  PUSH_LEFT: 'L',
} as const;

export type Input = ObjectValues<typeof Inputs>;

export const DirectionPositionOffsets = {
  [Directions.UP]: { x: 0, y: -1 },
  [Directions.RIGHT]: { x: 1, y: 0 },
  [Directions.DOWN]: { x: 0, y: 1 },
  [Directions.LEFT]: { x: -1, y: 0 },
} as const;

export const InputPositionOffsets = {
  [Inputs.MOVE_UP]: { x: 0, y: -1 },
  [Inputs.MOVE_RIGHT]: { x: 1, y: 0 },
  [Inputs.MOVE_DOWN]: { x: 0, y: 1 },
  [Inputs.MOVE_LEFT]: { x: -1, y: 0 },
  [Inputs.PUSH_UP]: { x: 0, y: -1 },
  [Inputs.PUSH_RIGHT]: { x: 1, y: 0 },
  [Inputs.PUSH_DOWN]: { x: 0, y: 1 },
  [Inputs.PUSH_LEFT]: { x: -1, y: 0 },
} as const;
