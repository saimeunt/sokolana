'use client';
import { AppHero } from '../ui/ui-layout';
import { levels as levelsData } from '@/lib/levels';
import { Input } from '@/lib/types';
import LevelsView from './levels-view';
//import { useMinterProgram } from '@/lib/minter-data-access';
import {
  //accountToLevel,
  //accountToSolution,
  loadLevel,
} from '@/components/context/level-state';
//import { useSolverProgram } from '@/lib/solver-data-access';

const PlayFeature = () => {
  /* const { nftAccounts } = useMinterProgram();
  const { gameStateAccounts } = useSolverProgram();
  if (
    nftAccounts.isLoading ||
    !nftAccounts.data ||
    gameStateAccounts.isLoading ||
    !gameStateAccounts.data
  ) {
    return null;
  }
  const levels = nftAccounts.data
    .sort((a, b) => a.account.id - b.account.id)
    .map(({ account }) => accountToLevel(account));
  const bestSolutions = gameStateAccounts.data
    .sort((a, b) => a.account.idNft - b.account.idNft)
    .map(({ account }) =>
      accountToSolution(levels[account.idNft - 1], account.bestSoluce)
    ); */
  const levels = levelsData.map((levelData, index) =>
    loadLevel(index.toString(), levelData)
  );
  const bestSolutions: Input[][] = [];
  return (
    <div>
      <AppHero title="Play" subtitle="Choose a level to get started">
        <LevelsView levels={levels} bestSolutions={bestSolutions} />
      </AppHero>
    </div>
  );
};

export default PlayFeature;
