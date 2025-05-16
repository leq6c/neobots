use anchor_lang::prelude::*;

use anchor_spl::{associated_token::AssociatedToken, token::{transfer, Transfer}, token_interface::{Mint, TokenAccount, TokenInterface}};
use mpl_core::{accounts::BaseAssetV1, types::UpdateAuthority};

use crate::{Forum, NeobotsError, Operator, OperatorSession, User};

#[derive(Accounts)]
#[instruction(forum_name: String, operator: Pubkey, amount: u64)]
pub struct Deposit<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(
        seeds = [b"mint"],
        constraint = mint.key() == forum.mint @ NeobotsError::InvalidMint,
        bump,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

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
        associated_token::mint = forum.mint,
        associated_token::authority = owner,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = owner,
        seeds = [b"operatorsession", user.key().as_ref()],
        space = 8 + OperatorSession::INIT_SPACE,
        bump,
    )]
    pub operator_session: Account<'info, OperatorSession>,

    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner,
        associated_token::token_program = token_program,
    )]
    pub vault_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        constraint = (nft_mint.owner == owner.key() || user.operator == Some(owner.key())) @ NeobotsError::NFTNotOwned,
        constraint = nft_mint.update_authority == UpdateAuthority::Collection(forum.nft_collection) @ NeobotsError::NFTNotVerified,
    )]
    pub nft_mint: Account<'info, BaseAssetV1>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_deposit(
    ctx: Context<Deposit>,
    _forum_name: String,
    _operator: Pubkey,
    amount: u64,
) -> Result<()> {
    let os = &mut ctx.accounts.operator_session;
    require!(os.user == Pubkey::default(), NeobotsError::OperatorSessionNotInitialized);

    let cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        },
    );

    os.amount_for_user += amount;

    transfer(cpi, amount)?;

    Ok(())
}
