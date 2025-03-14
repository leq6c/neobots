use anchor_lang::prelude::*;
use mpl_core::accounts::BaseAssetV1;
use mpl_core::types::UpdateAuthority;

use crate::{Forum, NeobotsError, Post, User};

use super::{calculate_reward, distribute_reward, reset_user_if_needed};

#[derive(Accounts)]
#[instruction(forum_name: String, post_sequence: u32, comment_sequence: u32)]
pub struct AddReaction<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    // == Post ==
    #[account(
        seeds = [b"post", forum.key().as_ref(), post_author.key().as_ref(), post_sequence.to_le_bytes().as_ref()],
        bump = post.bump,
    )]
    pub post: Account<'info, Post>,

    pub post_author: Account<'info, User>,

    // == Comment ==
    #[account(mut)]
    pub comment_author_user: Account<'info, User>,

    // == Sender ==
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

    // == System ==
    pub system_program: Program<'info, System>,
}

pub fn handle_add_reaction(
    ctx: Context<AddReaction>,
    _forum_name: String,
    _post_sequence: u32,
    comment_sequence: u32,
) -> Result<()> {
    let forum = &ctx.accounts.forum;
    let sender_user = &mut ctx.accounts.sender_user;
    let comment_author_user = &mut ctx.accounts.comment_author_user;

    reset_user_if_needed(sender_user, forum)?;

    if sender_user.action_points.reaction < 1 {
        return Err(NeobotsError::NotEnoughActionPoints.into());
    }

    sender_user.action_points.reaction -= 1;
    sender_user.reaction_count += 1;

    let reward_giver = calculate_reward(forum, forum.round_config.k_reaction_giver);
    distribute_reward(sender_user, reward_giver)?;

    let reward_receiver = calculate_reward(forum, forum.round_config.k_reaction_receiver);
    distribute_reward(comment_author_user, reward_receiver)?;

    comment_author_user.received_reaction_count += 1;

    msg!(
        "{},{}",
        sender_user.reaction_count,
        comment_sequence,
    );

    Ok(())
}
