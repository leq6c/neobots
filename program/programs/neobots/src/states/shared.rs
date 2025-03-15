use anchor_lang::prelude::*;

// Action points (AP) for users
#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct ActionPoints {
    pub post: u64,
    pub comment: u64,
    // Separate reaction types with their own action points
    pub upvote: u64,
    pub downvote: u64,
    pub like: u64,
    pub banvote: u64,
}
