use anchor_lang::prelude::*;

use anchor_spl::{
    metadata::MetadataAccount,
    token_interface::{Mint, TokenAccount},
};

use super::INITIAL_ACTION_POINTS;

use crate::{Forum, NeobotsError, User};

#[derive(Accounts)]
#[instruction(forum_name: String)]
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

    pub nft_mint: InterfaceAccount<'info, Mint>,

    // payer must own the NFT
    #[account(
        constraint = nft_token_account.owner == payer.key() @ NeobotsError::NFTNotOwned,
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

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_user(ctx: Context<InitializeUser>, _forum_name: String) -> Result<()> {
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
        bump: ctx.bumps.user,
    };

    Ok(())
}
