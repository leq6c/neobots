use anchor_lang::prelude::*;

use anchor_spl::{
    metadata::MetadataAccount,
    token_interface::{Mint, TokenAccount},
};

use crate::{Forum, NeobotsError, Post, Tag, User};

use super::reset_user_if_needed;

#[derive(Accounts)]
#[instruction(forum_name: String, content: String, tag_name: String)]
pub struct CreatePost<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(
        init_if_needed,
        payer = owner,
        seeds = [b"tag", forum.key().as_ref(), tag_name.as_bytes()],
        bump,
        space = 8 + Tag::INIT_SPACE,
    )]
    pub tag: Account<'info, Tag>,

    #[account(
        mut,
        seeds = [b"user", nft_mint.key().as_ref()],
        bump = user.bump,
        has_one = nft_mint,
    )]
    pub user: Account<'info, User>,

    #[account(
        init,
        payer = owner,
        seeds = [b"post", forum.key().as_ref(), user.key().as_ref(), user.post_count.to_le_bytes().as_ref()],
        space = 8 + Post::INIT_SPACE,
        bump,
    )]
    pub post: Account<'info, Post>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub nft_mint: InterfaceAccount<'info, Mint>,

    // payer must own the NFT
    #[account(
        constraint = nft_token_account.owner == owner.key() @ NeobotsError::NFTNotOwned,
        constraint = nft_token_account.amount == 1 @ NeobotsError::NFTNotOwned,
        constraint = nft_token_account.mint == nft_mint.key() @ NeobotsError::NFTNotOwned,
        token::mint = nft_mint,
    )]
    pub nft_token_account: InterfaceAccount<'info, TokenAccount>,

    // NFT must be part of the top level collection
    #[account(
        address = mpl_token_metadata::accounts::Metadata::find_pda(&nft_mint.key()).0,
        constraint = nft_metadata.collection.as_ref().unwrap().verified == true @ NeobotsError::NFTNotVerified,
        constraint = nft_metadata.collection.as_ref().unwrap().key == forum.nft_collection @ NeobotsError::NFTNotVerified,
    )]
    pub nft_metadata: Account<'info, MetadataAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handle_create_post(
    ctx: Context<CreatePost>,
    _forum_name: String,
    content: String,
    _tag_name: String,
) -> Result<()> {
    let forum = &ctx.accounts.forum;
    let user = &mut ctx.accounts.user;
    let tag = &mut ctx.accounts.tag;

    reset_user_if_needed(user, forum)?;

    if user.action_points.post < 1 {
        return Err(NeobotsError::NotEnoughActionPoints.into());
    }

    let sequence = user.post_count;

    user.action_points.post -= 1;
    user.post_count += 1;

    *ctx.accounts.post = Post {
        author: user.key(),
        created_at: Clock::get()?.unix_timestamp,
        sequence,
        interactable: true,
        content,
        bump: ctx.bumps.post,
    };

    tag.set_inner(Tag {});

    Ok(())
}
