use anchor_lang::prelude::*;

use crate::{Forum, User};

use super::RATIO_SCALE;

pub fn reset_user_if_needed(user: &mut User, forum: &Forum) -> Result<()> {
    if user.local_round_number < forum.round_status.round_number {
        user.action_points = forum.round_config.default_action_points.clone();
        user.interaction_metrics.clear();
        user.local_round_number = forum.round_status.round_number;
        //user.claimable_amount = 0;
    }

    Ok(())
}

pub fn calculate_reward(forum: &Forum, k: u64) -> u64 {
    // k * round_distribution_rate / RATIO_SCALE
    k.saturating_mul(forum.round_status.round_distribution_rate)
        .saturating_div(RATIO_SCALE)
}

pub fn distribute_reward(
    user_key: Pubkey,
    user: &mut User,
    reward: u64,
    reason: String,
) -> Result<()> {
    user.claimable_amount += reward;

    msg!("reward,{},{},{}", user_key.to_string(), reward, reason);

    Ok(())
}
