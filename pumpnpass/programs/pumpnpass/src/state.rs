use anchor_lang::prelude::*;

// TODO: Each player should be a seperate PDA
#[account]
pub struct Escrow {
    pub seed: u64,
    pub player_count: u64,
    pub duration: u64,
    pub status: GameStatus,
    pub created_at: u64,
    pub deposit: u64,
    pub deposit_per_player: u64,
    pub bump: u8,
}

impl Space for Escrow {
    const INIT_SPACE: usize = 
        8 + // seed
        8 + // player_count
        8 + // duration
        GameStatus::INIT_SPACE + // status
        8 + // created_at
        8 + // deposit
        8 +
        8; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum GameStatus {
    OPEN, // Game is open but has not started
    ACTIVE, // Game is active
    PENDING, // Waiting for player deposits
    FINISHED, // Payouts are done, escrow can be closed
}

impl Space for GameStatus {
    const INIT_SPACE: usize = 1;
}

#[account]
pub struct Player {
    pub score: u64,
    pub payout: u64,
    pub deposit: u64,
}

impl Default for Player {
    fn default() -> Self {
        Player {
            score: 0,
            payout: 0,
            deposit: 0,
        }
    }
}

impl Space for Player {
    const INIT_SPACE: usize = 8 + 8 + 8;
}
