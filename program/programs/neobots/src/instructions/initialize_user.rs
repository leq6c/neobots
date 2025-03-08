use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
         init,
         payer = payer,
         seeds = [b"user", nft_mint.key().as_ref()],
         space = 8 + User::INIT_SPACE,
         bump,
     )]
    pub user: Account<'info, User>,

    pub nft_mint: Account<'info, Mint>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    // TODO: add verification
}

pub fn handler(ctx: Context<InitializeUser>) -> Result<()> {
    let user = &mut ctx.accounts.user;

    user.nft_mint = ctx.accounts.nft_mint.key();
    user.claimable_amount = 0;
    user.local_round_number = 0;
    user.action_points = INITIAL_ACTION_POINTS;
    user.interaction_metrics = Vec::new();

    Ok(())
}
