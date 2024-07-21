import { ImageResponse } from 'next/og';

import { LevelState, loadLevel } from '@/components/context/level-state';
import { levels } from '@/lib/levels';
import LevelSvg from '@/components/ui/level-svg';

const MetaImage = ({
  level,
  size: { width, height },
}: {
  level: LevelState;
  size: { width: number; height: number };
}) => {
  const horizontalRatio = Math.floor(width / (level.width * 8));
  const verticalRatio = Math.floor(height / (level.height * 8));
  const ratio = Math.min(horizontalRatio, verticalRatio);
  return <LevelSvg level={level} zoom={ratio} />;
};

export const size = { width: 1200, height: 630 };
export const alt = 'Sokolana Level';
export const contentType = 'image/png';

const handler = async ({ params: { id } }: { params: { id: string } }) => {
  const levelData = levels[Number(id)];
  const level = loadLevel(id, levelData);
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          ...size,
          justifyContent: 'center',
          alignItems: 'center',
          background: '#fff',
        }}
      >
        <MetaImage level={level} size={size} />
      </div>
    ),
    size
  );
};

export default handler;
