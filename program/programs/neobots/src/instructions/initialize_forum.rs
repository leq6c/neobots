use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata,
    },
    token_interface::{Mint, TokenInterface},
};
use mpl_core::accounts::BaseCollectionV1;

use super::{INITIAL_ROUND_CONFIG, INITIAL_ROUND_STATUS, TOKEN_DECIMALS};

use crate::{Forum, NeobotsError, UserCounter};

use mpl_token_metadata::{instructions::CreateMetadataAccountV3, ID as TOKEN_METADATA_PROGRAM_ID};

#[derive(Accounts)]
#[instruction(forum_name: String)]
pub struct InitializeForum<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [b"forum", forum_name.as_bytes()],
        space = 8 + Forum::INIT_SPACE,
        bump,
    )]
    pub forum: Box<Account<'info, Forum>>,

    #[account(
        init,
        payer = payer,
        seeds = [b"usercounter"],
        space = 8 + UserCounter::INIT_SPACE,
        bump,
    )]
    pub user_counter: Account<'info, UserCounter>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        seeds = [b"mint"],
        bump,
        payer = payer,
        mint::decimals = TOKEN_DECIMALS,
        mint::authority = mint.key(),
        mint::freeze_authority = mint.key(),
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    /// CHECK: UncheckedAccount
    pub metadata: UncheckedAccount<'info>,

    pub nft_collection: Account<'info, BaseCollectionV1>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,

    pub token_metadata_program: Program<'info, Metadata>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handle_initialize_forum(ctx: Context<InitializeForum>, forum_name: String) -> Result<()> {
    if forum_name != "forum_id" {
        return Err(NeobotsError::InvalidForumName.into());
    }

    let forum = &mut ctx.accounts.forum;

    forum.admin = ctx.accounts.payer.key();
    forum.round_distributed = 0;
    forum.round_status = INITIAL_ROUND_STATUS;
    forum.round_config = INITIAL_ROUND_CONFIG;
    forum.next_round_config = INITIAL_ROUND_CONFIG;
    forum.bump = ctx.bumps.forum;
    forum.mint = ctx.accounts.mint.key();
    forum.nft_collection = ctx.accounts.nft_collection.key();

    *ctx.accounts.user_counter = UserCounter {
        count: 0,
        bump: ctx.bumps.user_counter,
    };

    /**
     * Create metadata account
     */
    let seeds = &["mint".as_bytes(), &[ctx.bumps.mint]];
    let signer = [&seeds[..]];

    let token_data: DataV2 = DataV2 {
        name: "Neobots".to_string(),
        symbol: "NBT".to_string(),
        uri: "".to_string(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    let metadata_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            payer: ctx.accounts.payer.to_account_info(),
            update_authority: ctx.accounts.mint.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            metadata: ctx.accounts.metadata.to_account_info(),
            mint_authority: ctx.accounts.mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
        &signer,
    );

    create_metadata_accounts_v3(metadata_ctx, token_data, true, true, None)?;

    Ok(())
}
