use anchor_lang::prelude::*;

mod contexts;
use contexts::*;
mod state;
use state::*;

declare_id!("AKrtcC6H1Wh6bH4pBsWkqzFmUuqwqvaiV4woFW5k3B9B");

#[program]
pub mod escrow {
    use super::*;

    // seed needs to be the first param after ctx !ORDER OF PARAMS MATTER!
    pub fn make(ctx: Context<Make>, seed: u64, amount: u64, receive: u64) -> Result<()> {
        ctx.accounts.save_escrow(seed, receive, ctx.bumps.escrow)?;
        ctx.accounts.deposit_to_vault(amount)
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.transfer_to_maker()?;
        ctx.accounts.withdraw_and_close()
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.withdraw_and_close()
    }
}
