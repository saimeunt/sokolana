use anchor_lang::prelude::*;

#[account]
pub struct GameState {
    pub id_nft:u32,
    pub solved:bool,
    pub best_soluce:Vec<u8>,
    pub leader:Pubkey,
    pub nft_owner:Pubkey,
    pub owner_reward_balance:u64,
    pub leader_reward_balance:u64,
    pub last_request_result:u8,
}