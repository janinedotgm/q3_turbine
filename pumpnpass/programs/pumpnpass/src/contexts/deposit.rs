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

    /// CHECK: This account is safe because it is only used for its public key and does not need to authorize any transactions.
    #[account(mut)]
    pub payer: AccountInfo<'info>,

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

    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let escrow = &mut self.escrow;
        let player_account = &mut self.player_account;

        require!(escrow.status == GameStatus::PENDING, ErrorCode::GameNotStarted);

        let cpi_accounts = Transfer {
            from: self.player.to_account_info(), // Use the player's account to transfer SOL
            to: escrow.to_account_info()
        };
        

        let cpi_program = self.system_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, amount)?;

        escrow.deposit += amount;
        player_account.deposit += amount;
        escrow.player_count += 1;
        
        Ok(())
    }
}
