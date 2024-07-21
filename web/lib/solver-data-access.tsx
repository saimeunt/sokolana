'use client';

import {
  getSolverProgram,
  getSolverProgramId,
  SOLVER_PROGRAM_ID,
} from '@sokolana/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../components/cluster/cluster-data-access';
import { useAnchorProvider } from '../components/solana/solana-provider';
import { useTransactionToast } from '../components/ui/ui-layout';

export const getGameAccount = (id: number) => {
  const [game] = PublicKey.findProgramAddressSync(
    [
      Buffer.concat([
        Buffer.from('Game'),
        new Uint8Array(new Uint32Array([id]).buffer),
      ]),
    ],
    SOLVER_PROGRAM_ID
  );
  return game;
};

export function useSolverProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getSolverProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getSolverProgram(provider);

  const gameStateAccounts = useQuery({
    queryKey: ['gameState', 'all', { cluster }],
    queryFn: () => program.account.gameState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['solver', 'initialize', { cluster }],
    mutationFn: ({
      idNft,
      otherData,
    }: {
      idNft: number;
      otherData: PublicKey;
    }) => program.methods.initialize(idNft).accounts({ otherData }).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return gameStateAccounts.refetch();
    },
    onError: () => toast.error('Failed to initialize solver'),
  });

  const solve = useMutation({
    mutationKey: ['solver', 'solve', { cluster }],
    mutationFn: ({
      directions,
      game,
      otherData,
    }: {
      directions: number[];
      game: PublicKey;
      otherData: PublicKey;
    }) =>
      program.methods
        .solve(Buffer.from(directions))
        .accounts({ game, otherData })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return gameStateAccounts.refetch();
    },
    onError: () => toast.error('Failed to solve'),
  });

  return {
    program,
    programId,
    gameStateAccounts,
    getProgramAccount,
    initialize,
    solve,
  };
}
