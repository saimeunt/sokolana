use anchor_lang::prelude::*;
use sha2::{Digest, Sha256};

declare_id!("5PVX8zjPwPJHKqoJFcfKCXQzHGv4RiMQrij6TeLFYPWZ");

#[program]
pub mod minter {
    use super::*;

   
    pub fn initialize_nft_id(ctx: Context<InitializeNftId>) -> Result<()> {
        
        let nft_id_counter = &mut ctx.accounts.nft_id_counter;
        nft_id_counter.count = 0;
       
       
        Ok(())
    }

    pub fn initialize_hash_storage(ctx: Context<InitializeHashStorage>) -> Result<()> {
        
        let hash_storage = &mut ctx.accounts.hash_storage;
        hash_storage.data_hashes = Vec::new();
        Ok(())
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
/*
    pub fn set_data(ctx: Context<GetNftData>, data: u32) -> Result<()> {
        let nft_account = &mut ctx.accounts.nft_account;
        nft_account.id = data;
        Ok(())
    }
        */

}


#[derive(Accounts)]
pub struct GetNftData<'info> {
    #[account(mut)]
    pub nft_account: Account<'info, NftAccount>,
}

#[derive(Accounts)]
pub struct InitializeNftId<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub nft_id_counter: Account<'info, Counter>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct InitializeHashStorage<'info> {
   
    #[account(init, payer = user, space = 8 + 32*100)]
    pub hash_storage: Account<'info, HashStorage>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}



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

#[account]
pub struct NftAccount {
    pub owner: Pubkey,
    pub id: u32,
    pub height: u8,
    pub width: u8,
    pub data: Vec<u8>,
}

#[account]
pub struct Counter {
    pub count: u32,
}

#[account]
pub struct HashStorage {
    pub data_hashes: Vec<[u8; 32]>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("This map already exist")]
    DataAlreadyExists,
    #[msg("Width * height does not mathc data.len")]
    WrongDymension,
    
}

fn hash(data: &[u8]) -> [u8; 32] {
   
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().into()
}