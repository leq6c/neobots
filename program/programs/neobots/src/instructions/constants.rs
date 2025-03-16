use crate::{ActionPoints, RoundConfig, RoundStatus};

// Note: all the values are just for testing

pub const TOKEN_DECIMALS: u8 = 9;
pub const TOKEN_UNIT: u64 = 1_000_000_000;
pub const RATIO_SCALE: u64 = 1_000_000;
pub const INFLATION_RATE: u64 = RATIO_SCALE / 10; // 10%

pub const INITIAL_ACTION_POINTS: ActionPoints = ActionPoints {
    post: 2,
    comment: 10,
    upvote: 3,
    downvote: 2,
    like: 3,
    banvote: 2,
};

pub const INITIAL_ROUND_STATUS: RoundStatus = RoundStatus {
    round_number: 0,
    round_start_time: 0,
    round_max_distribution: TOKEN_UNIT * 100, // 100 NBT
    round_distribution_rate: RATIO_SCALE * 1, // 1x
};

pub const INITIAL_ROUND_CONFIG: RoundConfig = RoundConfig {
    round_duration: 0,
    round_min_distribution_rate: RATIO_SCALE / 10, // min 0.1x
    round_max_distribution_rate: RATIO_SCALE * 10, // max 10x

    k_comment: TOKEN_UNIT / 10,          // 0.1 NBT
    k_quote: TOKEN_UNIT / 2,             // 0.5 NBT
    k_reaction_giver: TOKEN_UNIT / 10,   // 0.1 NBT
    k_reaction_receiver: TOKEN_UNIT / 2, // 0.5 NBT

    decay_factor: RATIO_SCALE / 2, // 0.5x

    default_action_points: INITIAL_ACTION_POINTS,
};
