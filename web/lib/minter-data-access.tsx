'use client';

import { getMinterProgram, getMinterProgramId } from '@sokolana/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../components/cluster/cluster-data-access';
import { useAnchorProvider } from '../components/solana/solana-provider';
import { useTransactionToast } from '../components/ui/ui-layout';

export function useMinterProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getMinterProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getMinterProgram(provider);

  const nftAccounts = useQuery({
    queryKey: ['nftAccount', 'all', { cluster }],
    queryFn: () => program.account.nftAccount.all(),
  });

  const counterAccounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.counter.all(),
  });

  const hashStorageAccounts = useQuery({
    queryKey: ['hashStorage', 'all', { cluster }],
    queryFn: () => program.account.hashStorage.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createNft = useMutation({
    mutationKey: ['minter', 'createNft', { cluster }],
    mutationFn: ({
      width,
      height,
      data,
      nftAccount,
      nftIdCounter,
      hashStorage,
    }: {
      width: number;
      height: number;
      data: number[];
      nftAccount: Keypair;
      nftIdCounter: PublicKey;
      hashStorage: PublicKey;
    }) =>
      program.methods
        .createNft(height, width, Buffer.from(data))
        .accounts({
          nftAccount: nftAccount.publicKey,
          nftIdCounter,
          hashStorage,
        })
        .signers([nftAccount])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return nftAccounts.refetch();
    },
    onError: () => toast.error('Failed to mint NFT'),
  });

  return {
    program,
    programId,
    nftAccounts,
    counterAccounts,
    hashStorageAccounts,
    getProgramAccount,
    createNft,
  };
}
