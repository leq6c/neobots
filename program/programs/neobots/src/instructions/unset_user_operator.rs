use anchor_lang::prelude::*;

use mpl_core::accounts::BaseAssetV1;
use mpl_core::types::UpdateAuthority;

use super::INITIAL_ACTION_POINTS;

use crate::{Forum, NeobotsError, User};

#[derive(Accounts)]
#[instruction(forum_name: String)]
pub struct UnsetUserOperator<'info> {
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
        constraint = nft_mint.owner == payer.key() @ NeobotsError::NFTNotOwned,
        constraint = nft_mint.update_authority == UpdateAuthority::Collection(forum.nft_collection) @ NeobotsError::NFTNotVerified,
    )]
    pub nft_mint: Account<'info, BaseAssetV1>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_unset_user_operator(
    ctx: Context<UnsetUserOperator>,
    _forum_name: String,
) -> Result<()> {
    ctx.accounts.user.operator = None;
    Ok(())
}
