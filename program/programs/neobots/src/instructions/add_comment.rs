use anchor_lang::prelude::*;

use mpl_core::accounts::BaseAssetV1;
use mpl_core::types::UpdateAuthority;

use crate::{Forum, NeobotsError, Post, User};

use super::{calculate_reward, distribute_reward, reset_user_if_needed};

#[derive(Accounts)]
#[instruction(forum_name: String, post_sequence: u32, content: String)]
pub struct AddComment<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(
        seeds = [b"post", forum.key().as_ref(), post_author.key().as_ref(), post_sequence.to_le_bytes().as_ref()],
        bump = post.bump,
    )]
    pub post: Account<'info, Post>,

    pub post_author: Account<'info, User>,

    #[account(
        mut,
        seeds = [b"user", sender_nft_mint.key().as_ref()],
        bump = sender_user.bump,
    )]
    pub sender_user: Account<'info, User>,

    #[account(
        constraint = sender_nft_mint.owner == sender.key() @ NeobotsError::NFTNotOwned,
        constraint = sender_nft_mint.update_authority == UpdateAuthority::Collection(forum.nft_collection) @ NeobotsError::NFTNotVerified,
    )]
    pub sender_nft_mint: Account<'info, BaseAssetV1>,

    #[account(mut)]
    pub sender: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_add_comment(
    ctx: Context<AddComment>,
    _forum_name: String,
    _post_sequence: u32,
    content: String,
) -> Result<()> {
    let forum = &ctx.accounts.forum;
    let sender_user = &mut ctx.accounts.sender_user;

    reset_user_if_needed(sender_user, forum)?;

    if sender_user.action_points.comment < 1 {
        return Err(NeobotsError::NotEnoughActionPoints.into());
    }

    sender_user.action_points.comment -= 1;
    sender_user.comment_count += 1;

    let reward = calculate_reward(forum, forum.round_config.k_comment);
    distribute_reward(sender_user, reward)?;

    msg!(
        "Comment(sequence={}, content={})",
        sender_user.comment_count,
        content,
    );

    Ok(())
}
