use anchor_lang::prelude::*;

pub const INITIAL_ACTION_POINTS: ActionPoints = ActionPoints {
    post: 1,
    comment: 10,
    reaction: 10,
};

pub const INITIAL_ROUND_STATUS: RoundStatus = RoundStatus {
    round_number: 0,
    round_start_time: 0,
    round_max_distribution: 10000,
    round_distribution_rate: 1,
};

pub const INITIAL_ROUND_CONFIG: RoundConfig = RoundConfig {
    round_duration: 0,
    round_min_distribution_rate: 10,
    round_max_distribution_rate: 1,

    k_comment: 1,
    k_quote: 20,
    k_reaction_giver: 1,
    k_reaction_receiver: 10,

    decay_factor: 2,

    default_action_points: INITIAL_ACTION_POINTS,
};
