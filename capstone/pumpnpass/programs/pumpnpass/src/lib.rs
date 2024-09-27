use anchor_lang::prelude::*;

pub mod contexts;
use contexts::*;

pub mod state;
pub use state::*;

pub mod errors;

declare_id!("67zrcgrGfk4NGR6YTQNoqZhSxbhq87ZTPZFZvdQyJ3vz");

#[program]
pub mod pumpnpass {
    use super::*;    

    pub fn initialize(ctx: Context<Game>, seed: u64, duration: u64, deposit_per_player: u64) -> Result<()> {

       ctx.accounts.init_escrow(
            duration,
            seed,
            deposit_per_player,
            &ctx.bumps,
        )?;

       Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, seed: u64, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)?;
        Ok(())
    }

    pub fn savescore(ctx: Context<Deposit>, seed: u64, score: u64) -> Result<()> {
        ctx.accounts.save_score(score)?;
        Ok(())
    }

    pub fn finalize(ctx: Context<Deposit>, seed: u64, payout: u64) -> Result<()> {
        
        ctx.accounts.save_payout(payout)?;

        if ctx.accounts.escrow.status == GameStatus::ReadyToClose {
            // ctx.accounts.close()?;
        }

        Ok(())
    }

    pub fn distributefunds(ctx: Context<Withdraw>) -> Result<()> {
        ctx.accounts.withdraw()?;
        Ok(())
    }
}

