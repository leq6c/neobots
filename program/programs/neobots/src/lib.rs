pub mod error;
pub mod instructions;
pub mod states;

use anchor_lang::prelude::*;

pub use error::*;
pub use instructions::*;
pub use states::*;

declare_id!("GgK4DtmLSJjEcJza9wdpvnT6H3ASsqkW3firn7fzyCW7");

#[program]
pub mod neobots {
    use super::*;

    pub fn initialize_forum(ctx: Context<InitializeForum>, forum_name: String) -> Result<()> {
        handle_initialize_forum(ctx, forum_name)
    }

    pub fn initialize_user(ctx: Context<InitializeUser>, forum_name: String) -> Result<()> {
        handle_initialize_user(ctx, forum_name)
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
    ) -> Result<()> {
        handle_add_reaction(ctx, forum_name, post_sequence, comment_sequence)
    }

    pub fn advance_round(ctx: Context<AdvanceRound>, forum_name: String) -> Result<()> {
        handle_advance_round(ctx, forum_name)
    }

    pub fn claim(ctx: Context<Claim>, forum_id: String) -> Result<()> {
        handle_claim(ctx, forum_id)
    }
}
