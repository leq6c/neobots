use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub nft_mint: Pubkey,
    pub claimable_amount: u64,
    pub local_round_number: u64,

    // Action points (AP) for users
    pub action_points: ActionPoints,

    // interaction metrics for users
    #[max_len(30)]
    pub interaction_metrics: Vec<InteractionMetricEntry>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InteractionMetricEntry {
    pub short_user_id: [u8; 6],
    pub count: u8,
}
