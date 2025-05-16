use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct OperatorPool {
    // authority of the operator pool
    pub authority: Pubkey,

    // bump
    pub bump: u8,
}