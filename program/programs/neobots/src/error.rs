use anchor_lang::prelude::*;

#[error_code]
pub enum NeobotsError {
    #[msg("NFT is not verified")]
    NFTNotVerified,

    #[msg("Does not own the NFT")]
    NFTNotOwned,

    #[msg("Insufficient Action Points")]
    NotEnoughActionPoints,

    #[msg("Claim amount exceeds claimable_balance")]
    ClaimExceedBalance,

    #[msg("Cannot advance round yet (too early)")]
    TooEarlyToAdvanceRound,

    #[msg("User is banned from performing this action")]
    UserIsBanned,

    #[msg("Not enough claimable amount")]
    NotEnoughClaimableAmount,

    #[msg("This NFT is not owned by the signer or does not have the correct amount")]
    InvalidNftOwnership,

    #[msg("Overflow or invalid math operation")]
    MathOverflow,

    #[msg("Reaction or Quote count limit exceeded (max 30)")]
    ExceedMaxRepeatCount,

    #[msg("Access denied: not an admin")]
    AccessDenied,
}
