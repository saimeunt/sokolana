use anchor_lang::prelude::*;

pub mod state;
pub mod errors;

pub mod instructions;
use instructions::*;



declare_id!("HRKSYCRNtAL3L9bmc5r2uUsYZr9QjMCxgvNRpat59jnH");

#[program]
pub mod solver {
    use super::*;
 
    pub fn solve(ctx: Context<Solve>, directions: Vec<u8>) -> Result<bool> {
        instructions::solve(ctx, directions)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        instructions::claim(ctx)
    }
 
    pub fn initialize(ctx: Context<Initialize>, id_nft:u32) -> Result<()> {
        instructions::initialize(ctx, id_nft)
    }
}