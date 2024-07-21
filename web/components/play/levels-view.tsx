import { LevelState } from '../context/level-state';
import LevelCard from './level-card';

const LevelsView = ({ levels }: { levels: LevelState[] }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-4">
      {levels.map((level) => (
        <LevelCard key={level.id} level={level} />
      ))}
    </div>
  </div>
);

export default LevelsView;
