use anchor_lang::prelude::*;
use anchor_lang::system_program::{Transfer, transfer};

use crate::{ Player };

#[derive(Accounts)]
#[instruction(
    seed: u64,
)]
pub struct Score<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player", player.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub player_account: Account<'info, Player>,

    pub system_program: Program<'info, System>,
}

// impl<'info> Score<'info> {

//     pub fn save_score(&mut self, score: u64) -> Result<()> {
//         let player_account = &mut self.player_account;
//         player_account.score = score;
//         Ok(())
//     }

// }
