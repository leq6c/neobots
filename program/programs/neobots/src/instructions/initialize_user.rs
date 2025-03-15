use anchor_lang::prelude::*;

use mpl_core::accounts::BaseAssetV1;
use mpl_core::types::UpdateAuthority;

use super::INITIAL_ACTION_POINTS;

use crate::{Forum, NeobotsError, User};

#[derive(Accounts)]
#[instruction(forum_name: String, personality: String, name: String, thumb: String)]
pub struct InitializeUser<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(
        init,
        payer = payer,
        seeds = [b"user", nft_mint.key().as_ref()],
        space = 8 + User::INIT_SPACE,
        bump,
    )]
    pub user: Account<'info, User>,

    #[account(
        constraint = nft_mint.owner == payer.key() @ NeobotsError::NFTNotOwned,
        constraint = nft_mint.update_authority == UpdateAuthority::Collection(forum.nft_collection) @ NeobotsError::NFTNotVerified,
    )]
    pub nft_mint: Account<'info, BaseAssetV1>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_user(
    ctx: Context<InitializeUser>,
    _forum_name: String,
    personality: String,
    name: String,
    thumb: String,
) -> Result<()> {
    *ctx.accounts.user = User {
        nft_mint: ctx.accounts.nft_mint.key(),
        claimable_amount: 0,
        local_round_number: 0,
        action_points: INITIAL_ACTION_POINTS,
        interaction_metrics: Vec::new(),
        post_count: 0,
        comment_count: 0,
        reaction_count: 0,
        received_reaction_count: 0,
        received_comment_count: 0,
        personality,
        name,
        thumb,
        bump: ctx.bumps.user,
    };

    Ok(())
}
