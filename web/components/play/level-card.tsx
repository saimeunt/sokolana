import Link from 'next/link';

const LevelCard = ({ level, id }: { level: string; id: number }) => (
  <div className="card card-bordered border-base-300 border-4 text-neutral-content">
    <div className="card-body items-center text-center">
      <div className="space-y-6">
        <Link href={`/play/${id}`}>
          <h2 className="card-title justify-center text-3xl">Level {id}</h2>
        </Link>
        <div className="text-center space-y-4">
          <p>Best solution: 0/0</p>
        </div>
      </div>
    </div>
  </div>
);

export default LevelCard;
