use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::MetadataAccount,
    token_interface::{Mint, TokenAccount},
};

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
        "Reaction(sequence={}, comment_sequence={})",
        sender_user.reaction_count,
        comment_sequence,
    );

    Ok(())
}
