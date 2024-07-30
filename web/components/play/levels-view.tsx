import { Input } from '@/lib/types';
import { LevelState } from '../context/level-state';
import LevelCard from './level-card';

const LevelsView = ({
  levels,
  bestSolutions,
}: {
  levels: LevelState[];
  bestSolutions: Input[][];
}) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-4">
      {levels.map((level, index) => (
        <LevelCard
          key={level.id}
          level={level}
          bestSolution={bestSolutions[index] ?? []}
        />
      ))}
    </div>
  </div>
);

export default LevelsView;
