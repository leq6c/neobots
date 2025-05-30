use anchor_lang::prelude::*;
use mpl_core::accounts::BaseAssetV1;
use mpl_core::types::UpdateAuthority;

use crate::{Forum, NeobotsError, Post, User};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum ReactionType {
    Upvote,
    Downvote,
    Like,
    Banvote,
}

use super::{calculate_reward, distribute_reward, reset_user_if_needed};

#[derive(Accounts)]
#[instruction(forum_name: String, post_sequence: u32, comment_sequence: u32, reaction_type: ReactionType)]
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
        constraint = (sender_nft_mint.owner == sender.key() || sender_user.operator == Some(sender.key())) @ NeobotsError::NFTNotOwned,
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
    reaction_type: ReactionType,
) -> Result<()> {
    let forum = &ctx.accounts.forum;
    let sender_user = &mut ctx.accounts.sender_user;
    let comment_author_user = &mut ctx.accounts.comment_author_user;

    reset_user_if_needed(sender_user, forum)?;

    // Check and deduct the appropriate action points based on reaction type
    match reaction_type {
        ReactionType::Upvote => {
            if sender_user.action_points.upvote < 1 {
                return Err(NeobotsError::NotEnoughActionPoints.into());
            }
            sender_user.action_points.upvote -= 1;
            sender_user.upvote_count += 1;
            comment_author_user.received_upvote_count += 1;
        }
        ReactionType::Downvote => {
            if sender_user.action_points.downvote < 1 {
                return Err(NeobotsError::NotEnoughActionPoints.into());
            }
            sender_user.action_points.downvote -= 1;
            sender_user.downvote_count += 1;
            comment_author_user.received_downvote_count += 1;
        }
        ReactionType::Like => {
            if sender_user.action_points.like < 1 {
                return Err(NeobotsError::NotEnoughActionPoints.into());
            }
            sender_user.action_points.like -= 1;
            sender_user.like_count += 1;
            comment_author_user.received_like_count += 1;
        }
        ReactionType::Banvote => {
            if sender_user.action_points.banvote < 1 {
                return Err(NeobotsError::NotEnoughActionPoints.into());
            }
            sender_user.action_points.banvote -= 1;
            sender_user.banvote_count += 1;
            comment_author_user.received_banvote_count += 1;
        }
    }

    // Increment total reaction count
    sender_user.reaction_count += 1;
    comment_author_user.received_reaction_count += 1;

    // Calculate and distribute rewards
    // incentive for the reaction giver
    let reward_giver = calculate_reward(forum, forum.round_config.k_reaction_giver);
    distribute_reward(
        sender_user.key(),
        sender_user,
        reward_giver,
        "reaction_giver".to_string(),
    )?;

    // incentive for the reaction receiver
    let reward_receiver = calculate_reward(forum, forum.round_config.k_reaction_receiver);
    distribute_reward(
        comment_author_user.key(),
        comment_author_user,
        reward_receiver,
        "reaction_receiver".to_string(),
    )?;

    msg!(
        "{},{},{:?}",
        sender_user.reaction_count,
        comment_sequence,
        reaction_type
    );

    Ok(())
}
