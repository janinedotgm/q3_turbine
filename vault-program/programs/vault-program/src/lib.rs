use anchor_lang::prelude::*;

mod state;

mod contexts;
use contexts::*;

declare_id!("7qRVbwknfmWuevwLtu2fj53pujvbZ33KJ2Vo3F1bBfJd");

#[program]
pub mod vault_program {
    use super::*;

    pub fn initialize(&mut self, ctx: Context<Initialize>) -> Result<()> {
        // msg!("Initializing vault: {}", ctx.accounts.vault.key());
        ctx.accounts.init(ctx.bumps);
    }
}

