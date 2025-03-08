use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Authority {
    pub admin: Pubkey,
}
