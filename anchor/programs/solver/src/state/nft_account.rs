use anchor_lang::prelude::*;

#[account]
pub struct NftAccount {
    pub owner: Pubkey,
    pub id: u32,
    pub height: u8,
    pub width: u8,
    pub data: Vec<u8>,
}