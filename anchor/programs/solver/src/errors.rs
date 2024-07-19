use anchor_lang::prelude::*;


#[error_code]
pub enum ErrorCode {
    #[msg("Index out of bounds.")]
    IndexOutOfBounds,
    #[msg("Unknown direction.")]
    UnknownDirection,
    #[msg("Wrong data.")]
    InitialisationFailed,
    #[msg("Invalid Account.")]
    InvalidAccount,
    #[msg("Not Authorized.")]
    NotAuthorized,
    #[msg("Unknown NFT.")]
    UnknownNFT,
    #[msg("Wrong NFT Id.")]
    WrongNftId,
}