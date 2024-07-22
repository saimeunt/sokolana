import { Minter } from './../target/types/minter';
import { Solver } from './../target/types/solver';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptAccountWithExtensions } from '@solana/spl-token';
import * as assert from "assert";


let solver = anchor.workspace.Solver as Program<Solver>;
let minter =  anchor.workspace.Minter as Program<Minter>;
const { BN } = anchor.BN; 

const connection = new Connection('http://localhost:8899', 'confirmed');
const provider = anchor.AnchorProvider.env();
anchor.setProvider(anchor.AnchorProvider.env());

//Déclaration des comptes nécessaires
const lamports = 10 * LAMPORTS_PER_SOL;
const fee = LAMPORTS_PER_SOL / 1000; 
let game_authority = Keypair.generate();
let creator_user =Keypair.generate();
let player_user =Keypair.generate();
let counterAccount = Keypair.generate();
let nftAccount2 = Keypair.generate();
let gamePDA = Keypair.generate().publicKey;
let hashAccount = Keypair.generate();
const mintKeypair = new Keypair();
let bump:number;
let associatedTokenAccountAddress = getAssociatedTokenAddressSync(mintKeypair.publicKey, creator_user.publicKey);

//Déclaration des données pour la création d'un NFT
let id_nft = 1;
const metadata = {
    name: 'Level 1',
    symbol: 'LVL1',
    uri: 'https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/nft.json',
   
  };


const mapData = Buffer.from( [1, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 0, 1,
  1, 2, 0, 0, 0, 1,
  1, 0, 3, 0, 0, 1,
  1, 0, 0, 4, 0, 1,
  1, 1 ,1 ,1, 1, 1]); 
const width = 6;
const height = 6;


/* ************************************************************** Fonction d'affichage pour les Vec de mapData et de Soluce ****************************** */
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

/**************************************************************** Fixture pour les tests ***************************************************************************  */

async function initProgram() {
  solver = anchor.workspace.Solver as Program<Solver>;
  minter =  anchor.workspace.Minter as Program<Minter>;

}

async function initWallet() {

  game_authority = Keypair.generate();
  creator_user =Keypair.generate();
  player_user =Keypair.generate();
  counterAccount = Keypair.generate();
  nftAccount2 = Keypair.generate();
  gamePDA = Keypair.generate().publicKey;
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
}


async function getMetadataAddress(mintPublicKey:PublicKey) {
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


async function getSolverSeedFromId(id:number) {

  id_nft = id; 
  const idBytes = new Uint8Array(new Uint32Array([id_nft]).buffer);
  const seeds = 
  Buffer.concat([
      Buffer.from('Game'), 
      idBytes,              
  ]);

  [gamePDA, bump] = await PublicKey.findProgramAddress(
      [seeds],
      solver.programId
  );
}

async function initSolver() {

  await getSolverSeedFromId(1);
  let tx = await solver.methods
      .initialize(id_nft)
      .accounts({
          game : gamePDA,
          otherData: nftAccount2.publicKey,
          signer: game_authority.publicKey,
      })
      .signers([game_authority])
      .rpc();
}
async function solveSequence() {
    const moveSequence = Buffer.from( [3,1,3,2,1,2,3]);
    let tx = await solver.methods
        .solve(moveSequence)
        .accounts({
            game : gamePDA,
            otherData: nftAccount2.publicKey,
            signer: player_user.publicKey,
        })
        .signers([player_user])
        .rpc();
}
   


  describe("MinterNft Program", () => {

      beforeEach(async function() {
        await initProgram();
        await initWallet();
      });

      describe("Hash Data Initialisation", () => {
      
          it("should set the length of hashdata to 0", async () => {
              let tx =  await minter.methods
                  .initializeHashStorage()
                  .accounts({
                      hashStorage :hashAccount.publicKey,
                      user: game_authority.publicKey,
                  })
                  .signers([ game_authority, hashAccount])
                  .rpc();

              let hashdata = await minter.account.hashStorage.fetch(hashAccount.publicKey);
              assert.equal(hashdata.dataHashes.length, 0);
          }); 

      });

      describe("Counter NFT Initialisation", () => {

          it("should set count to 0 ", async () => {
              let tx =  await minter.methods
                  .initializeNftId()
                  .accounts({
                      nftIdCounter:counterAccount.publicKey,
                      user: game_authority.publicKey,
                  })
                  .signers([counterAccount,  game_authority])
                  .rpc();

              let compteur = await minter.account.counter.fetch(counterAccount.publicKey);
              assert.equal(compteur.count, 0);
          });

      });

    describe("Function CreateNft", () => {  

        beforeEach(async function() {
            await initNft();
        });

        it("Should catch error : Wrong Dymension", async () => {

            let wrongWidth = 4;
            try {
                let tx = await minter.methods
                    .createNft(wrongWidth, height, mapData)
                    .accounts({
                        nftAccount: nftAccount2.publicKey,
                        hashStorage: hashAccount.publicKey,
                        nftIdCounter: counterAccount.publicKey,
                        user: creator_user.publicKey,
                    })
                    .signers([nftAccount2, creator_user])
                    .rpc();
                assert.fail("Expected an error but none was thrown");
            } catch (err) {
                assert.equal(err.error.errorCode.code, "WrongDymension");
                assert.equal(err.error.errorMessage, "Width * height does not mathc data.len");
            }

        });

        it("should assign the NFT with correct parameters !", async () => {
     
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
    
            let nftAccountInfo = await minter.account.nftAccount.fetch(nftAccount2.publicKey);
            assert.equal(nftAccountInfo.owner.toString(), creator_user.publicKey.toString());
            assert.equal(nftAccountInfo.id, 1);
            assert.equal(nftAccountInfo.height, height);
            assert.equal(nftAccountInfo.width, width);
            assert.deepEqual(nftAccountInfo.data, mapData);
        });
  

        it("Should not create the NFT cause of duplicate !", async () => {

            try {
                let newNftAccount = Keypair.generate();
                let tx = await minter.methods
                    .createNft(width, height, mapData)
                    .accounts({
                        nftAccount: newNftAccount.publicKey,
                        hashStorage: hashAccount.publicKey,
                        nftIdCounter: counterAccount.publicKey,
                        user: creator_user.publicKey,
                    })
                    .signers([newNftAccount, creator_user])
                    .rpc();
            } catch (err) {
                assert.equal(err.error.errorCode.code, "DataAlreadyExists");
                assert.equal(err.error.errorMessage, "This map already exist");
            }
  
        });


        it("Should increase the counter of id to 2  !", async () => {
           
          
            await createNFT();
            let newNftAccount = Keypair.generate();
            const mapData2 = Buffer.from( [1, 1, 1, 1, 1, 1,
                                           1, 0, 0, 0, 0, 1,
                                           1, 2, 0, 1, 0, 1,
                                           1, 0, 3, 0, 0, 1,
                                           1, 0, 0, 4, 0, 1,
                                           1, 1 ,1 ,1, 1, 1]); 
            const width = 6;
            const height = 6;
            let tx = await minter.methods
                .createNft(width, height, mapData2)
                .accounts({
                    nftAccount: newNftAccount.publicKey,
                    hashStorage: hashAccount.publicKey,
                    nftIdCounter: counterAccount.publicKey,
                    user: creator_user.publicKey,
            })
            .signers([newNftAccount, creator_user])
            .rpc();
    
            let nftAccountInfo = await minter.account.nftAccount.fetch(newNftAccount.publicKey);
            assert.equal(nftAccountInfo.id, 2);
        });
  
    });

    describe.only("Function MinfNft Metaplex", () => {  

        beforeEach(async function() {
            await initNft();
            await createNFT();
        });

        it('Create an NFT with the metadata on Metaplex !', async () => {
   
            // await initWallet();
            // await initNft();
            // await createNFT();
        
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
        
            await connection.confirmTransaction(transactionSignature);
            const metadataAdress = await getMetadataAddress(mintKeypair.publicKey);
            const data = await fetchMetadata(connection, metadataAdress);
            assert.equal(data, metadata);
    
    
        });
  
    });

});

describe("Solver Program", () => {
    
    beforeEach(async function() {
        
    });

    describe("Solver Initialisation", () => { 

        it("Solver set a solver with correct parameters !", async () => {
         
            await initProgram();
            await initWallet();
            await initNft();
            await createNFT();
            await getSolverSeedFromId(1);
            let tx = await solver.methods
               .initialize(id_nft)
               .accounts({
                   game : gamePDA,
                   otherData: nftAccount2.publicKey,
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
        
          await getSolverSeedFromId(1);
          let wrong_id_nft = 2;
          try {
              let tx = await solver.methods
                  .initialize(wrong_id_nft)
                  .accounts({
                      game : gamePDA,
                      otherData: nftAccount2.publicKey,
                      signer: game_authority.publicKey,
                  })
                  .signers([game_authority])
                  .rpc();
         
              assert.fail("Expected an error but none was thrown");
          } catch (err) {
            assert.equal(err.error.errorCode.code, "WrongNftId");
            assert.equal(err.error.errorMessage, "Wrong NFT Id.");
          }
     
      });


    });

    describe("Function Solve Test", () => {
    
        it("Should accept the sequence, set the best solution, transfer the money !", async () => {

          
          const moveSequence = Buffer.from( [3,1,3,2,1,2,3]);
          let tx = await solver.methods
          .solve(moveSequence)
          .accounts({
              game : gamePDA,
              otherData: nftAccount2.publicKey,
              signer: player_user.publicKey,
          })
          .signers([player_user])
          .rpc();
          /*
          await connection.confirmTransaction(tx);
          console.log("tx", tx);
          const result = await connection.getParsedTransaction(tx);
          if (!result) {
            throw new Error('Transaction result is null or undefined');
          }

          const logMessages = result.meta.logMessages || [];
          console.log('Log Messages:', logMessages);
         
          const boolResult = result.meta?.logMessages?.some(msg => msg.includes('result'));
          console.log("result", boolResult);
          */
          let updatedGame = await solver.account.gameState.fetch(gamePDA);
          assert.equal(updatedGame.leader.toString(), player_user.publicKey);
          assert.equal(updatedGame.solved, true);
          assert.deepEqual(updatedGame.bestSoluce, moveSequence);
          assert.equal(updatedGame.lastRequestResult, 3);
         
          const tips = BigInt(fee) / 2n; 
          const tipsBN = new BN(tips.toString()); 
          const leaderRewardBigInt = BigInt(updatedGame.leaderRewardBalance.toString());
          const ownerRewardBigInt = BigInt(updatedGame.ownerRewardBalance.toString());
          assert.equal(leaderRewardBigInt, tipsBN);
          assert.equal(ownerRewardBigInt, tipsBN);       
          
          
    
        });

        it("Should catch error : Invalid Move !", async () => {

          // await initSolver();
          const moveSequence = Buffer.from( [3,1,6,2,1,2,3]);
          try {
          let tx = await solver.methods
          .solve(moveSequence)
          .accounts({
              game : gamePDA,
              otherData: nftAccount2.publicKey,
              signer: player_user.publicKey,
          })
          .signers([player_user])
          .rpc();
          let updatedGame = await solver.account.gameState.fetch(gamePDA);
          
          assert.fail("Expected an error but none was thrown");
        } catch(err) {
          assert.equal(err.error.errorCode.code, "UnknownDirection");
          assert.equal(err.error.errorMessage, "Unknown direction.");
        }              
    
        });

        it("Should accept the sequence but do not change the best solution", async () => {

          
          let game = await solver.account.gameState.fetch(gamePDA);
          const bestSoluce = game.bestSoluce;
          const moveSequence = Buffer.from( [3,1,3,1,3,2,1,2,3]);
          let tx = await solver.methods
          .solve(moveSequence)
          .accounts({
              game : gamePDA,
              otherData: nftAccount2.publicKey,
              signer: player_user.publicKey,
          })
          .signers([player_user])
          .rpc();

          let updatedGame = await solver.account.gameState.fetch(gamePDA);
          assert.equal(updatedGame.leader.toString(), player_user.publicKey);
          assert.equal(updatedGame.solved, true);
          assert.equal(updatedGame.lastRequestResult, 2);
          assert.deepEqual(updatedGame.bestSoluce, bestSoluce);
    
        });

        it("Should reject the sequence", async () => {

          
          let game = await solver.account.gameState.fetch(gamePDA);
          const bestSoluce = game.bestSoluce;
          const moveSequence = Buffer.from( [3,1,1,3,2,1,2,3]);
          let tx = await solver.methods
          .solve(moveSequence)
          .accounts({
              game : gamePDA,
              otherData: nftAccount2.publicKey,
              signer: player_user.publicKey,
          })
          .signers([player_user])
          .rpc();

          let updatedGame = await solver.account.gameState.fetch(gamePDA);
          assert.equal(updatedGame.leader.toString(), player_user.publicKey);
          assert.equal(updatedGame.solved, true);
          assert.equal(updatedGame.lastRequestResult, 1);
          assert.deepEqual(updatedGame.bestSoluce, bestSoluce);
    
        });

    });


    describe("Function Claim Test", () => {

        // beforeEach(async function() {
        //     await initSolver();
        //     await solveSequence();
        //   });
     
          
        it("Leader Claim !", async () => {
            let balancePda = BigInt(await provider.connection.getBalance(gamePDA));
            let balanceUser = BigInt(await provider.connection.getBalance(player_user.publicKey));
           
            let game = await solver.account.gameState.fetch(gamePDA);
            let leaderRewardBigInt = BigInt(game.leaderRewardBalance.toString());

    
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
            assert.equal(balancePdaAfter, balancePda-leaderRewardBigInt);
            assert.equal(balanceUserAfter, balanceUser+leaderRewardBigInt);

    });

  it("Nft Owner Claim !", async () => {
      
      let balancePda = BigInt(await provider.connection.getBalance(gamePDA));
      let balanceUser = BigInt(await provider.connection.getBalance(creator_user.publicKey));
      let game = await solver.account.gameState.fetch(gamePDA);
      let OwnerRewardBigInt = BigInt(game.ownerRewardBalance.toString());
      let tx = await solver.methods
          .claim() 
          .accounts({
              game : gamePDA,
              signer: creator_user.publicKey,
          })
          .signers([creator_user])
          .rpc();
    
      let updatedGame = await solver.account.gameState.fetch(gamePDA);
      let balancePdaAfter = await provider.connection.getBalance(gamePDA);
      let balanceUserAfter = await provider.connection.getBalance(creator_user.publicKey);
     
   
      assert.equal(updatedGame.ownerRewardBalance, 0);
      assert.equal(balancePdaAfter, balancePda-OwnerRewardBigInt);
      assert.equal(balanceUserAfter, balanceUser+OwnerRewardBigInt);
   

  });

  it("Claim Attempt by random address !", async () => {
    getSolverSeedFromId(1);
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

  
});

 
  