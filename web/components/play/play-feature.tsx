'use client';
import { AppHero } from '../ui/ui-layout';
// import { levels as levelsData } from '@/lib/levels';
import LevelsView from './levels-view';
import { useMinterProgram } from '@/lib/minter-data-access';
import {
  accountToLevel,
  // loadLevel
} from '@/components/context/level-state';

const PlayFeature = () => {
  const { nftAccounts } = useMinterProgram();
  if (nftAccounts.isLoading || !nftAccounts.data) {
    return null;
  }
  const levels = nftAccounts.data.map(({ account }) => accountToLevel(account));
  /*const levels = levelsData.map((levelData, index) =>
    loadLevel(index.toString(), levelData)
  );*/
  return (
    <div>
      <AppHero title="Play" subtitle="Choose a level to get started">
        <LevelsView
          levels={levels.sort((a, b) => Number(a.id) - Number(b.id))}
        />
      </AppHero>
    </div>
  );
};

export default PlayFeature;
