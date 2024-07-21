import {
  LevelState,
  getCellsPositions,
  nextLevelState,
} from '@/components/context/level-state';
import { Cells, Input, InputPositionOffsets, Position } from '@/lib/types';
import { indexToPosition, positionToIndex } from '@/lib/utils';

const getFloorPositions = (level: LevelState) =>
  level.data.reduce<Position[]>(
    (previousValue, currentValue, index) =>
      currentValue === Cells.FLOOR ||
      currentValue === Cells.PLAYER ||
      currentValue === Cells.BOX
        ? [...previousValue, indexToPosition(index, level.width)]
        : previousValue,
    []
  );

const getWallsPositions = (level: LevelState) => {
  const walls = getCellsPositions(level, Cells.WALL);
  const wallsPositions = [];
  const plainWallsPositions = [];
  for (const wallPosition of walls) {
    const belowWallPosition = { ...wallPosition, y: wallPosition.y + 1 };
    if (belowWallPosition.y === level.height) {
      plainWallsPositions.push(wallPosition);
      continue;
    }
    if (
      level.data[positionToIndex(belowWallPosition, level.width)] === Cells.WALL
    ) {
      plainWallsPositions.push(wallPosition);
    } else {
      wallsPositions.push(wallPosition);
    }
  }
  return { wallsPositions, plainWallsPositions };
};

const duration = (solution: Input[]) => `${(solution.length + 2) * 0.2}s`;

const keyTimes = (solution: Input[]) =>
  Array.from({ length: solution.length + 2 }, (_, i) => i)
    .map((i) => i / (solution.length + 1))
    .join(';');

const playerPositions = (initialPosition: Position, solution: Input[]) => {
  const result = solution.reduce<Position[]>(
    (previousValue, currentValue) => {
      const offset = InputPositionOffsets[currentValue];
      const lastPosition = previousValue[previousValue.length - 1];
      return [
        ...previousValue,
        { x: lastPosition.x + offset.x, y: lastPosition.y + offset.y },
      ];
    },
    [initialPosition]
  );
  const lastPosition = result[result.length - 1];
  result.push(lastPosition);
  return result;
};

const boxPositions = (
  initialPosition: Position,
  level: LevelState,
  solution: Input[]
) => {
  const result = [initialPosition];
  let currentLevel = structuredClone(level);
  for (const input of solution) {
    const nextLevel = nextLevelState(currentLevel, input);
    const lastPosition = result[result.length - 1];
    if (input === 'u' || input === 'r' || input === 'd' || input === 'l') {
      result.push(lastPosition);
    } else {
      const cell =
        nextLevel.data[positionToIndex(lastPosition, nextLevel.width)];
      if (cell === Cells.BOX) {
        result.push(lastPosition);
      } else {
        const offset = InputPositionOffsets[input];
        result.push({
          x: lastPosition.x + offset.x,
          y: lastPosition.y + offset.y,
        });
      }
    }
    currentLevel = structuredClone(nextLevel);
  }
  const lastPosition = result[result.length - 1];
  result.push(lastPosition);
  return result;
};

const LevelSvg = ({
  level,
  zoom = 10,
  solution = [],
}: {
  level: LevelState;
  zoom?: number;
  solution?: Input[];
}) => (
  <svg
    width={level.width * 5 * zoom}
    height={level.height * 5 * zoom}
    viewBox={`0 0 ${level.width * 5} ${level.height * 5}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Graphic assets from Low Battery by Robin Clarke www.citystate.co.uk */}
    <defs>
      <g id="floor">
        <rect width={5} height={5} fill="#377390" />
        <rect width={2} height={1} x={2} y={2} fill="#4085A5" />
        <rect width={2} height={1} x={1} y={3} fill="#4085A5" />
      </g>
      <g id="plain-wall">
        <rect width={5} height={5} fill="#222222" />
      </g>
      <g id="wall">
        <rect width={5} height={2} fill="#222222" />
        <rect width={5} height={3} y={2} fill="#333333" />
      </g>
      <g id="player">
        <rect width={3} height={1} x={1} fill="#303030" />
        <rect width={1} height={1} x={1} y={1} fill="lightgreen" />
        <rect width={1} height={1} x={2} y={1} fill="darkgreen" />
        <rect width={1} height={1} x={3} y={1} fill="lightgreen" />
        <rect width={1} height={1} y={2} fill="#454545" />
        <rect width={3} height={1} x={1} y={2} fill="#303030" />
        <rect width={1} height={1} x={4} y={2} fill="#454545" />
        <rect width={1} height={1} y={3} fill="#303030" />
        <rect width={3} height={1} x={1} y={3} fill="#202020" />
        <rect width={1} height={1} x={4} y={3} fill="#303030" />
        <rect width={1} height={1} x={1} y={4} fill="303030" />
        <rect width={1} height={1} x={3} y={4} fill="303030" />
      </g>
      <g id="box">
        <rect width={5} height={2} fill="#B67D28" />
        <rect width={1} height={2} x={2} fill="#A17028" />
        <rect width={5} height={3} y={2} fill="#CB9A45" />
        <rect width={1} height={1} x={2} y={2} fill="#B67D28" />
      </g>
      <g id="box-on-goal">
        <rect width={5} height={2} fill="chartreuse" />
        <rect width={1} height={2} x={2} fill="limegreen" />
        <rect width={5} height={3} y={2} fill="greenyellow" />
        <rect width={1} height={1} x={2} y={2} fill="chartreuse" />
      </g>
      <g id="goal">
        <rect width={5} height={5} fill="#377390" />
        <rect width={3} height={3} x={1} y={1} fill="darkgreen" />
        <rect width={1} height={1} x={2} y={2} fill="chartreuse" />
      </g>
    </defs>
    {getFloorPositions(level).map(({ x, y }) => (
      <use key={`floor-${x}-${y}`} href="#floor" x={x * 5} y={y * 5} />
    ))}
    {getWallsPositions(level).plainWallsPositions.map(({ x, y }) => (
      <use
        key={`plain-wall-${x}-${y}`}
        href="#plain-wall"
        x={x * 5}
        y={y * 5}
      />
    ))}
    {getWallsPositions(level).wallsPositions.map(({ x, y }) => (
      <use key={`wall-${x}-${y}`} href="#wall" x={x * 5} y={y * 5} />
    ))}
    {getCellsPositions(level, Cells.GOAL).map(({ x, y }) => (
      <use key={`goal-${x}-${y}`} href="#goal" x={x * 5} y={y * 5} />
    ))}
    {getCellsPositions(level, Cells.PLAYER).map(({ x, y }) => (
      <use key={`player-${x}-${y}`} href="#player" x={x * 5} y={y * 5}>
        {solution.length > 0 && (
          <>
            <animate
              attributeName="x"
              dur={duration(solution)}
              repeatCount="indefinite"
              values={playerPositions({ x, y }, solution)
                .map(({ x }) => x * 5)
                .join(';')}
              keyTimes={keyTimes(solution)}
            />
            <animate
              attributeName="y"
              dur={duration(solution)}
              repeatCount="indefinite"
              values={playerPositions({ x, y }, solution)
                .map(({ y }) => y * 5)
                .join(';')}
              keyTimes={keyTimes(solution)}
            />
          </>
        )}
      </use>
    ))}
    {getCellsPositions(level, Cells.PLAYER_ON_GOAL).map(({ x, y }) => (
      <>
        <use key={`goal-${x}-${y}`} href="#goal" x={x * 5} y={y * 5} />
        <use key={`player-${x}-${y}`} href="#player" x={x * 5} y={y * 5} />
      </>
    ))}
    {getCellsPositions(level, Cells.BOX).map(({ x, y }) => (
      <use key={`box-${x}-${y}`} href="#box" x={x * 5} y={y * 5}>
        {solution.length > 0 && (
          <>
            <animate
              attributeName="x"
              dur={duration(solution)}
              repeatCount="indefinite"
              values={boxPositions({ x, y }, level, solution)
                .map(({ x }) => x * 5)
                .join(';')}
              keyTimes={keyTimes(solution)}
            />
            <animate
              attributeName="y"
              dur={duration(solution)}
              repeatCount="indefinite"
              values={boxPositions({ x, y }, level, solution)
                .map(({ y }) => y * 5)
                .join(';')}
              keyTimes={keyTimes(solution)}
            />
          </>
        )}
      </use>
    ))}
    {getCellsPositions(level, Cells.BOX_ON_GOAL).map(({ x, y }) => (
      <use
        key={`box-on-goal-${x}-${y}`}
        href="#box-on-goal"
        x={x * 5}
        y={y * 5}
      />
    ))}
  </svg>
);

export default LevelSvg;
