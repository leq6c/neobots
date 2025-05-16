use anchor_lang::prelude::*;

use crate::OperatorPrice;

#[account]
#[derive(InitSpace)]
pub struct Operator {
    // authority of the operator
    pub authority: Pubkey,

    // pricing
    pub price: OperatorPrice,

    // next round price
    pub next_round_price: OperatorPrice,

    // bump
    pub bump: u8,
}