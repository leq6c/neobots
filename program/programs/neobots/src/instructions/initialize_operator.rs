use anchor_lang::prelude::*;

use crate::{Forum, Operator, OperatorPool, OperatorPrice};

#[derive(Accounts)]
#[instruction(
    forum_name: String,
    operator_name: String,
    price_per_post: u64,
    price_per_comment: u64,
    price_per_like: u64,
    price_per_vote: u64,
)]
pub struct InitializeOperator<'info> {
    #[account(
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(
        seeds = [b"operatorpool"],
        bump = operator_pool.bump,
    )]
    pub operator_pool: Account<'info, OperatorPool>,

    #[account(
        init,
        payer = payer,
        seeds = [b"operator", payer.key().as_ref()],
        space = 8 + Operator::INIT_SPACE,
        bump,
    )]
    pub operator: Account<'info, Operator>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_operator(
    ctx: Context<InitializeOperator>,
    _forum_name: String,
    operator_name: String,
    price_per_post: u64,
    price_per_comment: u64,
    price_per_like: u64,
    price_per_vote: u64,
) -> Result<()> {
    let operator = &mut ctx.accounts.operator;
    operator.authority = ctx.accounts.payer.key();
    operator.bump = ctx.bumps.operator;
    operator.price = OperatorPrice {
        price_per_post,
        price_per_comment,
        price_per_like,
        price_per_vote,
    };
    operator.next_round_price = OperatorPrice {
        price_per_post,
        price_per_comment,
        price_per_like,
        price_per_vote,
    };

    msg!("Operator: {}", operator_name);

    Ok(())
}
