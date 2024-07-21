import { produceWithPatches } from 'immer';
import {
  Cell,
  Direction,
  DirectionPositionOffsets,
  Position,
  Cells,
  Input,
  Directions,
} from '@/lib/types';
import { indexToPosition, positionToIndex } from '@/lib/utils';

export type LevelState = {
  id: string;
  width: number;
  height: number;
  data: Cell[];
  solution: Input[];
};

export const defaultLevelState = (): LevelState => ({
  id: '',
  width: 0,
  height: 0,
  data: [],
  solution: [],
});

export const loadLevel = (id: string, levelData: string): LevelState => {
  const rows = levelData.split('\n').filter((row) => row !== '');
  const width = rows.reduce(
    (previousValue, row) => Math.max(previousValue, row.length),
    0
  );
  const data = rows
    .map((row) => row.padEnd(width, ' ').split(''))
    .reduce<Cell[]>(
      (previousValue, row) => [
        ...previousValue,
        ...row.map((cell) => cell as Cell),
      ],
      []
    );
  return { id, width, height: rows.length, data, solution: [] };
};

export const accountToLevelData = ({
  width,
  height,
  data,
}: {
  width: number;
  height: number;
  data: Uint8Array;
}) => {
  const AccountDataCells = [
    Cells.FLOOR,
    Cells.WALL,
    Cells.PLAYER,
    Cells.BOX,
    Cells.GOAL,
    Cells.BOX_ON_GOAL,
    Cells.PLAYER_ON_GOAL,
  ] as const;
  const cells = [...data].map((cell) => AccountDataCells[cell]);
  let result = '';
  for (let i = 0; i < height; i++) {
    const row = cells.slice(i * width, i * width + width).join('');
    result += `${row}\n`;
  }
  return result;
};

export const accountToLevel = (account: {
  id: number;
  width: number;
  height: number;
  data: Uint8Array;
}): LevelState => loadLevel(account.id.toString(), accountToLevelData(account));

export const levelToAccount = (level: LevelState) => {
  const Cells = {
    ' ': 0,
    '#': 1,
    '@': 2,
    $: 3,
    '.': 4,
    '*': 5,
    '+': 6,
  } as const;
  const data = level.data.map((cell) => Cells[cell]);
  return { width: level.width, height: level.height, data };
};

export const getPlayerPosition = (level: LevelState) => {
  const [playerPosition] = getCellsPositions(level, Cells.PLAYER);
  const [playerOnBoxPosition] = getCellsPositions(level, Cells.PLAYER_ON_GOAL);
  return playerPosition || playerOnBoxPosition;
};

export const getCellsPositions = (level: LevelState, cellType: Cell) =>
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
  level.data[positionToIndex(position, level.width)] === Cells.FLOOR ||
  level.data[positionToIndex(position, level.width)] === Cells.GOAL;

export const isCellBox = (position: Position, level: LevelState) =>
  level.data[positionToIndex(position, level.width)] === Cells.BOX ||
  level.data[positionToIndex(position, level.width)] === Cells.BOX_ON_GOAL;

export const isFinished = (level: LevelState) =>
  level.data.length > 0 && getCellsPositions(level, Cells.BOX).length === 0;

export const isTestable = (level: LevelState) => {
  const result = true;
  for (let i = 0; i < level.width; i++) {
    if (
      level.data[positionToIndex({ x: i, y: 0 }, level.width)] !== Cells.WALL ||
      level.data[
        positionToIndex({ x: i, y: level.height - 1 }, level.width)
      ] !== Cells.WALL
    ) {
      return false;
    }
  }
  for (let i = 0; i < level.height; i++) {
    if (
      level.data[positionToIndex({ x: 0, y: i }, level.width)] !== Cells.WALL ||
      level.data[positionToIndex({ x: level.width - 1, y: i }, level.width)] !==
        Cells.WALL
    ) {
      return false;
    }
  }
  const playerCellsLength = getCellsPositions(level, Cells.PLAYER).length;
  const playerOnGoalCellsLength = getCellsPositions(
    level,
    Cells.PLAYER_ON_GOAL
  ).length;
  if (playerCellsLength + playerOnGoalCellsLength !== 1) {
    return false;
  }
  const boxCellsLength = getCellsPositions(level, Cells.BOX).length;
  const boxOnGoalCellsLength = getCellsPositions(
    level,
    Cells.BOX_ON_GOAL
  ).length;
  if (boxCellsLength + boxOnGoalCellsLength === 0) {
    return false;
  }
  const goalCellsLength = getCellsPositions(level, Cells.GOAL).length;
  if (goalCellsLength === 0) {
    return false;
  }
  return result;
};

export const nextLevelState = (level: LevelState, input: Input) => {
  if (input === 'u') {
    const [levelState] = move(level, Directions.UP);
    return levelState;
  } else if (input === 'r') {
    const [levelState] = move(level, Directions.RIGHT);
    return levelState;
  } else if (input === 'd') {
    const [levelState] = move(level, Directions.DOWN);
    return levelState;
  } else if (input === 'l') {
    const [levelState] = move(level, Directions.LEFT);
    return levelState;
  } else if (input === 'U') {
    const [levelState] = push(level, Directions.UP);
    return levelState;
  } else if (input === 'R') {
    const [levelState] = push(level, Directions.RIGHT);
    return levelState;
  } else if (input === 'D') {
    const [levelState] = push(level, Directions.DOWN);
    return levelState;
  } else {
    const [levelState] = push(level, Directions.LEFT);
    return levelState;
  }
};

export const isMintable = (level: LevelState, solution: Input[]) => {
  if (!isTestable(level)) {
    return false;
  }
  let currentLevel = structuredClone(level);
  for (const input of solution) {
    const nextLevel = nextLevelState(currentLevel, input);
    currentLevel = structuredClone(nextLevel);
  }
  return isFinished(currentLevel);
};

export const getMoves = (level: LevelState) =>
  level.solution.filter((input) => input === input.toLowerCase()).length;

export const getPushes = (level: LevelState) =>
  level.solution.filter((input) => input === input.toUpperCase()).length;

export const canMove = (level: LevelState, direction: Direction) => {
  const playerPosition = getPlayerPosition(level);
  const offset = DirectionPositionOffsets[direction];
  const nextPlayerPosition = {
    x: playerPosition.x + offset.x,
    y: playerPosition.y + offset.y,
  };
  return isCellEmpty(nextPlayerPosition, level);
};

export const canPush = (level: LevelState, direction: Direction) => {
  const playerPosition = getPlayerPosition(level);
  const offset = DirectionPositionOffsets[direction];
  const nextPlayerPosition = {
    x: playerPosition.x + offset.x,
    y: playerPosition.y + offset.y,
  };
  const nextBoxPosition = {
    x: nextPlayerPosition.x + offset.x,
    y: nextPlayerPosition.y + offset.y,
  };
  return (
    isCellBox(nextPlayerPosition, level) && isCellEmpty(nextBoxPosition, level)
  );
};

export const move = produceWithPatches(
  (draft: LevelState, direction: Direction) => {
    const playerPosition = getPlayerPosition(draft);
    const offset = DirectionPositionOffsets[direction];
    const nextPlayerPosition = {
      x: playerPosition.x + offset.x,
      y: playerPosition.y + offset.y,
    };
    const playerCell = draft.data[positionToIndex(playerPosition, draft.width)];
    draft.data[positionToIndex(playerPosition, draft.width)] =
      playerCell === Cells.PLAYER_ON_GOAL ? Cells.GOAL : Cells.FLOOR;
    const nextPlayerCell =
      draft.data[positionToIndex(nextPlayerPosition, draft.width)];
    draft.data[positionToIndex(nextPlayerPosition, draft.width)] =
      nextPlayerCell === Cells.GOAL ? Cells.PLAYER_ON_GOAL : Cells.PLAYER;
    draft.solution.push(direction as Input);
  }
);

export const push = produceWithPatches(
  (draft: LevelState, direction: Direction) => {
    const playerPosition = getPlayerPosition(draft);
    const offset = DirectionPositionOffsets[direction];
    const nextPlayerPosition = {
      x: playerPosition.x + offset.x,
      y: playerPosition.y + offset.y,
    };
    const playerCell = draft.data[positionToIndex(playerPosition, draft.width)];
    draft.data[positionToIndex(playerPosition, draft.width)] =
      playerCell === Cells.PLAYER_ON_GOAL ? Cells.GOAL : Cells.FLOOR;
    const nextBoxPosition = {
      x: nextPlayerPosition.x + offset.x,
      y: nextPlayerPosition.y + offset.y,
    };
    const boxCell =
      draft.data[positionToIndex(nextPlayerPosition, draft.width)];
    draft.data[positionToIndex(nextPlayerPosition, draft.width)] =
      boxCell === Cells.BOX_ON_GOAL ? Cells.PLAYER_ON_GOAL : Cells.PLAYER;
    const nextBoxCell =
      draft.data[positionToIndex(nextBoxPosition, draft.width)];
    draft.data[positionToIndex(nextBoxPosition, draft.width)] =
      nextBoxCell === Cells.GOAL ? Cells.BOX_ON_GOAL : Cells.BOX;
    draft.solution.push(direction.toUpperCase() as Input);
  }
);
