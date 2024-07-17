import { useEffect } from 'react';
import { CellTypes } from '@/lib/types';
import { getCellsPositions } from './context/level-state';
import useContext from './context/hook';

const ZOOM = 5;

const LevelView = ({ levelData }: { levelData: string }) => {
  const {
    state: { level },
    loadLevel,
  } = useContext();
  useEffect(
    () => loadLevel(levelData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelData]
  );
  return (
    <svg
      width={level.width * 8 * ZOOM}
      height={level.height * 8 * ZOOM}
      viewBox={`0 0 ${level.width * 8} ${level.height * 8}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <rect id="wall" width={8} height={8} fill="rgb(0 0 0)" />
        <circle id="player" cx={4} cy={4} r={3} fill="rgb(239 68 68)" />
        <circle
          id="player-on-goal"
          cx={4}
          cy={4}
          r={3}
          fill="rgb(139 92 246)"
        />
        <rect id="box" width={8} height={8} fill="rgb(234 179 8)" />
        <rect id="box-on-goal" width={8} height={8} fill="rgb(34 197 94)" />
        <circle id="goal" cx={4} cy={4} r={1} fill="rgb(59 130 246)" />
      </defs>
      <rect
        width={level.width * 8 * ZOOM}
        height={level.height * 8 * ZOOM}
        fill="rgb(255 255 255)"
      />
      {getCellsPositions(level, CellTypes.WALL).map(({ x, y }) => (
        <use key={`${x} ${y}`} href="#wall" x={x * 8} y={y * 8} />
      ))}
      {getCellsPositions(level, CellTypes.PLAYER).map(({ x, y }) => (
        <use key={`${x} ${y}`} href="#player" x={x * 8} y={y * 8} />
      ))}
      {getCellsPositions(level, CellTypes.PLAYER_ON_GOAL).map(({ x, y }) => (
        <use key={`${x} ${y}`} href="#player-on-goal" x={x * 8} y={y * 8} />
      ))}
      {getCellsPositions(level, CellTypes.BOX).map(({ x, y }) => (
        <use key={`${x} ${y}`} href="#box" x={x * 8} y={y * 8} />
      ))}
      {getCellsPositions(level, CellTypes.BOX_ON_GOAL).map(({ x, y }) => (
        <use key={`${x} ${y}`} href="#box-on-goal" x={x * 8} y={y * 8} />
      ))}
      {getCellsPositions(level, CellTypes.GOAL).map(({ x, y }) => (
        <use key={`${x} ${y}`} href="#goal" x={x * 8} y={y * 8} />
      ))}
    </svg>
  );
};

export default LevelView;
