/*import * as dotenv from 'dotenv';
dotenv.config();

import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { Minter } from './../target/types/minter';

import { levelData, initLevel } from './read_level';

// Configure Anchor to use the local cluster.
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const connection = provider.connection;

// Access the program via workspace.
const createNft = anchor.workspace.Minter as Program<Minter>;

const lamports = 10 * LAMPORTS_PER_SOL;
const game_authority = Keypair.generate();
const creator_user = Keypair.generate();
const player_user = Keypair.generate();
const hashAccount = Keypair.generate();
const compteurAccount = Keypair.generate();
const nftAccount = Keypair.generate();

//let levelData: Buffer[] = [];
const width = 6;
const height = 6;

function displayMapData(mapData: ArrayBuffer) {
  console.log('Map data:');
  for (let i = 0; i < height; i++) {
    let line = '';
    for (let j = 0; j < width; j++) {
      line += mapData[i * width + j] + ' ';
    }
    console.log(line.trim());
  }
}

async function airDropWallet() {
  let tx = await connection.requestAirdrop(creator_user.publicKey, lamports);
  tx = await connection.requestAirdrop(player_user.publicKey, lamports);
  tx = await connection.requestAirdrop(game_authority.publicKey, lamports);
  await connection.confirmTransaction(tx);
}

async function initMinter() {
  await airDropWallet();
  let tx = await createNft.methods
    .initializeHashStorage()
    .accounts({
      hashStorage: hashAccount.publicKey,
      user: game_authority.publicKey,
    })
    .signers([game_authority, hashAccount])
    .rpc();

  console.log('initialisation HashStorage : ok');

  tx = await createNft.methods
    .initializeNftId()
    .accounts({
      nftIdCounter: compteurAccount.publicKey,
      user: game_authority.publicKey,
    })
    .signers([compteurAccount, game_authority])
    .rpc();

  console.log('initialisation id : ok');
}

async function mint(level: Buffer) {
  await initMinter();
  displayMapData(level);
  console.log('longueur', level.length);
  const tx = await createNft.methods
    .createNft(width, height, level)
    .accounts({
      nftAccount: nftAccount.publicKey,
      hashStorage: hashAccount.publicKey,
      nftIdCounter: compteurAccount.publicKey,
      user: creator_user.publicKey,
    })
    .signers([nftAccount, creator_user])
    .rpc();

  console.log('creation du nft Ok');
}

async function main() {
  initLevel();
  for (let i = 0; i < 10; i++) {
    await mint(levelData[i]);
  }
}

main().catch((err) => {
  console.error(err);
});*/
