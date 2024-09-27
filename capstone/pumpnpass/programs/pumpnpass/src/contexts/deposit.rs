use anchor_lang::prelude::*;
use anchor_lang::system_program::{Transfer, transfer};

use crate::{ Player, Escrow, GameStatus };
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(
    seed: u64,
)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(mut)]
    pub payer: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [
            b"escrow",
            payer.key().as_ref(),
            escrow.seed.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        init_if_needed,
        payer = player,
        space = Player::INIT_SPACE,
        seeds = [b"player", player.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub player_account: Account<'info, Player>,

    pub system_program: Program<'info, System>,
    
}

impl<'info> Deposit<'info> {

    /**
     * Deposit game bet to escrow
     * 
     * @param amount - Amount of SOL in lamports to deposit
     */
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let escrow = &mut self.escrow;
        let player_account = &mut self.player_account;

        require!(escrow.status == GameStatus::Pending, ErrorCode::GameNotStarted);

        // Deposit game bet to escrow
        let cpi_accounts = Transfer {
            from: self.player.to_account_info(),
            to: escrow.to_account_info()
        };
        
        let cpi_program = self.system_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, amount)?;

        // Update escrow and player account balances
        escrow.deposit += amount;
        player_account.deposit += amount;
        let expected_deposit = escrow.deposit_per_player * escrow.player_count;
        let new_deposit = escrow.deposit;

        // If the deposit is equal to the expected deposit, set the game status to active
        if new_deposit == expected_deposit {
            escrow.status = GameStatus::Active;
        }
        
        Ok(())
    }

    /**
     * Save player score
     * 
     * @param score - Player score (the number of points they scored)
     */
    pub fn save_score(&mut self, score: u64) -> Result<()> {
        let player_account = &mut self.player_account;
        player_account.score = score;
        Ok(())
    }

    /**
     * Save player payout
     * 
     * @param amount - Amount of SOL in lamports to payout
     */
    pub fn save_payout(&mut self, amount: u64) -> Result<()> { 
        let escrow = &mut self.escrow;
        escrow.status = GameStatus::Finalizing; // Payouts should only be made when the game is finished TODO: Make this more robust

        // Save payout to player account
        let player_account = &mut self.player_account;
        player_account.payout += amount;

        // Update escrow player count
        escrow.player_count -= 1;

        // If the escrow has no more players, set the game status to finished
        if escrow.player_count == 0 {
            escrow.status = GameStatus::Finished;
        }

        Ok(())
    }

}
