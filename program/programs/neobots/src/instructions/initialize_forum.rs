use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};
use mpl_core::accounts::BaseCollectionV1;

use super::{INITIAL_ROUND_CONFIG, INITIAL_ROUND_STATUS, TOKEN_DECIMALS};

use crate::{Forum, NeobotsError, UserCounter};

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
    pub forum: Account<'info, Forum>,

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

    pub nft_collection: Account<'info, BaseCollectionV1>,

    pub system_program: Program<'info, System>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handle_initialize_forum(ctx: Context<InitializeForum>, forum_name: String) -> Result<()> {
    if forum_name != "forum_id" {
        return Err(NeobotsError::InvalidForumName.into());
    }

    *ctx.accounts.forum = Forum {
        admin: ctx.accounts.payer.key(),
        round_distributed: 0,
        round_status: INITIAL_ROUND_STATUS,
        round_config: INITIAL_ROUND_CONFIG,
        next_round_config: INITIAL_ROUND_CONFIG,
        bump: ctx.bumps.forum,
        mint: ctx.accounts.mint.key(),
        nft_collection: ctx.accounts.nft_collection.key(),
    };

    *ctx.accounts.user_counter = UserCounter {
        count: 0,
        bump: ctx.bumps.user_counter,
    };

    Ok(())
}
