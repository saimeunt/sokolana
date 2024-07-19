import {
  LevelState,
  getCellsPositions,
  nextLevelState,
} from '@/components/context/level-state';
import { Cells, Input, InputPositionOffsets, Position } from '@/lib/types';
import { positionToIndex } from '@/lib/utils';

const duration = (solution: Input[]) => `${(solution.length + 2) * 0.25}s`;

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
  zoom = 6,
  solution = [],
}: {
  level: LevelState;
  zoom?: number;
  solution?: Input[];
}) => (
  <svg
    width={level.width * 8 * zoom}
    height={level.height * 8 * zoom}
    viewBox={`0 0 ${level.width * 8} ${level.height * 8}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <rect id="wall" width={8} height={8} fill="rgb(0 0 0)" />
      <circle id="player" cx={4} cy={4} r={3} fill="rgb(239 68 68)" />
      <circle id="player-on-goal" cx={4} cy={4} r={3} fill="rgb(139 92 246)" />
      <rect id="box" width={8} height={8} fill="rgb(234 179 8)" />
      <rect id="box-on-goal" width={8} height={8} fill="rgb(34 197 94)" />
      <circle id="goal" cx={4} cy={4} r={1} fill="rgb(59 130 246)" />
    </defs>
    <rect
      width={level.width * 8 * zoom}
      height={level.height * 8 * zoom}
      fill="rgb(255 255 255)"
    />
    {getCellsPositions(level, Cells.GOAL).map(({ x, y }) => (
      <use key={`${x} ${y}`} href="#goal" x={x * 8} y={y * 8} />
    ))}
    {getCellsPositions(level, Cells.WALL).map(({ x, y }) => (
      <use key={`${x} ${y}`} href="#wall" x={x * 8} y={y * 8} />
    ))}
    {getCellsPositions(level, Cells.PLAYER).map(({ x, y }) => (
      <use key={`${x} ${y}`} href="#player" x={x * 8} y={y * 8}>
        {solution.length > 0 && (
          <>
            <animate
              attributeName="x"
              dur={duration(solution)}
              repeatCount="indefinite"
              values={playerPositions({ x, y }, solution)
                .map(({ x }) => x * 8)
                .join(';')}
              keyTimes={keyTimes(solution)}
            />
            <animate
              attributeName="y"
              dur={duration(solution)}
              repeatCount="indefinite"
              values={playerPositions({ x, y }, solution)
                .map(({ y }) => y * 8)
                .join(';')}
              keyTimes={keyTimes(solution)}
            />
          </>
        )}
      </use>
    ))}
    {getCellsPositions(level, Cells.PLAYER_ON_GOAL).map(({ x, y }) => (
      <use key={`${x} ${y}`} href="#player-on-goal" x={x * 8} y={y * 8} />
    ))}
    {getCellsPositions(level, Cells.BOX).map(({ x, y }) => (
      <use key={`${x} ${y}`} href="#box" x={x * 8} y={y * 8}>
        {solution.length > 0 && (
          <>
            <animate
              attributeName="x"
              dur={duration(solution)}
              repeatCount="indefinite"
              values={boxPositions({ x, y }, level, solution)
                .map(({ x }) => x * 8)
                .join(';')}
              keyTimes={keyTimes(solution)}
            />
            <animate
              attributeName="y"
              dur={duration(solution)}
              repeatCount="indefinite"
              values={boxPositions({ x, y }, level, solution)
                .map(({ y }) => y * 8)
                .join(';')}
              keyTimes={keyTimes(solution)}
            />
          </>
        )}
      </use>
    ))}
    {getCellsPositions(level, Cells.BOX_ON_GOAL).map(({ x, y }) => (
      <use key={`${x} ${y}`} href="#box-on-goal" x={x * 8} y={y * 8} />
    ))}
  </svg>
);

export default LevelSvg;
