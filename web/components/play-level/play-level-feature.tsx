'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppHero } from '../ui/ui-layout';
import { defaultEditorLevel, levels } from '@/lib/levels';
import LevelView from './level-view';
import { useLocalStorage } from 'usehooks-ts';
import useContext from '@/components/context/hook';
import { PlayLevelUiModal } from './play-level-ui';
import {
  isFinished,
  getMoves,
  getPushes,
} from '@/components/context/level-state';

const PlayLevelFeature = ({ id }: { id: string }) => {
  const [showModal, setShowModal] = useState(false);
  const {
    state: { level },
  } = useContext();
  const finished = isFinished(level);
  console.log('play level finished', finished);
  useEffect(() => {
    if (finished) {
      setShowModal(true);
    }
  }, [finished]);
  const [editorLevelData] = useLocalStorage('editor-level', defaultEditorLevel);
  const isEditor = id === 'editor';
  const levelData = isEditor ? editorLevelData : levels[Number(id)];
  return (
    <div>
      <AppHero
        title={`Level ${id}`}
        subtitle={`Moves/Pushes ${getMoves(level)}/${getPushes(level)}`}
      >
        <div className="space-y-4">
          <LevelView levelData={levelData} />
          <div className="space-y-1">
            {isEditor && (
              <Link href="/mint">
                <button className="btn btn-primary">Back to editor</button>
              </Link>
            )}
            {!isEditor && isFinished(level) && (
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                Submit solution
              </button>
            )}
            <p>Move: Arrow Keys</p>
            <p>Undo: U</p>
            <p>Redo: R</p>
          </div>
        </div>
        <PlayLevelUiModal
          isEditor={isEditor}
          show={showModal}
          hideModal={() => setShowModal(false)}
        />
      </AppHero>
    </div>
  );
};

export default PlayLevelFeature;
