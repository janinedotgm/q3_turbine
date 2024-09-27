use anchor_lang::prelude::*;

use crate::Escrow;
use crate::GameStatus;

#[derive(Accounts)]
#[instruction(
    seed: u64,
)]
pub struct Game<'info> {
    #[account(mut)]
    pub payer: Signer<'info>, // This account was created via telegram bot - we hold the key
    
    #[account(
        init,
        payer = payer, // We will pay for the escrow
        space = Escrow::INIT_SPACE,
        seeds = [
            b"escrow", 
            payer.key().as_ref(),
            seed.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    pub system_program: Program<'info, System>,
}


impl<'info> Game<'info> {

    /**
     * Initialize escrow
     * 
     * @param duration - Duration of the game in seconds
     * @param seed - Seed for the game (uuid from db)
     * @param deposit_per_player - Amount of SOL in lamports to deposit per player
     */
    pub fn init_escrow(
        &mut self, 
        duration: u64, 
        seed: u64,
        deposit_per_player: u64, 
        bumps: &GameBumps
    ) -> Result<()> {

        let timestamp = Clock::get()?.unix_timestamp as u64;

        self.escrow.set_inner(Escrow {
            seed,
            player_count: 2,
            status: GameStatus::Pending,
            duration,
            created_at: timestamp,
            deposit: 0,
            deposit_per_player,
            bump: bumps.escrow,
        });

        Ok(())
    }

}