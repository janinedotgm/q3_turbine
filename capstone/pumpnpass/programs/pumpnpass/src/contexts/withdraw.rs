use anchor_lang::prelude::*;
use anchor_lang::system_program::{Transfer, transfer};

use crate::{ Player, Escrow, GameStatus };

#[derive(Accounts)]
pub struct Withdraw<'info> {
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
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,    

    #[account(
        mut,
        seeds = [
            b"player", 
            player.key().as_ref(), 
            escrow.seed.to_le_bytes().as_ref()
        ],
        bump,
    )]
    pub player_account: Account<'info, Player>,

    pub system_program: Program<'info, System>,
}

impl<'info> Withdraw<'info> {

    /**
     * Withdraw payout from escrow to player
     */
    pub fn withdraw(&mut self) -> Result<()> {

        // Signer seeds for the escrow account
        let signer_seeds: [&[&[u8]]; 1] = [&[
            b"escrow",
            self.payer.to_account_info().key.as_ref(),
            &self.escrow.seed.to_le_bytes()[..],
            &[self.escrow.bump],
        ]];
    
        // Transfer payout to player    
        let cpi_accounts = Transfer {
            from: self.payer.to_account_info(), // Use the payer's account to transfer SOL
            to: self.player.to_account_info(),
        };
        let cpi_program = self.system_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, &signer_seeds);
    
        transfer(cpi_ctx, self.player_account.payout)?;
    
        // Update escrow balance
        self.escrow.deposit -= self.player_account.payout;

        // Reset player account
        self.player_account.payout = 0;
        self.player_account.score = 0;

        // If the escrow is empty, set the game status to ready to close
        if self.escrow.deposit == 0 {
            self.escrow.status = GameStatus::ReadyToClose;
        }

        Ok(())
    }

    // TODO: Close player accounts and escrow!!!!!!
}