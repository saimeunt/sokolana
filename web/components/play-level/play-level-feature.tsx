'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AppHero } from '../ui/ui-layout';
import { defaultEditorLevel } from '@/lib/levels';
import LevelView from './level-view';
import { useLocalStorage } from 'usehooks-ts';
import useContext from '@/components/context/hook';
import { PlayLevelUiModal } from './play-level-ui';
import {
  isFinished,
  getMoves,
  getPushes,
  accountToLevelData,
} from '@/components/context/level-state';
import { useMinterProgram } from '@/lib/minter-data-access';

const PlayLevelFeature = ({ id }: { id: string }) => {
  const { nftAccounts } = useMinterProgram();
  const [showModal, setShowModal] = useState(false);
  const {
    state: { level },
  } = useContext();
  const [editorLevelData] = useLocalStorage('editor-level', defaultEditorLevel);
  const isEditor = id === 'editor';
  if (nftAccounts.isLoading || !nftAccounts.data) {
    return null;
  }
  const progamAccount = nftAccounts.data.find(
    ({ account }) => account.id === Number(id)
  );
  if (!isEditor && !progamAccount) {
    return null;
  }
  const accountLevelData = progamAccount
    ? accountToLevelData(progamAccount.account)
    : '';
  const levelData = isEditor ? editorLevelData : accountLevelData;
  return (
    <div>
      <AppHero
        title={`Level ${id}`}
        subtitle={`Moves/Pushes ${getMoves(level)}/${getPushes(level)}`}
      >
        <div className="space-y-4">
          <LevelView id={id} levelData={levelData} />
          <div className="space-y-1">
            {isEditor ? (
              <Link href={`/mint?solution=${level.solution.join('')}`}>
                <button className="btn btn-primary">
                  {isFinished(level) ? 'Ready to mint!' : 'Back to editor'}
                </button>
              </Link>
            ) : (
              isFinished(level) && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Submit solution
                </button>
              )
            )}
            <p>Move: Arrow Keys</p>
            <p>Undo: U</p>
            <p>Redo: R</p>
          </div>
        </div>
        <PlayLevelUiModal
          show={showModal}
          hideModal={() => setShowModal(false)}
        />
      </AppHero>
    </div>
  );
};

export default PlayLevelFeature;
