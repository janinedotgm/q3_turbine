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
}

