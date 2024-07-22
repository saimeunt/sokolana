use anchor_lang::prelude::*;


use crate::errors::ErrorCode;
use crate::state::{GameState, NftAccount};


#[derive(Accounts)]
#[instruction(id_nft:u32)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        seeds = [b"Game", &id_nft.to_le_bytes()], 
        bump,
        space = 8 + 1 + 4 + 1 + 1 + 1+ 400 + 32 +32 + 8 + 8
    )]
    pub game_state: Account<'info, GameState>,

    /// CHECK: We do not own this account
    other_data: UncheckedAccount<'info>, 
  
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}


pub fn initialize(ctx: Context<Initialize>, id_nft:u32) -> Result<()> {

    //Récupération des données du NFT
    let nft_account = &ctx.accounts.other_data;
    require!(!nft_account.data_is_empty(), ErrorCode::UnknownNFT);
    

    let mut data_slice: &[u8] = &nft_account.data.borrow();

    let data_struct:NftAccount = 
        AccountDeserialize::try_deserialize(
            &mut data_slice,
        )?;

    //L'id du NFT doit correspondre avec l'id du solver    
    require!(id_nft == data_struct.id, ErrorCode::WrongNftId);
    

    let game_account = &mut ctx.accounts.game_state;
    game_account.id_nft = data_struct.id;
    game_account.nft_owner = data_struct.owner;
    game_account.solved = false;
    game_account.owner_reward_balance = 0;
    game_account.leader_reward_balance = 0;
    Ok(())
}
