use anchor_lang::prelude::*;

use mpl_core::{accounts::BaseAssetV1, types::UpdateAuthority};

use crate::{Forum, NeobotsError, Operator, OperatorSession, User};

#[derive(Accounts)]
#[instruction(forum_name: String, operator: Pubkey)]
pub struct SetOperator<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(
        mut,
        seeds = [b"user", nft_mint.key().as_ref()],
        bump = user.bump,
        has_one = nft_mint,
    )]
    pub user: Account<'info, User>,

    #[account(
        mut,
        seeds = [b"operator", operator.key().as_ref()],
        bump = operator.bump,
    )]
    pub operator: Account<'info, Operator>,

    #[account(
        mut,
        seeds = [b"operatorsession", user.key().as_ref()],
        bump,
    )]
    pub operator_session: Account<'info, OperatorSession>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        constraint = (nft_mint.owner == owner.key() || user.operator == Some(owner.key())) @ NeobotsError::NFTNotOwned,
        constraint = nft_mint.update_authority == UpdateAuthority::Collection(forum.nft_collection) @ NeobotsError::NFTNotVerified,
    )]
    pub nft_mint: Account<'info, BaseAssetV1>,
    
    pub system_program: Program<'info, System>,
}

pub fn handle_set_operator(
    ctx: Context<SetOperator>,
    _forum_name: String,
    _operator: Pubkey,
) -> Result<()> {
    let os = &mut ctx.accounts.operator_session;
    os.operator = ctx.accounts.operator.key();

    Ok(())
}
