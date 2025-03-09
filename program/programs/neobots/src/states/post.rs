use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Post {
    pub author: Pubkey,
    pub created_at: i64,
    pub sequence: u32,
    pub interactable: bool,
    #[max_len(100)]
    pub content: String,

    pub bump: u8,
}
