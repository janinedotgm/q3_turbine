use anchor_lang::prelude::*;

/**
 * Define the Escrow account
 * 
 * It facilitates the exchange of two different types of tokesn. 
 * One party deposits a certain amount of one token type (mint A), 
 * and the other party deposits a certain amount of the other token type (mint B).
 * The escrow account is responsible for holding the tokens until the exchange is finalized.
 */
#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub seed: u64,
    pub maker: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey, 
    pub receive: u64, // amount to receive
    pub bump: u8,
}


