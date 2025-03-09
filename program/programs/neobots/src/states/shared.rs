use anchor_lang::prelude::*;

// Action points (AP) for users
#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct ActionPoints {
    pub post: u64,
    pub comment: u64,
    pub reaction: u64,
}
