use anchor_lang::prelude::*;

declare_id!("GuSMF3URMDTyW2cqUpmq4U1ZjxNcoc9VwLzcfEJf5kpC");

#[program]
pub mod refund {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
