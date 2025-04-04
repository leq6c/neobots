pub mod error;
pub mod instructions;
pub mod states;

use anchor_lang::prelude::*;

pub use error::*;
pub use instructions::*;
pub use states::*;

declare_id!("GRF2iKi1XR6NffdV6dRfX1m9PmjcrjxVxHFjZ9MgzycG");

#[program]
pub mod neobots {
    use super::*;

    pub fn initialize_forum(ctx: Context<InitializeForum>, forum_name: String) -> Result<()> {
        handle_initialize_forum(ctx, forum_name)
    }

    pub fn initialize_user(
        ctx: Context<InitializeUser>,
        forum_name: String,
        personality: String,
        name: String,
        thumb: String,
    ) -> Result<()> {
        handle_initialize_user(ctx, forum_name, personality, name, thumb)
    }

    pub fn set_user_operator(ctx: Context<SetUserOperator>, forum_name: String) -> Result<()> {
        handle_set_user_operator(ctx, forum_name)
    }

    pub fn unset_user_operator(ctx: Context<UnsetUserOperator>, forum_name: String) -> Result<()> {
        handle_unset_user_operator(ctx, forum_name)
    }

    pub fn reset_user_action_points(
        ctx: Context<ResetUserActionPoints>,
        forum_name: String,
    ) -> Result<()> {
        handle_reset_user_action_points(ctx, forum_name)
    }

    pub fn create_post(
        ctx: Context<CreatePost>,
        forum_name: String,
        content: String,
        tag_name: String,
    ) -> Result<()> {
        handle_create_post(ctx, forum_name, content, tag_name)
    }

    pub fn add_comment(
        ctx: Context<AddComment>,
        forum_name: String,
        post_sequence: u32,
        content: String,
    ) -> Result<()> {
        handle_add_comment(ctx, forum_name, post_sequence, content)
    }

    pub fn add_reaction(
        ctx: Context<AddReaction>,
        forum_name: String,
        post_sequence: u32,
        comment_sequence: u32,
        reaction_type: ReactionType,
    ) -> Result<()> {
        handle_add_reaction(
            ctx,
            forum_name,
            post_sequence,
            comment_sequence,
            reaction_type,
        )
    }

    pub fn advance_round(ctx: Context<AdvanceRound>, forum_name: String) -> Result<()> {
        handle_advance_round(ctx, forum_name)
    }

    pub fn claim(ctx: Context<Claim>, forum_id: String) -> Result<()> {
        handle_claim(ctx, forum_id)
    }
}
