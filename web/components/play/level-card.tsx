import Link from 'next/link';
import LevelSvg from '../ui/level-svg';
import { LevelState } from '@/components/context/level-state';

const LevelCard = ({ level }: { level: LevelState }) => (
  <Link href={`/play/${level.id}`}>
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-3 flex items-center flex-col">
          <h2 className="card-title text-3xl">Level {level.id}</h2>
          <LevelSvg level={level} zoom={2} />
          <p>Best solution: 0/0</p>
        </div>
      </div>
    </div>
  </Link>
);

export default LevelCard;
