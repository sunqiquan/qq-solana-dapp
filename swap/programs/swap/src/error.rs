use anchor_lang::prelude::*;

#[error_code]
pub enum SwapError {
    #[msg("Taker can not be the Maker.")]
    TakerIsMaker,

    #[msg("Taker TokenB balance is insufficient.")]
    InsufficientTakerB,

    #[msg("Vault is empty.")]
    EmptyVault,
}
