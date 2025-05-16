use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct OperatorSession {
    pub user: Pubkey,
    pub operator: Pubkey,
    pub vault: Pubkey,
    pub amount_for_user: u64,
    pub amount_for_operator: u64,
    // bump
    pub bump: u8,
}