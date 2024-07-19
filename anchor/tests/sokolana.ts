import { Minter } from './../target/types/minter';

import { Solver } from './../target/types/solver';


import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { decodeUpgradeableLoaderState } from '@coral-xyz/anchor/dist/cjs/utils/registry';

import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as assert from "assert";




const solver = anchor.workspace.Solver as Program<Solver>;
const createNft =  anchor.workspace.Minter as Program<Minter>;

const connection = new Connection('http://localhost:8899', 'confirmed');
const provider = anchor.AnchorProvider.env();
anchor.setProvider(anchor.AnchorProvider.env());

const lamports = 10 * LAMPORTS_PER_SOL;
let game_authority = Keypair.generate();
let creator_user =Keypair.generate();
let player_user =Keypair.generate();
let compteurAccount = Keypair.generate();
let nftAccount = Keypair.generate();
let gamePDA = Keypair.generate().publicKey;
let hashAccount = Keypair.generate();

let bump:number;

let id_nft = 1;
const mapData = Buffer.from( [1, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 0, 1,
  1, 2, 0, 0, 0, 1,
  1, 0, 3, 0, 0, 1,
  1, 0, 0, 4, 0, 1,
  1, 1 ,1 ,1, 1, 1]); 
const width = 6;
const height = 6;


function displayMapData(mapData:ArrayBuffer) {
  console.log("Map data:");
  for (let i = 0; i < height; i++) {
    let line = "";
    for (let j = 0; j < width; j++) {
      line += mapData[i * width + j] + " ";
    }
    console.log(line.trim());
  }

}

function displayBestSoluce(directions:ArrayBuffer) {
  console.log("Best soluce:");
  let line = " "
  for (let i = 0; i < directions.byteLength; i++) {
    line  += directions[i]
    line += "-";
   }
   console.log(line);

}

async function initWallet() {

  //const balance = await provider.connection.getBalance(gamePDA);
  //nftAccount = Keypair.generate();
 
  creator_user =Keypair.generate();
  player_user =Keypair.generate();
  let tx = await connection.requestAirdrop(creator_user.publicKey, lamports);
  tx = await connection.requestAirdrop(player_user.publicKey, lamports);
  tx = await connection.requestAirdrop(game_authority.publicKey, lamports);
  await connection.confirmTransaction(tx);
  
}

async function createNFT() {

  // initWallet();
  hashAccount = Keypair.generate();

  let tx =  await createNft.methods
  .initializeNftId()
  .accounts({
  nftIdCounter:compteurAccount.publicKey,
  user: game_authority.publicKey,
  })
  .signers([compteurAccount,  game_authority])
  .rpc();

      tx =  await createNft.methods
          .initializeNftId()
          .accounts({
          nftIdCounter:compteurAccount.publicKey,
          user: game_authority.publicKey,
          })
          .signers([compteurAccount, hashAccount, game_authority ])
          .rpc();

      tx = await createNft.methods
      .createNft(width, height, mapData)
      .accounts({
            nftAccount: nftAccount.publicKey,
            nftIdCounter: compteurAccount.publicKey,
            hashStorage: hashAccount.publicKey,
            user: creator_user.publicKey,
      })
      .signers([nftAccount, creator_user, hashAccount])
      .rpc();
}

async function initializeSolverPda(id:number) {

  id_nft = id; 
  const idBytes = new Uint8Array(new Uint32Array([id_nft]).buffer);
  const seeds = 
  Buffer.concat([
      Buffer.from('Game'), 
      idBytes,              
  ]);

  //Récupération de l'adresse du PDA associé à id_nft
  [gamePDA, bump] = await PublicKey.findProgramAddress(
      [seeds],
      solver.programId
  );


}



  describe("MinterNft Program", () => {

    it("HashData NFT Initialisation !", async () => {
      
      await initWallet();
      let tx =  await createNft.methods
         .initializeHashStorage()
         .accounts({
         hashStorage :hashAccount.publicKey,
         // hashStorage: hashAccount.publicKey,
         user: game_authority.publicKey,
         })
         .signers([ game_authority, hashAccount])
         .rpc();

      let hashdata = await createNft.account.hashStorage.fetch(hashAccount.publicKey);
      assert.equal(hashdata.dataHashes.length, 0);
   
    }); 

    it("Counter NFT Initialisation !", async () => {
      
      let tx =  await createNft.methods
          .initializeNftId()
          .accounts({
          nftIdCounter:compteurAccount.publicKey,
          user: game_authority.publicKey,
          })
          .signers([compteurAccount,  game_authority])
          .rpc();

      let compteur = await createNft.account.counter.fetch(compteurAccount.publicKey);
      assert.equal(compteur.count, 0);
    });

    it("Should catch error : Wrong Dymension", async () => {

      let wrongWidth = 4;
      try {
        let tx = await createNft.methods
        .createNft(wrongWidth, height, mapData)
        .accounts({
            nftAccount: nftAccount.publicKey,
            hashStorage: hashAccount.publicKey,
            nftIdCounter: compteurAccount.publicKey,
            user: creator_user.publicKey,
        })
        .signers([nftAccount, creator_user])
        .rpc();
        // Si aucune erreur n'est lancée, échouez le test
        assert.fail("Expected an error but none was thrown");
      } catch (err) {
        
        assert.equal(err.error.errorCode.code, "WrongDymension");
        assert.equal(err.error.errorMessage, "Width * height does not mathc data.len");
       
      }
      
    });

    it("Creation d'un NFT !", async () => {

      let tx = await createNft.methods
      .createNft(width, height, mapData)
      .accounts({
            nftAccount: nftAccount.publicKey,
            hashStorage: hashAccount.publicKey,
            nftIdCounter: compteurAccount.publicKey,
            user: creator_user.publicKey,
      })
      .signers([nftAccount, creator_user])
      .rpc();
    
      let nftAccountInfo = await createNft.account.nftAccount.fetch(nftAccount.publicKey);
      assert.equal(nftAccountInfo.owner.toString(), creator_user.publicKey.toString());
      assert.equal(nftAccountInfo.id, 1);
      assert.equal(nftAccountInfo.height, height);
      assert.equal(nftAccountInfo.width, width);
      assert.deepEqual(nftAccountInfo.data, mapData);
    });
  
 

  it("Should not create the NFT cause of duplicate !", async () => {

    
    try {
    let newNftAccount = Keypair.generate();
    let tx = await createNft.methods
    .createNft(width, height, mapData)
    .accounts({
          nftAccount: newNftAccount.publicKey,
          hashStorage: hashAccount.publicKey,
          nftIdCounter: compteurAccount.publicKey,
          user: creator_user.publicKey,
    })
    .signers([newNftAccount, creator_user])
    .rpc();
  } catch (err) {
    
    assert.equal(err.error.errorCode.code, "DataAlreadyExists");
    assert.equal(err.error.errorMessage, "This map already exist");
   
  }
  
   
  });

  it("Should increase the counter !", async () => {

    let newNftAccount = Keypair.generate();
    const mapData2 = Buffer.from( [1, 1, 1, 1, 1, 1,
      1, 0, 0, 0, 0, 1,
      1, 2, 0, 1, 0, 1,
      1, 0, 3, 0, 0, 1,
      1, 0, 0, 4, 0, 1,
      1, 1 ,1 ,1, 1, 1]); 
    const width = 6;
    const height = 6;
    let tx = await createNft.methods
      .createNft(width, height, mapData2)
      .accounts({
            nftAccount: newNftAccount.publicKey,
            hashStorage: hashAccount.publicKey,
            nftIdCounter: compteurAccount.publicKey,
            user: creator_user.publicKey,
      })
      .signers([newNftAccount, creator_user])
      .rpc();
    
      let nftAccountInfo = await createNft.account.nftAccount.fetch(newNftAccount.publicKey);
      
      // assert.equal(nftAccountInfo.owner.toString(), creator_user.publicKey.toString());
      assert.equal(nftAccountInfo.id, 2);
      // assert.equal(nftAccountInfo.height, height);
      // assert.equal(nftAccountInfo.width, width);
      // assert.deepEqual(nftAccountInfo.data, mapData);
    });
  
   
  });

  describe("Solver Program", () => {
      
     
    it("Solver initialisation !", async () => {
    
        createNFT();
        initializeSolverPda(1);

        let tx = await solver.methods
          .initialize(id_nft)
          .accounts({
             game : gamePDA,
             otherData: nftAccount.publicKey,
             signer: game_authority.publicKey,
        })
          .signers([game_authority])
         .rpc();

      

        let updatedGame = await solver.account.gameState.fetch(gamePDA);
        assert.equal(updatedGame.nftOwner.toString(), creator_user.publicKey.toString());
        assert.equal(updatedGame.idNft, 1);
        assert.equal(updatedGame.leader.toString(), "11111111111111111111111111111111");
        assert.equal(updatedGame.solved, false);
        assert.equal(updatedGame.leaderRewardBalance, 0);
        assert.equal(updatedGame.ownerRewardBalance, 0);
       
      });


    it("Should catch error : PDA & id_NFT not associated !", async () => {
    
        createNFT();
        initializeSolverPda(1);

        let wrong_id_nft = 2;
        try {
        let tx = await solver.methods
          .initialize(wrong_id_nft)
          .accounts({
             game : gamePDA,
             otherData: nftAccount.publicKey,
             signer: game_authority.publicKey,
        })
          .signers([game_authority])
          .rpc();
           // Si aucune erreur n'est lancée, échouez le test
        assert.fail("Expected an error but none was thrown");
        } catch (err) {
            assert.equal(err.error.errorCode.code, "WrongNftId");
            assert.equal(err.error.errorMessage, "Wrong NFT Id.");
      
        }
       
       
    });

    
    it("Verify sequence !", async () => {

        //Demande de résolution d'une séquence de mouvement 
        const moveSequence = Buffer.from( [3,1,3, 2,1,2,3]);
        initializeSolverPda(1);

        let tx = await solver.methods
        .solve(moveSequence)
        .accounts({
          game : gamePDA,
          otherData: nftAccount.publicKey,
          signer: player_user.publicKey,
        })
        .signers([player_user])
        .rpc();

      
        let updatedGame = await solver.account.gameState.fetch(gamePDA);
        assert.equal(updatedGame.leader.toString(), player_user.publicKey);
        assert.equal(updatedGame.solved, true);
        assert.deepEqual(updatedGame.bestSoluce, moveSequence);
        assert.equal(updatedGame.leaderRewardBalance, 500000);
        assert.equal(updatedGame.ownerRewardBalance, 500000);
    
    });

    it("Sovler Leader Claim !", async () => {

    let balancePda = await provider.connection.getBalance(gamePDA);
    let balanceUser = await provider.connection.getBalance(player_user.publicKey);
    let game = await solver.account.gameState.fetch(gamePDA);

    
    // Claim de la cagnotte par le leader du niveau    
    let tx = await solver.methods
    .claim() 
    .accounts({
          game : gamePDA,
          signer: player_user.publicKey,
    })
    .signers([player_user])
    .rpc();
    
    let balancePdaAfter = await provider.connection.getBalance(gamePDA);
    let balanceUserAfter = await provider.connection.getBalance(player_user.publicKey);
    let updatedGame = await solver.account.gameState.fetch(gamePDA);
    assert.equal(updatedGame.leaderRewardBalance, 0);
    assert.equal(updatedGame.ownerRewardBalance, 500000);
    assert.equal(balancePdaAfter, balancePda-500000);
    assert.equal(balanceUserAfter, balanceUser+500000);
    
   

  });

  it("Nft Owner Claim !", async () => {

    let balancePda = await provider.connection.getBalance(gamePDA);
    let balanceUser = await provider.connection.getBalance(creator_user.publicKey);
   
    // Claim de la cagnotte par le leader du niveau    
    let tx = await solver.methods
    .claim() 
    .accounts({
          game : gamePDA,
          signer: creator_user.publicKey,
    })
    .signers([creator_user])
    .rpc();
    
    let balancePdaAfter = await provider.connection.getBalance(gamePDA);
    let balanceUserAfter = await provider.connection.getBalance(creator_user.publicKey);
    let updatedGame = await solver.account.gameState.fetch(gamePDA);
    assert.equal(updatedGame.leaderRewardBalance, 0);
    assert.equal(updatedGame.ownerRewardBalance, 0);
    assert.equal(balancePdaAfter, balancePda-500000);
    assert.equal(balanceUserAfter, balanceUser+500000);
   

  });

  it("Claim Attempt by random address !", async () => {

    try {
      // Tentative de claim par une adresse non autorisée
    // Claim de la cagnotte par le leader du niveau    
    let tx = await solver.methods
    .claim() 
    .accounts({
          game : gamePDA,
          signer: game_authority.publicKey,
    })
    .signers([game_authority])
    .rpc();
    
      // Si aucune erreur n'est lancée, échouez le test
      assert.fail("Expected an error but none was thrown");
    } catch (err) {
      
      assert.equal(err.error.errorCode.code, "NotAuthorized");
      assert.equal(err.error.errorMessage, "Not Authorized.");
     
    }
   

  });

  
});

 
  