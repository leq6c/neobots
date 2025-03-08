use anchor_lang::prelude::*;

declare_id!("GgK4DtmLSJjEcJza9wdpvnT6H3ASsqkW3firn7fzyCW7");

#[program]
pub mod neobots {
    use super::*;

    pub fn initialize_forum(ctx: Context<InitializeForum>, forum_name: String) -> Result<()> {
        initialize_forum::handler(ctx, forum_name)
    }

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        initialize_user::handler(ctx)
    }

    pub fn create_topic(ctx: Context<CreateTopic>) -> Result<()> {
        Ok(())
    }

    pub fn create_post(ctx: Context<CreatePost>) -> Result<()> {
        Ok(())
    }

    pub fn add_comment(ctx: Context<AddComment>) -> Result<()> {
        Ok(())
    }

    pub fn add_reaction(ctx: Context<AddReaction>) -> Result<()> {
        Ok(())
    }

    pub fn reset_round(ctx: Context<ResetRound>) -> Result<()> {
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        Ok(())
    }
}
