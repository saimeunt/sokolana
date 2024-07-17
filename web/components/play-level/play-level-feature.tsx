import { useEffect, useState } from 'react';
import { AppHero } from '../ui/ui-layout';
import { levels } from '@/lib/levels';
import LevelView from './level-view';
import KeyboardHandler from './keyboard-handler';
import { useIsClient } from 'usehooks-ts';
import useContext from './context/hook';
import { PlayLevelUiModal } from './play-level-ui';
import { isFinished, getMoves, getPushes } from './context/level-state';

const PlayLevelFeature = ({ id }: { id: string }) => {
  const [showModal, setShowModal] = useState(false);
  const {
    state: { level },
  } = useContext();
  const isClient = useIsClient();
  const finished = isFinished(level);
  useEffect(() => {
    if (finished) {
      setShowModal(true);
    }
  }, [finished]);
  return (
    <div>
      <AppHero
        title={`Level ${id}`}
        subtitle={`Moves/Pushes ${getMoves(level)}/${getPushes(level)}`}
      >
        <LevelView levelData={levels[Number(id)]} />
        <PlayLevelUiModal
          show={showModal}
          hideModal={() => setShowModal(false)}
        />
      </AppHero>
      {isClient && <KeyboardHandler />}
    </div>
  );
};

export default PlayLevelFeature;
