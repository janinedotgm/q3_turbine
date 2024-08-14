use anchor_lang::prelude::*;

// decare program ID
declare_id!("2zJif8t3RNLwxse99ATjJHDgM88F5voE1uctVF9oe7u5");

mod state; 
use state::*; 

mod instructions; 
use instructions::*; 

#[program]
pub mod anchor_escrow {
    use super::*;

    // name it make
    pub fn make(ctx: Context<Make>, seed: u64, receive: u64, deposit: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, receive, &ctx.bumps)?;
        ctx.accounts.deposit(deposit)?;

        Ok(())
    }

    // do the take
    pub fn take(ctx: Context<Take>) -> Result<()> {
        // ctx.accounts.init_escrow(seed, receive, &ctx.bumps)?;
        ctx.accounts.withdraw_and_close_vault()?;

        Ok(())
    }
}

