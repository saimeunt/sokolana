use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("This map already exist")]
    DataAlreadyExists,
    #[msg("Width * height does not mathc data.len")]
    WrongDymension,
    #[msg("Unauthorized signer")]
    UnauthorizedSigner
}