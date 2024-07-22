'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { AppHero } from '../ui/ui-layout';
import { defaultEditorLevel } from '@/lib/levels';
import { Keypair } from '@solana/web3.js';
import LevelView from './level-view';
import { useLocalStorage } from 'usehooks-ts';
import useContext from '@/components/context/hook';
import { PlayLevelUiModal } from './play-level-ui';
import {
  isFinished,
  getMoves,
  getPushes,
  accountToLevelData,
  accountToSolution,
  loadLevel,
} from '@/components/context/level-state';
import { useMinterProgram } from '@/lib/minter-data-access';
import { useSolverProgram, getGameAccount } from '@/lib/solver-data-access';

const PlayLevelFeature = ({ id }: { id: string }) => {
  const { publicKey } = useWallet();
  const { nftAccounts, mintNft } = useMinterProgram();
  const { gameStateAccounts, claim } = useSolverProgram();
  const [showModal, setShowModal] = useState(false);
  const {
    state: { level },
  } = useContext();
  const [editorLevelData] = useLocalStorage('editor-level', defaultEditorLevel);
  const isEditor = id === 'editor';
  if (
    nftAccounts.isLoading ||
    !nftAccounts.data ||
    gameStateAccounts.isLoading ||
    !gameStateAccounts.data
  ) {
    return null;
  }
  const nftAccount = nftAccounts.data.find(
    ({ account }) => account.id === Number(id)
  );
  if (!isEditor && !nftAccount) {
    return null;
  }
  const accountLevelData = nftAccount
    ? accountToLevelData(nftAccount.account)
    : '';
  const levelData = isEditor ? editorLevelData : accountLevelData;
  const gameStateAccount = gameStateAccounts.data.find(
    ({ account }) => account.idNft === Number(id)
  );
  const bestSolution = gameStateAccount
    ? accountToSolution(
        loadLevel('id', levelData),
        gameStateAccount.account.bestSoluce
      )
    : [];
  const hasOwnerRewards = () => {
    if (!gameStateAccount || !nftAccount || !publicKey) {
      return false;
    }
    return (
      nftAccount.account.owner.equals(publicKey) &&
      BigInt(gameStateAccount.account.ownerRewardBalance.toString()) > BigInt(0)
    );
  };
  const hasLeaderRewards = () => {
    if (!gameStateAccount || !publicKey) {
      return false;
    }
    return (
      gameStateAccount.account.leader.equals(publicKey) &&
      BigInt(gameStateAccount.account.leaderRewardBalance.toString()) >
        BigInt(0)
    );
  };
  const hasRewards = hasOwnerRewards() || hasLeaderRewards();
  return (
    <div>
      <AppHero
        title={`Level ${id}`}
        subtitle={`Best solution: ${getMoves(bestSolution)}/${getPushes(
          bestSolution
        )}`}
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
              <div className="space-x-6">
                {hasRewards && (
                  <button
                    className="btn btn-accent"
                    onClick={() => {
                      claim.mutateAsync({ game: getGameAccount(Number(id)) });
                    }}
                  >
                    Claim rewards
                  </button>
                )}
                {isFinished(level) && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowModal(true)}
                    >
                      Submit solution
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={async () => {
                        if (!nftAccount) {
                          return;
                        }
                        const mintAccount = Keypair.generate();
                        await mintNft.mutateAsync({
                          nftName: `Solution for level ${id}`,
                          nftSymbol: `LVL${id}`,
                          nftUri: new URL(
                            `/api/tokens?id=${id}&solution=${level.solution.join(
                              ''
                            )}`,
                            'http://localhost:3000'
                          ).href,
                          mintAccount,
                          nftAccount: nftAccount.publicKey,
                        });
                      }}
                    >
                      Mint solution
                    </button>
                  </>
                )}
              </div>
            )}
            <p>
              Moves/Pushes {getMoves(level.solution)}/
              {getPushes(level.solution)}
            </p>
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
