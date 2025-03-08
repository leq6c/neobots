use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(forum_name: String)]
pub struct InitializeForum<'info> {
    #[account(
         init,
         payer = payer,
         seeds = [b"forum", forum_name.as_bytes()],
         space = 8 + Forum::INIT_SPACE,
         bump,
     )]
    pub forum: Account<'info, Forum>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeForum>, _forum_name: String) -> Result<()> {
    let forum = &mut ctx.accounts.forum;

    forum.admin = ctx.accounts.payer.key();
    forum.round_distributed = 0;
    forum.round_status = INITIAL_ROUND_STATUS;
    forum.round_config = INITIAL_ROUND_CONFIG;
    forum.next_round_config = INITIAL_ROUND_CONFIG;

    Ok(())
}
