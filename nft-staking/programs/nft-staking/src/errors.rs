use anchor_lang::prelude::*;

#[error_code]
pub enum StakeError {
    #[msg("Incorrect mint")]
    IncorrectMint,
    #[msg("Incorrect collection")]
    IncorrectCollection,
    #[msg("Collection not verified")]
    CollectionNotVerified,
}