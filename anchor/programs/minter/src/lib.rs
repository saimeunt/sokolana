use anchor_lang::prelude::*;


pub mod state;
pub mod errors;

pub mod instructions;
use instructions::*;

declare_id!("5PVX8zjPwPJHKqoJFcfKCXQzHGv4RiMQrij6TeLFYPWZ");

#[program]

pub mod minter {
    use super::*;
 
    pub fn initialize_hash_storage(ctx: Context<InitializeHashStorage>) -> Result<()> {
        instructions::initialize_hash_storage(ctx)
    }

    pub fn initialize_nft_id(ctx: Context<InitializeNftId>) -> Result<()> {
        instructions::initialize_nft_id(ctx)
    }
 
    pub fn create_nft(ctx: Context<CreateNft>, height: u8, width: u8, data: Vec<u8>) -> Result<()> {
        instructions::create_nft(ctx, height, width, data)
    }

    pub fn mint_nft(ctx: Context<CreateToken>, nft_name:String, nft_symbol:String, nft_uri:String ) -> Result<()> {
        instructions::mint_nft(ctx, nft_name, nft_symbol, nft_uri)
    }
}