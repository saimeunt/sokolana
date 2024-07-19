use anchor_lang::prelude::*;


use crate::state::{Counter};

#[derive(Accounts)]
pub struct InitializeNftId<'info> {
    
    #[account(init, payer = user, space = 8 + 8)]
    pub nft_id_counter: Account<'info, Counter>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}


pub fn initialize_nft_id(ctx: Context<InitializeNftId>) -> Result<()> {
    
    let nft_id_counter = &mut ctx.accounts.nft_id_counter;
    nft_id_counter.count = 0;
    Ok(())
}