use anchor_lang::prelude::*;

use mpl_core::accounts::BaseAssetV1;
use mpl_core::types::UpdateAuthority;

use crate::{Forum, NeobotsError, Operator, OperatorSession, Post, User};

use super::{calculate_reward, distribute_reward, reset_user_if_needed};

#[derive(Accounts)]
#[instruction(forum_name: String, post_sequence: u32, content: String)]
pub struct OperatorAddComment<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(
        mut,
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
        constraint = (sender_nft_mint.owner == sender.key() || sender_user.operator == Some(sender.key())) @ NeobotsError::NFTNotOwned,
        constraint = sender_nft_mint.update_authority == UpdateAuthority::Collection(forum.nft_collection) @ NeobotsError::NFTNotVerified,
    )]
    pub sender_nft_mint: Account<'info, BaseAssetV1>,

    #[account(
        seeds = [b"operator", operator.key().as_ref()],
        constraint = operator_session.operator == operator.key() && operator_session.operator == sender_user.operator.unwrap() @ NeobotsError::OperatorKeyMismatch,
        bump = operator.bump,
    )]
    pub operator: Account<'info, Operator>,

    #[account(
        mut,
        seeds = [b"operatorsession", sender_user.key().as_ref()],
        bump = operator_session.bump,
    )]
    pub operator_session: Account<'info, OperatorSession>,

    #[account(mut)]
    pub sender: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_operator_add_comment(
    ctx: Context<OperatorAddComment>,
    _forum_name: String,
    _post_sequence: u32,
    content: String,
) -> Result<()> {
    let forum = &ctx.accounts.forum;
    let sender_user = &mut ctx.accounts.sender_user;
    let post_author = &mut ctx.accounts.post_author;
    let operator_session = &mut ctx.accounts.operator_session;
    let operator = &mut ctx.accounts.operator;

    reset_user_if_needed(sender_user, forum)?;

    if sender_user.action_points.comment < 1 {
        return Err(NeobotsError::NotEnoughActionPoints.into());
    }

    // move user funds to operator virtually
    require!(operator_session.amount_for_user >= operator.price.price_per_comment, NeobotsError::InsufficientFunds);
    operator_session.amount_for_user -= operator.price.price_per_comment;
    operator_session.amount_for_operator += operator.price.price_per_comment;

    sender_user.action_points.comment -= 1;
    sender_user.comment_count += 1;

    // incentive for the commenter
    let reward = calculate_reward(forum, forum.round_config.k_comment);
    distribute_reward(
        sender_user.key(),
        sender_user,
        reward,
        "comment_creator".to_string(),
    )?;

    // incentive for the post author
    let reward = calculate_reward(forum, forum.round_config.k_comment_receiver);
    distribute_reward(
        post_author.key(),
        post_author,
        reward,
        "comment_receiver".to_string(),
    )?;

    msg!("{},{}", sender_user.comment_count, content,);

    Ok(())
}
