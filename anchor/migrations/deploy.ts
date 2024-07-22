// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Minter } from '../target/types/minter';
import { Solver } from '../target/types/solver';
import { levels } from './levels';

/* const levels = [
  `#####
#@$.#
#####`,
]; */

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
  const ownerAccount = Keypair.generate();
  const creatorAccount = Keypair.generate();
  const playerAccount = Keypair.generate();
  const nftIdCounterAccount = Keypair.generate();
  const hashStorageAccount = Keypair.generate();
  let tx = await provider.connection.requestAirdrop(
    ownerAccount.publicKey,
    lamports
  );
  await provider.connection.confirmTransaction(tx);
  console.log('owner airdropped');
  tx = await provider.connection.requestAirdrop(
    creatorAccount.publicKey,
    lamports
  );
  await provider.connection.confirmTransaction(tx);
  console.log('creator airdropped');
  tx = await provider.connection.requestAirdrop(
    playerAccount.publicKey,
    lamports
  );
  await provider.connection.confirmTransaction(tx);
  console.log('player airdropped');
  // Add your deploy script here.
  const minter = anchor.workspace.Minter as Program<Minter>;
  const solver = anchor.workspace.Solver as Program<Solver>;
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
    tx = await solver.methods
      .initialize(id)
      .accounts({
        otherData: nftAccount.publicKey,
        signer: ownerAccount.publicKey,
      })
      .signers([ownerAccount])
      .rpc();
    await provider.connection.confirmTransaction(tx);
    console.log(`level solver ${id} initialized`);
    /* const [game] = PublicKey.findProgramAddressSync(
      [
        Buffer.concat([
          Buffer.from('Game'),
          new Uint8Array(new Uint32Array([id]).buffer),
        ]),
      ],
      solver.programId
    );
    tx = await solver.methods
      .solve(Buffer.from([2]))
      .accounts({
        game,
        otherData: nftAccount.publicKey,
        signer: playerAccount.publicKey,
      })
      .signers([playerAccount])
      .rpc();
    await provider.connection.confirmTransaction(tx); */
    /* const mintAccount = Keypair.generate();
    tx = await minter.methods
      .mintNft(`Level ${id}`, `LVL${id}`, 'http://example.com')
      .accounts({
        mintAccount: mintAccount.publicKey,
        nftAccount: nftAccount.publicKey,
        payer: creatorAccount.publicKey,
      })
      .signers([mintAccount, creatorAccount])
      .rpc();
    await provider.connection.confirmTransaction(tx);
    console.log(`level nft ${id} minted`); */
    id++;
  }
};
