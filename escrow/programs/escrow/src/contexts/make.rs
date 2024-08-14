use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked}};

use crate::state::Escrow;

#[derive(Accounts)]
#[instruction(seed: u64)] // access the seed from lib.rs
pub struct Make<'info> {
    #[account(mut)]
    maker: Signer<'info>,
    #[account(
        mint::token_program = token_program, // not necessary, but you will get an error if you use the wrong token program
    )]
    mint_a: InterfaceAccount<'info, Mint>,
    #[account(
        mint::token_program = token_program, // not necessary, but you will get an error if you use the wrong token program
    )]
    mint_b: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    maker_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init, // our program owns it so people can't just create them therefore it doesn't exist yet
        payer = maker,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump
    )]
    escrow: Account<'info, Escrow>,
    #[account(
        init_if_needed, // It could already exist
        payer = maker,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program,
    )]
    vault: InterfaceAccount<'info, TokenAccount>, // vault is an associated token account that is owned by the escrow
    associated_token_program: Program<'info, AssociatedToken>, // calculates ata's
    token_program: Interface<'info, TokenInterface>, // does things like token transfers opening mints
    system_program: Program<'info, System>, // open escrow state
}

impl<'info> Make<'info> {
    pub fn save_escrow(&mut self, seed: u64, receive: u64, bump: u8) -> Result<()>{
        self.escrow.set_inner(Escrow{
            seed,
            maker: self.maker.key(),
            mint_a: self.mint_a.key(),
            mint_b: self.mint_b.key(),
            receive,
            bump,
        });
        Ok(())
    }

    pub fn deposit_to_vault(&self, amount: u64) -> Result<()> {
        let accounts = TransferChecked {
            from: self.maker_ata_a.to_account_info(),
            to: self.vault.to_account_info(),
            mint: self.mint_a.to_account_info(),
            authority: self.maker.to_account_info(),
        };
        
        let ctx = CpiContext::new(
            self.token_program.to_account_info(),
            accounts
        );

        transfer_checked(ctx, amount, self.mint_a.decimals)
    }
}
