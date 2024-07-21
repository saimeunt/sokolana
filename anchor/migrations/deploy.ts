// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { Minter } from '../target/types/minter';
import { levels } from './levels';

const lamports = 100 * LAMPORTS_PER_SOL;

const loadLevel = (levelData: string) => {
  const Cells = {
    ' ': 0,
    '#': 1,
    '@': 2,
    $: 3,
    '.': 4,
    '*': 5,
    '+': 6,
  } as const;
  const rows = levelData.split('\n').filter((row) => row !== '');
  const width = rows.reduce(
    (previousValue, row) => Math.max(previousValue, row.length),
    0
  );
  const data = rows
    .map((row) => row.padEnd(width, ' ').split(''))
    .reduce<number[]>(
      (previousValue, row) => [
        ...previousValue,
        ...row.map((cell) => Cells[cell]),
      ],
      []
    );
  return { width, height: rows.length, data };
};

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);
  const nftIdCounterAccount = Keypair.generate();
  const ownerAccount = Keypair.generate();
  const creatorAccount = Keypair.generate();
  const hashStorageAccount = Keypair.generate();
  let tx = await provider.connection.requestAirdrop(
    ownerAccount.publicKey,
    lamports
  );
  await provider.connection.confirmTransaction(tx);
  console.log('owner airdropped');
  // tx = await provider.connection.requestAirdrop(player_user.publicKey, lamports);
  tx = await provider.connection.requestAirdrop(
    creatorAccount.publicKey,
    lamports
  );
  await provider.connection.confirmTransaction(tx);
  console.log('creator airdropped');
  // Add your deploy script here.
  const minter = anchor.workspace.Minter as Program<Minter>;
  tx = await minter.methods
    .initializeNftId()
    .accounts({
      nftIdCounter: nftIdCounterAccount.publicKey,
      user: ownerAccount.publicKey,
    })
    .signers([nftIdCounterAccount, ownerAccount])
    .rpc();
  await provider.connection.confirmTransaction(tx);
  console.log('nft_id_counter initialized');
  //
  tx = await minter.methods
    .initializeHashStorage()
    .accounts({
      hashStorage: hashStorageAccount.publicKey,
      user: ownerAccount.publicKey,
    })
    .signers([hashStorageAccount, ownerAccount])
    .rpc();
  await provider.connection.confirmTransaction(tx);
  console.log('hash_storage initialized');
  let id = 1;
  for (const levelData of levels) {
    const { width, height, data } = loadLevel(levelData);
    const nftAccount = Keypair.generate();
    tx = await minter.methods
      .createNft(height, width, Buffer.from(data))
      .accounts({
        nftAccount: nftAccount.publicKey,
        nftIdCounter: nftIdCounterAccount.publicKey,
        user: creatorAccount.publicKey,
        hashStorage: hashStorageAccount.publicKey,
      })
      .signers([nftAccount, creatorAccount])
      .rpc();
    await provider.connection.confirmTransaction(tx);
    console.log(`level ${id} minted`);
    id++;
  }
};
