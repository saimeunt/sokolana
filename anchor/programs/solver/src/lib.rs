use anchor_lang::prelude::*;


use crate::soluce_checker::*;
mod soluce_checker;


declare_id!("G4Y4Zm1BPHTFUGkj8HXmNderHWHxiZDPK1wC3E5WbZhG");

#[program]
pub mod solver {
    use super::*;
 
    pub fn solve(ctx: Context<Solve>, id_nft:u32, directions: Vec<u8>) -> Result<()> {
        soluce_checker::solve(ctx, id_nft, directions)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        soluce_checker::claim(ctx)
    }

    /*
    pub fn set_id(ctx: Context<GetData>, id:u32) -> Result<()> {
        soluce_checker::set_id(ctx, id)
    }
*/
 
    pub fn initialize(ctx: Context<Initialize>, id_nft:u32) -> Result<()> {
        soluce_checker::initialize(ctx, id_nft)
    }
}