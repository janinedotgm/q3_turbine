use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    InvalidPlayerNumber,
    GameNotOpen,
    GameNotStarted,
    GameNotFinished,
    GameNotFinalizing,
}
