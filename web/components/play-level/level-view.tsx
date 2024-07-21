import { useEffect } from 'react';
import useContext from '@/components/context/hook';
import { useIsClient } from 'usehooks-ts';
import LevelSvg from '../ui/level-svg';
import KeyboardHandler from './keyboard-handler';

const LevelView = ({ id, levelData }: { id: string; levelData: string }) => {
  const {
    state: { level },
    loadLevel,
  } = useContext();
  useEffect(
    () => loadLevel(id, levelData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelData]
  );
  const isClient = useIsClient();
  return (
    <>
      <LevelSvg level={level} />
      {isClient && <KeyboardHandler />}
    </>
  );
};

export default LevelView;
