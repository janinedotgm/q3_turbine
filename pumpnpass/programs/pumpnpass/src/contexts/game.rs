use anchor_lang::{prelude::*, system_program::{ Transfer, transfer }};
use std::collections::HashMap;

use crate::errors::ErrorCode;
use crate::Escrow;
use crate::Player;
use crate::GameStatus;

#[derive(Accounts)]
pub struct Game<'info> {
    #[account(mut)]
    pub payer: Signer<'info>, // This account was created via telegram bot - we hold the key
    
    #[account(
        init,
        payer = payer, // We will pay for the escrow
        space = 8 + Escrow::INIT_SPACE,
        seeds = [
            b"game", 
            player1_account.key().as_ref(), 
            player2_account.key().as_ref(), 
            player3_account.key().as_ref(), 
            player4_account.key().as_ref(),
        ],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(init, payer = payer, space = 8 + Player::INIT_SPACE)]
    pub player1_account: Account<'info, Player>,

    #[account(init, payer = payer, space = 8 + Player::INIT_SPACE)]
    pub player2_account: Account<'info, Player>,

    #[account(init, payer = payer, space = 8 + Player::INIT_SPACE)]
    pub player3_account: Account<'info, Player>,

    #[account(init, payer = payer, space = 8 + Player::INIT_SPACE)]
    pub player4_account: Account<'info, Player>,

    pub system_program: Program<'info, System>,
}


impl<'info> Game<'info> {

    pub fn init_escrow(&mut self, duration: u64, deposit_per_player: u64, bumps: &GameBumps) -> Result<()> {
        let mut players = HashMap::new();

        let timestamp = Clock::get()?.unix_timestamp as u64;
        
        players.insert(self.player1_account.key(), Player::default());
        players.insert(self.player2_account.key(), Player::default());
        players.insert(self.player3_account.key(), Player::default());
        players.insert(self.player4_account.key(), Player::default());

        let seed = self.escrow.seed;

        self.escrow.set_inner(Escrow {
            seed,
            player_count: 0,
            status: GameStatus::PENDING,
            duration: duration,
            created_at: timestamp,
            deposit: 0,
            deposit_per_player,
            bump: bumps.escrow,
        });
        Ok(())
    }

    pub fn deposit(&mut self, amount: u64, player_number: u64) -> Result<()> {

        // Get the player account based on the player number
        let player_account = match player_number {
            1 => &self.player1_account,
            2 => &self.player2_account,
            3 => &self.player3_account,
            4 => &self.player4_account,
            _ => return Err(ErrorCode::InvalidPlayerNumber.into()),
        };

        // Transfer the amount from the player account to the escrow account
        let cpi_accounts = Transfer {
            from: player_account.to_account_info(),
            to: self.escrow.to_account_info(),
        };

        let cpi_program = self.system_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, amount)?;

        // Update the escrow deposit;
        self.escrow.deposit += amount;

        self.escrow.player_count += 1;

        Ok(())
    }


}