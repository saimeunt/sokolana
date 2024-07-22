import { publicKey } from './../node_modules/@solana/buffer-layout-utils/src/web3';
import { closeAccountInstructionData } from './../node_modules/@solana/spl-token/src/instructions/closeAccount';
import { MetadataPointer } from './../node_modules/@solana/spl-token/src/extensions/metadataPointer/state';
import * as anchor from '@coral-xyz/anchor';

import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Keypair, Connection,PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { Minter } from '../target/types/minter';

const connection = new Connection('http://localhost:8899', 'confirmed');
const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const minter = anchor.workspace.Minter as anchor.Program<Minter>;

   // Generate a keypair to use as the address of our mint account
   const mintKeypair = new Keypair();

   // Derive the associated token address account for the mint and payer.
   

  // The metadata for our NFT
  const metadata = {
    name: 'Homer NFT',
    symbol: 'HOMR',
    uri: 'https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/nft.json',
   
  };

  const lamports = 10 * LAMPORTS_PER_SOL;
  let game_authority = Keypair.generate();
  let  creator_user =Keypair.generate();
  let  player_user =Keypair.generate();
  let  counterAccount = Keypair.generate();
  let nftAccount2 = Keypair.generate();
  let  hashAccount = Keypair.generate();
  let associatedTokenAccountAddress = getAssociatedTokenAddressSync(mintKeypair.publicKey, creator_user.publicKey);


  let id_nft = 1;
const mapData = Buffer.from( [1, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 0, 1,
  1, 2, 0, 0, 0, 1,
  1, 0, 3, 0, 0, 1,
  1, 0, 0, 4, 0, 1,
  1, 1 ,1 ,1, 1, 1]); 
const width = 6;
const height = 6;

async function getMetadataAddress(mintPublicKey) {
  // Le programme ID du programme de métadonnées de Metaplex
  const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  // Adresse du compte de métadonnées
  const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
          Buffer.from('metadata'),
          METAPLEX_PROGRAM_ID.toBuffer(),
          mintPublicKey.toBuffer()
      ],
      METAPLEX_PROGRAM_ID,
  );

  return metadataAddress;
}


async function fetchMetadata(c:Connection, metadataAddress:PublicKey) {
  const metadataAccount = await connection.getAccountInfo(metadataAddress);
  if (metadataAccount === null) {
      throw new Error('Metadata account not found');
  }

  return metadata;
}


async function initWallet() {

    game_authority = Keypair.generate();
    creator_user =Keypair.generate();
    player_user =Keypair.generate();
    counterAccount = Keypair.generate();
    nftAccount2 = Keypair.generate();
    hashAccount = Keypair.generate();
    associatedTokenAccountAddress = getAssociatedTokenAddressSync(mintKeypair.publicKey, creator_user.publicKey);

    
    let tx = await connection.requestAirdrop(creator_user.publicKey, lamports);
    tx = await connection.requestAirdrop(player_user.publicKey, lamports);
    tx = await connection.requestAirdrop(game_authority.publicKey, lamports);
    await connection.confirmTransaction(tx);
    
  }

async function initNft() {
  
  let tx =  await minter.methods
      .initializeHashStorage()
      .accounts({
          hashStorage :hashAccount.publicKey,
          user: game_authority.publicKey,
      })
      .signers([ game_authority, hashAccount])
      .rpc();

    tx =  await minter.methods
       .initializeNftId()
       .accounts({
            nftIdCounter:counterAccount.publicKey,
            user: game_authority.publicKey,
       })
      .signers([counterAccount,  game_authority])
      .rpc();

}


async function createNFT() {

  let tx = await minter.methods
     .createNft(width, height, mapData)
     .accounts({
         nftAccount: nftAccount2.publicKey,
         hashStorage: hashAccount.publicKey,
         nftIdCounter: counterAccount.publicKey,
         user: creator_user.publicKey,
     })
     .signers([nftAccount2, creator_user])
     .rpc();

     console.log("Creation NFT OK");
}



describe('NFT Minter', () => {
  
  it('Create an NFT!', async () => {
   
    await initWallet();
    await initNft();
    await createNFT();

    const transactionSignature = await minter.methods
      .mintNft(metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        payer: creator_user.publicKey,
        mintAccount: mintKeypair.publicKey,
        nftAccount: nftAccount2.publicKey,
        associatedTokenAccount: associatedTokenAccountAddress,
           
      })
      .signers([mintKeypair, creator_user])
      .rpc();

    console.log('Success!');
    console.log(`   Mint Address: ${mintKeypair.publicKey.toBase58()}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);

    let hashdata = await minter.account.hashStorage.fetch(hashAccount.publicKey);
    // console.log(hashdata.dataHashes.length);

    let nftIdCounter = await minter.account.counter.fetch(counterAccount.publicKey);
    // console.log(nftIdCounter.count);

    let nftAccount = await minter.account.nftAccount.fetch(nftAccount2.publicKey);
    // console.log(nftAccount.width);

    const metadataAdress = await getMetadataAddress(mintKeypair.publicKey);
    console.log("Addresse des metadatas : ", metadataAdress.toBase58());
    const data = await fetchMetadata(connection, metadataAdress);
    console.log("Metadata :", data);


  });


});