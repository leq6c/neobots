use anchor_lang::prelude::*;

use crate::ActionPoints;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub nft_mint: Pubkey,
    pub claimable_amount: u64,
    pub local_round_number: u64,

    // Action points (AP) for users
    pub action_points: ActionPoints,

    #[max_len(30)]
    pub interaction_metrics: Vec<InteractionMetricEntry>,

    // metrics
    pub post_count: u32,
    pub comment_count: u32,
    pub reaction_count: u32,

    pub received_reaction_count: u64,
    pub received_comment_count: u64,

    // user profile data
    #[max_len(30)]
    pub personality: String,

    #[max_len(30)]
    pub name: String,

    #[max_len(30)]
    pub thumb: String,

    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct InteractionMetricEntry {
    pub short_user_id: [u8; 6],
    pub count: u8,
}
