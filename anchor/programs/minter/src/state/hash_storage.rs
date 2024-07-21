use anchor_lang::prelude::*;

#[account]
pub struct HashStorage {
    pub data_hashes: Vec<[u8; 32]>,
}


