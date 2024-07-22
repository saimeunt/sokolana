use anchor_lang::prelude::*;


use crate::errors::ErrorCode;
use crate::state::{GameState};


#[derive(Accounts)]
pub struct Claim<'info> {
  
    #[account(mut)] 
    pub game: Account<'info, GameState>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}


pub fn claim(ctx: Context<Claim>) -> Result<()> {

    //Adresse doit être soit le leader soit le owner du nft associée au solver
    if ctx.accounts.game.leader != *ctx.accounts.signer.key && ctx.accounts.game.nft_owner != *ctx.accounts.signer.key {
        return Err(ErrorCode::NotAuthorized.into());  
    }

    //Cas où le claimer est le leader
    let mut lamports_to_transfer:u64 = 0;
    if ctx.accounts.game.leader == *ctx.accounts.signer.key {
        lamports_to_transfer = ctx.accounts.game.leader_reward_balance;
        ctx.accounts.game.leader_reward_balance = 0;
    }

    //Cas où le claimer est le owner du nft
    if ctx.accounts.game.nft_owner == *ctx.accounts.signer.key {
        lamports_to_transfer = ctx.accounts.game.owner_reward_balance;
        ctx.accounts.game.owner_reward_balance = 0;
    }
   
    **ctx
            .accounts
            .game
            .to_account_info()
            .try_borrow_mut_lamports()? -= lamports_to_transfer;
    **ctx
            .accounts
            .signer
            .to_account_info()
            .try_borrow_mut_lamports()? += lamports_to_transfer;
    
    
    return Ok(());

}