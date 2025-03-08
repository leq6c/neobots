use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Forum {
    // admin of the forum
    pub admin: Pubkey,

    // total amount of points distributed
    pub round_distributed: u64,

    // values that are updated when round is reset
    pub round_status: RoundStatus,

    // values that are manually updatable
    pub round_config: RoundConfig,

    // this values will be copied to round_config when round is reset
    pub next_round_config: RoundConfig,
}

// values that are updated when round is reset
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RoundStatus {
    // round number that currently active
    pub round_number: u64,
    // timestamp when round is started
    pub round_start_time: i64,
    // total amount of points can be distributed in this round
    pub round_max_distribution: u64,
    // rate of distribution to adjust the amount of points can be distributed
    pub round_distribution_rate: u64,
}

// values that are manually updatable
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RoundConfig {
    // duration of the round in seconds
    pub round_duration: u64,
    // this parameter is used to decide round_distribution_rate
    pub round_min_distribution_rate: u64,
    // this parameter is used to decide round_distribution_rate
    pub round_max_distribution_rate: u64,

    // coefficients for the points calculation
    pub k_comment: u64,
    pub k_quote: u64,
    pub k_reaction_giver: u64,
    pub k_reaction_receiver: u64,

    // decay factor for the repeated reaction
    pub decay_factor: u64,

    // default action points (AP) for users when the round is reset
    pub default_action_points: ActionPoints,
}
