import LevelCard from './level-card';

const LevelsView = ({ levels }: { levels: string[] }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-4">
      {levels.map((level, index) => (
        <LevelCard key={index} level={level} id={index} />
      ))}
    </div>
  </div>
);

export default LevelsView;
