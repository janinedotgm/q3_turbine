use anchor_lang::prelude::*;
use anchor_spl::{metadata::{mpl_token_metadata::instructions::{FreezeDelegatedAccountCpi, FreezeDelegatedAccountCpiAccounts}, MasterEditionAccount, Metadata, MetadataAccount}, token::{approve, Approve, Mint, Token, TokenAccount}};

use crate::state::{StakeAccount, StakeConfig, UserAccount};

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>, // user initiates the staking action, thus the signature required to authorize tx

    pub mint: Account<'info, Mint>, // represents the mint account for the NFT beeing staked
    pub collection: Account<'info, Mint>, // represents the mint account for the collection the NFT belongs to. Needed to verify that the NFT being staked is part of a specific collection. ?

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub mint_ata: Account<'info, TokenAccount>, // ATA for the NFT owened by the user. Holds the actual NFT the user wants to stake. This needs to be lickked while staking

    #[account(
        seeds = [// defined by metaplex - seeds are always like this
            b"metadata",
            metadata_program.key().as_ref(), // make sure program is derived from metadata program
            mint.key().as_ref(), 
        ],
        seeds::program = metadata_program.key(),
        constraint = metadata.collection.as_ref().unwrap().key.as_ref() == collection.key().as_ref(),
        constraint = metadata.collection.as_ref().unwrap().verified == true,
        bump,
    )]
    pub metadata: Account<'info, MetadataAccount>, 

    #[account(
        seeds = [// defined by metaplex - seeds are always like this
            b"metadata",
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
            b"edition"
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    pub edition: Account<'info, MasterEditionAccount>, // This assures that it is an NFT and not a token (proofs the non-fungibility of that token)

    pub config: Account<'info, StakeConfig>, // stake config

    #[account(
        mut,
        seeds = [b"user".as_ref(), user.key().as_ref()],
        bump = user_account.bump,
    )]
    pub user_account: Account<'info, UserAccount>, 

    #[account(
        init,
        payer = user,
        space = StakeAccount::INIT_SPACE,
        seeds = [b"stake".as_ref(), mint.key().as_ref(), config.key().as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    pub metadata_program: Program<'info, Metadata>, // manage and validate the metadata of the NFT ?
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> Stake<'info> {
    pub fn stake(&mut self, bumps: &StakeBumps) -> Result<()> {

        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Approve {
            to: self.mint_ata.to_account_info(),
            delegate: self.stake_account.to_account_info(),
            authority: self.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        approve(cpi_ctx, 1)?; // 1 because it is an nft - it delegates the authority 

        let seeds = &[
            b"stake",
            self.mint.to_account_info().key.as_ref(),
            self.config.to_account_info().key.as_ref(),
            &[self.stake_account.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let delegate = &self.stake_account.to_account_info();
        let token_account = &self.mint_ata.to_account_info();
        let edition = &self.edition.to_account_info();
        let token_program = &self.token_program.to_account_info();
        let mint= &self.mint.to_account_info();
        let metadata_program = &self.metadata_program.to_account_info();

        FreezeDelegatedAccountCpi::new(
            metadata_program, 
            FreezeDelegatedAccountCpiAccounts {
                delegate,
                token_account,
                edition,
                mint,
                token_program,
            }
        ).invoke_signed(signer_seeds)?;

        self.stake_account.set_inner(
            StakeAccount {
                owner: self.user.key(),
                mint: self.mint.key(),
                last_updated: Clock::get()?.unix_timestamp,
                bump: bumps.stake_account,
            }
        );

        // require!(self.user_account.amount_staked < self.config.max_stake, ErrorCode::MaxStakeReached);

        self.user_account.amount_staked += 1;
        Ok(())
    }

}
