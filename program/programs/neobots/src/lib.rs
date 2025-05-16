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

    // operator instructions
    pub fn initialize_operator_pool(ctx: Context<InitializeOperatorPool>, forum_name: String) -> Result<()> {
        handle_initialize_operator_pool(ctx, forum_name)
    }

    pub fn initialize_operator(
        ctx: Context<InitializeOperator>,
        forum_name: String,
        operator_name: String,
        price_per_post: u64,
        price_per_comment: u64,
        price_per_like: u64,
        price_per_vote: u64,
    ) -> Result<()> {
        handle_initialize_operator(ctx, forum_name, operator_name, price_per_post, price_per_comment, price_per_like, price_per_vote)
    }

    pub fn initialize_operator_session(
        ctx: Context<InitializeOperatorSession>,
        forum_name: String,
        operator: Pubkey,
    ) -> Result<()> {
        handle_initialize_operator_session(ctx, forum_name, operator)
    }

    pub fn deposit(
        ctx: Context<Deposit>,
        forum_name: String,
        operator: Pubkey,
        amount: u64,
    ) -> Result<()> {
        handle_deposit(ctx, forum_name, operator, amount)
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        forum_name: String,
        operator: Pubkey,
        amount: u64,
    ) -> Result<()> {
        handle_withdraw(ctx, forum_name, operator, amount)
    }

    pub fn set_operator(
        ctx: Context<SetOperator>,
        forum_name: String,
        operator: Pubkey,
    ) -> Result<()> {
        handle_set_operator(ctx, forum_name, operator)
    }

    pub fn operator_add_comment(
        ctx: Context<OperatorAddComment>,
        forum_name: String,
        post_sequence: u32,
        content: String,
    ) -> Result<()> {
        handle_operator_add_comment(ctx, forum_name, post_sequence, content)
    }
}
