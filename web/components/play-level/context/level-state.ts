import { produceWithPatches } from 'immer';
import {
  StringCell,
  StringCells,
  CellType,
  Direction,
  DirectionPositions,
  Position,
  CellTypes,
  DirectionSolutions,
} from '@/lib/types';
import { indexToPosition, positionToIndex } from '@/lib/utils';

export type LevelState = {
  width: number;
  height: number;
  data: number[];
  solution: string;
};

export const defaultLevelState = (): LevelState => ({
  width: 0,
  height: 0,
  data: [],
  solution: '',
});

export const loadLevel = (level: string): LevelState => {
  const rows = level.split('\n').filter((row) => row !== '');
  const width = rows.reduce(
    (previousValue, row) => Math.max(previousValue, row.length),
    0
  );
  const data = rows
    .map((row) => row.padEnd(width, ' ').split(''))
    .reduce<number[]>(
      (previousValue, row) => [
        ...previousValue,
        ...row.map((cell) => StringCells[cell as StringCell]),
      ],
      []
    );
  return { width, height: rows.length, data, solution: '' };
};

export const getPlayerPosition = (level: LevelState) => {
  const [playerPosition] = getCellsPositions(level, CellTypes.PLAYER);
  const [playerOnBoxPosition] = getCellsPositions(
    level,
    CellTypes.PLAYER_ON_GOAL
  );
  return playerPosition || playerOnBoxPosition;
};

export const getCellsPositions = (level: LevelState, cellType: CellType) =>
  level.data
    .reduce<number[]>(
      (previousValue, currentValue, currentIndex) =>
        currentValue === cellType
          ? [...previousValue, currentIndex]
          : previousValue,
      []
    )
    .map((wallIndex) => indexToPosition(wallIndex, level.width));

export const isCellEmpty = (position: Position, level: LevelState) =>
  level.data[positionToIndex(position, level.width)] === CellTypes.FLOOR ||
  level.data[positionToIndex(position, level.width)] === CellTypes.GOAL;

export const isCellBox = (position: Position, level: LevelState) =>
  level.data[positionToIndex(position, level.width)] === CellTypes.BOX ||
  level.data[positionToIndex(position, level.width)] === CellTypes.BOX_ON_GOAL;

export const isFinished = (level: LevelState) =>
  level.data.length > 0 && getCellsPositions(level, CellTypes.BOX).length === 0;

export const getMoves = (level: LevelState) =>
  level.solution.split('').filter((char) => char === char.toLowerCase()).length;

export const getPushes = (level: LevelState) =>
  level.solution.split('').filter((char) => char === char.toUpperCase()).length;

export const canMove = (level: LevelState, direction: Direction) => {
  const playerPosition = getPlayerPosition(level);
  const directionPosition = DirectionPositions[direction];
  const nextPlayerPosition = {
    x: playerPosition.x + directionPosition.x,
    y: playerPosition.y + directionPosition.y,
  };
  if (isCellBox(nextPlayerPosition, level)) {
    const nextBoxPosition = {
      x: nextPlayerPosition.x + directionPosition.x,
      y: nextPlayerPosition.y + directionPosition.y,
    };
    return isCellEmpty(nextBoxPosition, level);
  }
  return isCellEmpty(nextPlayerPosition, level);
};

export const move = produceWithPatches(
  (draft: LevelState, direction: Direction) => {
    const playerPosition = getPlayerPosition(draft);
    const directionPosition = DirectionPositions[direction];
    const nextPlayerPosition = {
      x: playerPosition.x + directionPosition.x,
      y: playerPosition.y + directionPosition.y,
    };
    const playerCell = draft.data[positionToIndex(playerPosition, draft.width)];
    draft.data[positionToIndex(playerPosition, draft.width)] =
      playerCell === CellTypes.PLAYER_ON_GOAL
        ? CellTypes.GOAL
        : CellTypes.FLOOR;
    if (isCellBox(nextPlayerPosition, draft)) {
      const nextBoxPosition = {
        x: nextPlayerPosition.x + directionPosition.x,
        y: nextPlayerPosition.y + directionPosition.y,
      };
      const boxCell =
        draft.data[positionToIndex(nextPlayerPosition, draft.width)];
      draft.data[positionToIndex(nextPlayerPosition, draft.width)] =
        boxCell === CellTypes.BOX_ON_GOAL
          ? CellTypes.PLAYER_ON_GOAL
          : CellTypes.PLAYER;
      const nextBoxCell =
        draft.data[positionToIndex(nextBoxPosition, draft.width)];
      draft.data[positionToIndex(nextBoxPosition, draft.width)] =
        nextBoxCell === CellTypes.GOAL ? CellTypes.BOX_ON_GOAL : CellTypes.BOX;
      draft.solution += DirectionSolutions[direction].toUpperCase();
    } else {
      const nextPlayerCell =
        draft.data[positionToIndex(nextPlayerPosition, draft.width)];
      draft.data[positionToIndex(nextPlayerPosition, draft.width)] =
        nextPlayerCell === CellTypes.GOAL
          ? CellTypes.PLAYER_ON_GOAL
          : CellTypes.PLAYER;
      draft.solution += DirectionSolutions[direction];
    }
  }
);
