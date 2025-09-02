use anchor_lang::prelude::*;

// Challenge: How would you update the user state to save "all_deposited_assets" and "all_borrowed_assets" to accommodate for several asset listings?
#[account]
#[derive(InitSpace)]
pub struct User {
    /// Pubkey of the user's wallet
    pub owner: Pubkey,
    /// User's deposited tokens in the SOL bank
    pub deposited_sol: u64,
    /// User's deposited shares in the SOL bank
    pub deposited_sol_shares: u64,
    /// User's borrowed tokens in the SOL bank
    pub borrowed_sol: u64,
    /// User's borrowed shares in the SOL bank
    pub borrowed_sol_shares: u64,
    /// User's deposited tokens in the USDC bank
    pub deposited_usdc: u64,
    /// User's deposited shares in the USDC bank
    pub deposited_usdc_shares: u64,
    /// User's borrowed tokens in the USDC bank
    pub borrowed_usdc: u64,
    /// User's borrowed shares in the USDC bank
    pub borrowed_usdc_shares: u64,
    /// USDC mint address
    pub usdc_address: Pubkey,
    /// Current health factor of the user
    pub health_factor: u64,
    /// Last updated timestamp
    pub last_updated: i64,
}
