/* import * as dotenv from 'dotenv';
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
import { Solver } from './../target/types/solver';

// Configure Anchor to use the local cluster.
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const connection = provider.connection;

// Access the program via workspace.
const createNft = anchor.workspace.Minter as Program<Minter>;
const solver = anchor.workspace.Solver as Program<Solver>;

const lamports = 10 * LAMPORTS_PER_SOL;
const game_authority = Keypair.generate();
let creator_user = Keypair.generate();
let player_user = Keypair.generate();
const compteurAccount = Keypair.generate();
const nftAccount = Keypair.generate();
let gamePDA = Keypair.generate().publicKey;

let bump: number;

const mapData = Buffer.from([
  1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 1, 1, 0, 3, 0, 0, 1, 1, 0,
  0, 4, 0, 1, 1, 1, 1, 1, 1, 1,
]);
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

function displayBestSoluce(directions: ArrayBuffer) {
  console.log('Best soluce:');
  let line = ' ';
  for (let i = 0; i < directions.byteLength; i++) {
    line += directions[i];
    line += '-';
  }
  console.log(line);
}

async function initWallet() {
  creator_user = Keypair.generate();
  player_user = Keypair.generate();
  let tx = await connection.requestAirdrop(creator_user.publicKey, lamports);
  tx = await connection.requestAirdrop(player_user.publicKey, lamports);
  tx = await connection.requestAirdrop(game_authority.publicKey, lamports);
  await connection.confirmTransaction(tx);
}

async function main() {
  await initWallet();
  let tx = await createNft.methods
    .initializeNftId()
    .accounts({
      nftIdCounter: compteurAccount.publicKey,
      user: game_authority.publicKey,
    })
    .signers([compteurAccount, game_authority])
    .rpc();

  console.log('initialisation ok');

  tx = await createNft.methods
    .createNft(width, height, mapData)
    .accounts({
      nftAccount: nftAccount.publicKey,
      nftIdCounter: compteurAccount.publicKey,
      user: creator_user.publicKey,
    })
    .signers([nftAccount, creator_user])
    .rpc();

  console.log('creation du nft Ok');

  const nftAccountInfo = await createNft.account.nftAccount.fetch(
    nftAccount.publicKey
  );
  console.log('id= ', nftAccountInfo.id);
  displayMapData(nftAccountInfo.data);

  // ********************************************** Initialisation du solver et Vérificaiton d'une solution ******************************************

  //Création de la seed du PDA
  const id_nft = 1;
  const idBytes = new Uint8Array(new Uint32Array([id_nft]).buffer);
  const seeds = Buffer.concat([Buffer.from('Game'), idBytes]);

  //Récupération de l'adresse du PDA associé à id_nft
  [gamePDA, bump] = await PublicKey.findProgramAddress(
    [seeds],
    solver.programId
  );

  //Affichag des balance du signer et du PDA avant la demande de solve
  let balanceUser = await provider.connection.getBalance(player_user.publicKey);
  let balancePda = await provider.connection.getBalance(gamePDA);
  console.log('BalancePDA', balancePda);
  console.log('BalanceUser', balanceUser);

  tx = await solver.methods
    .initialize(id_nft)
    .accounts({
      gameState: gamePDA,
      otherData: nftAccount.publicKey,
      signer: game_authority.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([game_authority])
    .rpc();

  let updatedGame = await solver.account.gameState.fetch(gamePDA);
  console.log('solved = ', updatedGame.solved);
  console.log('id_nft=', updatedGame.idNft);
  console.log('Pubkey du owner du nft', updatedGame.nftOwner);

  //Demande de résolution d'une séquence de mouvement
  const moveSequence = Buffer.from([3, 1, 3, 2, 1, 2, 3]);

  tx = await solver.methods
    .solve(id_nft, moveSequence)
    .accounts({
      game: gamePDA,
      otherData: nftAccount.publicKey,
      signer: player_user.publicKey,
    })
    .signers([player_user])
    .rpc();

  //Affichage des éléments du PDA pour vérification
  updatedGame = await solver.account.gameState.fetch(gamePDA);
  console.log('solved = ', updatedGame.solved);
  displayBestSoluce(updatedGame.bestSoluce);
  console.log('longueur best soluce=', updatedGame.bestSoluce.length);
  console.log('Pubkey best soluce', updatedGame.leader);

  // Affichage des balances arpès la résolution
  balancePda = await provider.connection.getBalance(gamePDA);
  balanceUser = await provider.connection.getBalance(player_user.publicKey);
  console.log('Balance du PDA:', balancePda);
  console.log('Balance du user:', balanceUser);

  // Claim de la cagnotte par le leader du niveau
  tx = await solver.methods
    .claim()
    .accounts({
      game: gamePDA,
      signer: player_user.publicKey,
    })
    .signers([player_user])
    .rpc();

  console.log('Claim Ok');
  balancePda = await provider.connection.getBalance(gamePDA);
  balanceUser = await provider.connection.getBalance(player_user.publicKey);
  console.log('Balance du PDA:', balancePda);
  console.log('Balance du user:', balanceUser);
}

main().catch((err) => {
  console.error(err);
}); */

export * from './minter-exports';
