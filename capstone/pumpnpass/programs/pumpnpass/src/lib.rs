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

    /**
     * Initialize escrow
     * 
     * @param duration - Duration of the game in seconds
     * @param seed - Seed for the game (uuid from db)
     * @param deposit_per_player - Amount of SOL in lamports to deposit per player
     */
    pub fn initialize(ctx: Context<Game>, seed: u64, duration: u64, deposit_per_player: u64) -> Result<()> {

       ctx.accounts.init_escrow(
            duration,
            seed,
            deposit_per_player,
            &ctx.bumps,
        )?;

       Ok(())
    }

    /**
     * Deposit SOL into escrow
     * 
     * @param seed - Seed for the game (uuid from db)
     * @param amount - Amount of SOL in lamports to deposit
     */
    pub fn deposit(ctx: Context<Deposit>, seed: u64, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)?;
        Ok(())
    }

    /**
     * Save player score
     * 
     * @param seed - Seed for the game (uuid from db)
     * @param score - Player score (the number of points they scored)
     */
    pub fn savescore(ctx: Context<Deposit>, seed: u64, score: u64) -> Result<()> {
        ctx.accounts.save_score(score)?;
        Ok(())
    }

    /**
     * Save player payout
     * 
     * @param seed - Seed for the game (uuid from db)
     * @param payout - Amount of SOL in lamports to payout
     */
    pub fn finalize(ctx: Context<Deposit>, seed: u64, payout: u64) -> Result<()> {
        
        ctx.accounts.save_payout(payout)?;

        if ctx.accounts.escrow.status == GameStatus::ReadyToClose {
            // ctx.accounts.close()?;
        }

        Ok(())
    }

    /**
     * Distribute funds from escrow to player. The amount of Lamports are saved in the player account.
     */
    pub fn distributefunds(ctx: Context<Withdraw>) -> Result<()> {
        ctx.accounts.withdraw()?;
        Ok(())
    }
}

