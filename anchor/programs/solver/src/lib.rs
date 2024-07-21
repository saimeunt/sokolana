use anchor_lang::prelude::*;


use crate::soluce_checker::*;
mod soluce_checker;


declare_id!("Dxz9KW7PbRBfcyymgNVR59jJe8cscrhgkJixHYg9eGB1");

#[program]
pub mod solver {
    use super::*;
 
    pub fn solve(ctx: Context<Solve>, directions: Vec<u8>) -> Result<bool> {
        soluce_checker::solve(ctx, directions)
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