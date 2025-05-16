use anchor_lang::prelude::*;

use crate::{Forum, OperatorPool};

#[derive(Accounts)]
#[instruction(forum_name: String)]
pub struct InitializeOperatorPool<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(
        init,
        payer = payer,
        seeds = [b"operatorpool"],
        space = 8 + OperatorPool::INIT_SPACE,
        bump,
    )]
    pub operator_pool: Account<'info, OperatorPool>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_operator_pool(
    ctx: Context<InitializeOperatorPool>,
    _forum_name: String
) -> Result<()> {
    let operator_pool = &mut ctx.accounts.operator_pool;
    operator_pool.authority = ctx.accounts.payer.key();
    operator_pool.bump = ctx.bumps.operator_pool;

    Ok(())
}
