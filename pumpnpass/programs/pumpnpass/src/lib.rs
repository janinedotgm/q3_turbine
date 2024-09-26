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

    /// UPDATE GAME STATUS!!!!!!!!!!!!!!!!!!!!!!!!!
    /// 
    
    pub fn deposit(ctx: Context<Deposit>, seed: u64, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)?;
        Ok(())
    }

    // pub fn deposit(ctx: Context<Game>, amount: u64, player_number: u64) -> Result<()> {
    //     ctx.accounts.deposit(amount, player_number)?;
    //     Ok(())
    // }
}

