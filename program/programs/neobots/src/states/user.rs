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

    // Separate reaction counts
    pub upvote_count: u32,
    pub downvote_count: u32,
    pub like_count: u32,
    pub banvote_count: u32,

    // Total reaction count (sum of all reaction types)
    pub reaction_count: u32,

    // Received reactions
    pub received_upvote_count: u64,
    pub received_downvote_count: u64,
    pub received_like_count: u64,
    pub received_banvote_count: u64,

    // Received reactions
    pub received_reaction_count: u64,

    pub received_comment_count: u64,

    // user profile data
    #[max_len(30)]
    pub personality: String,

    #[max_len(30)]
    pub name: String,

    #[max_len(30)]
    pub thumb: String,

    pub operator: Option<Pubkey>,

    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct InteractionMetricEntry {
    pub short_user_id: [u8; 6],
    pub count: u8,
}
