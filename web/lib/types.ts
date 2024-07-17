// 0 floor
// 1 wall
// 2 player
// 3 block
// 4 arrival
// 5 block on arrival
// 6 player on arrival

type ObjectValues<T> = T[keyof T];

export const Directions = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
} as const;

export type Direction = ObjectValues<typeof Directions>;

export type Position = { x: number; y: number };

export const DirectionPositions = {
  [Directions.UP]: { x: 0, y: -1 },
  [Directions.RIGHT]: { x: 1, y: 0 },
  [Directions.DOWN]: { x: 0, y: 1 },
  [Directions.LEFT]: { x: -1, y: 0 },
} as const;

export const DirectionSolutions = {
  [Directions.UP]: 'u',
  [Directions.RIGHT]: 'r',
  [Directions.DOWN]: 'd',
  [Directions.LEFT]: 'l',
} as const;

export const CellTypes = {
  FLOOR: 0,
  WALL: 1,
  PLAYER: 2,
  PLAYER_ON_GOAL: 3,
  BOX: 4,
  BOX_ON_GOAL: 5,
  GOAL: 6,
} as const;

export type CellType = ObjectValues<typeof CellTypes>;

export const StringCells = {
  ' ': CellTypes.FLOOR,
  '#': CellTypes.WALL,
  '@': CellTypes.PLAYER,
  '+': CellTypes.PLAYER_ON_GOAL,
  $: CellTypes.BOX,
  '*': CellTypes.BOX_ON_GOAL,
  '.': CellTypes.GOAL,
} as const;

export type StringCell = keyof typeof StringCells;
