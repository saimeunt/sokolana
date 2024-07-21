use anchor_lang::prelude::*;
use sha2::{Digest, Sha256};

use crate::errors::ErrorCode;
use crate::state::{NftAccount, HashStorage, Counter};



#[derive(Accounts)]
#[instruction(height: u8, width: u8)]
pub struct CreateNft<'info> {
    
    #[account(
        init,
        payer = user,
       // seeds = [b"NFT", &id_nft.to_le_bytes()],
        space = 8 + 32 + 4 + 1 + 1 + 1000 + (height as usize * width as usize)
    )]
    pub nft_account: Account<'info, NftAccount>,
  
    #[account(mut)]
    pub nft_id_counter: Account<'info, Counter>,

    #[account(mut)]
    pub hash_storage: Account<'info, HashStorage>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}


pub fn create_nft(ctx: Context<CreateNft>, height: u8, width: u8, data: Vec<u8> ) -> Result<()> {

    if usize::from(height*width) != data.len() {
        return Err(ErrorCode::WrongDymension.into());
    }
    let nft_account = &mut ctx.accounts.nft_account;
    let mint_counter = &mut ctx.accounts.nft_id_counter;
    mint_counter.count += 1;

    let hash_storage = &mut ctx.accounts.hash_storage;

    // Convert data to an hash  (unique identifier) 
    let data_hash = hash(&data);

    // Check if the data already exists
    if hash_storage.data_hashes.contains(&data_hash) {
        return Err(ErrorCode::DataAlreadyExists.into());
    }

    // Store the unique data hash
    hash_storage.data_hashes.push(data_hash);
    nft_account.id = mint_counter.count;
    nft_account.owner = *ctx.accounts.user.key;
    nft_account.height = height;
    nft_account.width = width;
    nft_account.data = data;
    Ok(())
       
}


fn hash(data: &[u8]) -> [u8; 32] {
   
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().into()
}