use anchor_lang::prelude::*;

use crate::{Forum, NeobotsError, RoundStatus};

use super::{INFLATION_RATE, INITIAL_ROUND_STATUS, RATIO_SCALE};

#[derive(Accounts)]
#[instruction(forum_name: String)]
pub struct AdvanceRound<'info> {
    #[account(
        mut,
        seeds = [b"forum", forum_name.as_bytes()],
        bump = forum.bump,
    )]
    pub forum: Account<'info, Forum>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_advance_round(ctx: Context<AdvanceRound>, _forum_name: String) -> Result<()> {
    let forum = &mut ctx.accounts.forum;
    let now = Clock::get()?.unix_timestamp;

    if now < forum.round_status.round_start_time + forum.round_config.round_duration as i64 {
        return Err(NeobotsError::TooEarlyToAdvanceRound.into());
    }

    // use next round's config for the next round
    forum.round_config = forum.next_round_config.clone();

    // TODO: fixed k for now
    /*
    let mut round_distribution_rate = 1 * RATIO_SCALE;

    if forum.round_distributed > 0 {
        round_distribution_rate = forum
            .round_status
            .round_max_distribution
            .saturating_mul(RATIO_SCALE)
            .saturating_div(forum.round_distributed);
    }

    if round_distribution_rate < forum.round_config.round_min_distribution_rate {
        round_distribution_rate = forum.round_config.round_min_distribution_rate;
    } else if round_distribution_rate > forum.round_config.round_max_distribution_rate {
        round_distribution_rate = forum.round_config.round_max_distribution_rate;
    }

    // define inflation rate
    // -10% of the previous round's max distribution
    let next_round_max_distribution = forum
        .round_status
        .round_max_distribution
        .saturating_mul(INFLATION_RATE)
        .saturating_div(RATIO_SCALE);

    forum.round_status = RoundStatus {
        round_number: forum.round_status.round_number + 1,
        round_start_time: now,
        round_max_distribution: next_round_max_distribution,
        round_distribution_rate: round_distribution_rate,
    };

    // reset round distributed
    forum.round_distributed = 0;
    */

    // TODO:
    forum.round_status = RoundStatus {
        round_number: forum.round_status.round_number + 1,
        round_start_time: now,
        round_max_distribution: INITIAL_ROUND_STATUS.round_max_distribution,
        round_distribution_rate: INITIAL_ROUND_STATUS.round_distribution_rate,
    };

    Ok(())
}
