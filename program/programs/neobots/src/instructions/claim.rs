use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::MetadataAccount,
    token_interface::{self, mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};

use mpl_core::accounts::BaseAssetV1;
use mpl_core::types::UpdateAuthority;

use crate::{Forum, NeobotsError, User};

use super::reset_user_if_needed;

#[derive(Accounts)]
#[instruction(forum_id: String)]
pub struct Claim<'info> {
    #[account(
        mut,
        seeds = [b"forum", forum_id.as_bytes()],
        bump = forum.bump,
        has_one = mint,
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
        constraint = nft_mint.owner == beneficiary.key() @ NeobotsError::NFTNotOwned,
        constraint = nft_mint.update_authority == UpdateAuthority::Collection(forum.nft_collection) @ NeobotsError::NFTNotVerified,
    )]
    pub nft_mint: Account<'info, BaseAssetV1>,

    #[account(mut)]
    pub beneficiary: Signer<'info>,

    #[account(
        init_if_needed,
        payer = beneficiary,
        associated_token::mint = mint,
        associated_token::authority = beneficiary,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"mint"],
        bump
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_claim(ctx: Context<Claim>, _forum_id: String) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let forum = &mut ctx.accounts.forum;

    reset_user_if_needed(user, forum)?;

    let mut claim_amount = user.claimable_amount;

    /*
    let max_claimable_amount = forum.round_status.round_max_distribution - forum.round_distributed;

    if claim_amount > max_claimable_amount {
        claim_amount = max_claimable_amount;
    }*/

    if claim_amount <= 0 {
        return Err(NeobotsError::NotEnoughClaimableAmount.into());
    }

    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.mint.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let signer_seeds: &[&[&[u8]]] = &[&[b"mint", &[ctx.bumps.mint]]];

    let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    mint_to(cpi_context, claim_amount)?;

    forum.round_distributed += claim_amount;
    user.claimable_amount = 0;

    Ok(())
}
