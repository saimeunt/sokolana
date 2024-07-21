use anchor_lang::prelude::*;


use crate::state::{HashStorage};

#[derive(Accounts)]
pub struct InitializeHashStorage<'info> {
   
    #[account(init, payer = user, space = 8 + 32*100)]
    pub hash_storage: Account<'info, HashStorage>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}


pub fn initialize_hash_storage(ctx: Context<InitializeHashStorage>) -> Result<()> {
        
    let hash_storage = &mut ctx.accounts.hash_storage;
    hash_storage.data_hashes = Vec::new();
    Ok(())
} 