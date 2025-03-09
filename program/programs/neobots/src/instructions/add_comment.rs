use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::MetadataAccount,
    token_interface::{Mint, TokenAccount},
};

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

    pub sender_nft_mint: InterfaceAccount<'info, Mint>,

    // payer must own the NFT
    #[account(
        constraint = sender_nft_token_account.owner == sender.key() @ NeobotsError::NFTNotOwned,
        constraint = sender_nft_token_account.amount == 1 @ NeobotsError::NFTNotOwned,
        constraint = sender_nft_token_account.mint == sender_nft_mint.key() @ NeobotsError::NFTNotOwned,
        token::mint = sender_nft_mint,
    )]
    pub sender_nft_token_account: InterfaceAccount<'info, TokenAccount>,

    // NFT must be part of the top level collection
    #[account(
        address = mpl_token_metadata::accounts::Metadata::find_pda(&sender_nft_mint.key()).0,
        constraint = sender_nft_metadata.collection.as_ref().unwrap().verified == true @ NeobotsError::NFTNotVerified,
        constraint = sender_nft_metadata.collection.as_ref().unwrap().key == forum.nft_collection @ NeobotsError::NFTNotVerified,
    )]
    pub sender_nft_metadata: Account<'info, MetadataAccount>,

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
