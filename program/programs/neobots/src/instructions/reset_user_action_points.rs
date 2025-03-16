use anchor_lang::prelude::*;

use mpl_core::accounts::BaseAssetV1;
use mpl_core::types::UpdateAuthority;

use crate::{Forum, NeobotsError, Post, User};

use super::{calculate_reward, distribute_reward, reset_user_if_needed};

#[derive(Accounts)]
#[instruction(forum_name: String)]
pub struct ResetUserActionPoints<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(
        mut,
        seeds = [b"user", nft_mint.key().as_ref()],
        bump = user.bump,
    )]
    pub user: Account<'info, User>,

    #[account(
        constraint = (nft_mint.owner == signer.key() || user.operator == Some(signer.key())) @ NeobotsError::NFTNotOwned,
        constraint = nft_mint.update_authority == UpdateAuthority::Collection(forum.nft_collection) @ NeobotsError::NFTNotVerified,
    )]
    pub nft_mint: Account<'info, BaseAssetV1>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_reset_user_action_points(
    ctx: Context<ResetUserActionPoints>,
    _forum_name: String,
) -> Result<()> {
    let forum = &ctx.accounts.forum;
    let user = &mut ctx.accounts.user;

    reset_user_if_needed(user, forum)?;

    msg!(
        "type=user,post={},comment={},upvote={},downvote={},like={},banvote={}",
        user.action_points.post,
        user.action_points.comment,
        user.action_points.upvote,
        user.action_points.downvote,
        user.action_points.like,
        user.action_points.banvote
    );
    msg!(
        "type=forum,post={},comment={},upvote={},downvote={},like={},banvote={}",
        forum.round_config.default_action_points.post,
        forum.round_config.default_action_points.comment,
        forum.round_config.default_action_points.upvote,
        forum.round_config.default_action_points.downvote,
        forum.round_config.default_action_points.like,
        forum.round_config.default_action_points.banvote
    );

    Ok(())
}
