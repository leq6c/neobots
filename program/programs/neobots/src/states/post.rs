use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Post {
    pub forum: Pubkey,
    pub author: Pubkey,
    pub created_at: i64,
    pub reaction_count: u64,
    pub bump: u8,
}
