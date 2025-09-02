use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::error::ErrorCode;
use crate::{Bank, User};

pub fn process_withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let bank = &mut ctx.accounts.bank;
    let user = &mut ctx.accounts.user;

    // 1. CPI transfer from bank's token account to user's token account
    if ctx.accounts.mint.to_account_info().key() == user.usdc_address {
        require!(amount >= user.deposited_usdc, ErrorCode::InsufficientFunds);
    } else {
        require!(amount >= user.deposited_sol, ErrorCode::InsufficientFunds);
    }

    let mint_key = ctx.accounts.mint.key();
    let singer_seeds: &[&[&[u8]]] = &[&[
        b"bank_account",
        mint_key.as_ref(),
        &[ctx.bumps.bank_account],
    ]];
    let transfer_cip_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.bank_account.to_account_info(),
            to: ctx.accounts.user_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.bank_account.to_account_info(),
        },
        singer_seeds,
    );
    transfer_checked(transfer_cip_ctx, amount, ctx.accounts.mint.decimals)?;

    // 2. Calculate new shares to be removed from the bank
    let shares_to_remove = bank
        .total_deposit_shares
        .checked_mul(amount)
        .unwrap()
        .checked_div(bank.total_deposits)
        .unwrap();

    // 3. Update user's deposited amount and total collateral value
    if ctx.accounts.mint.to_account_info().key() == user.usdc_address {
        user.deposited_usdc -= amount;
        user.deposited_usdc_shares -= shares_to_remove;
    } else {
        user.deposited_sol -= amount;
        user.deposited_sol_shares -= shares_to_remove;
    }
    user.last_updated = Clock::get()?.unix_timestamp;

    // 4. Update bank's total deposits and total deposit shares
    bank.total_deposits -= amount;
    bank.total_deposit_shares -= shares_to_remove;

    // 5. Update users health factor ??

    Ok(())
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub siger: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [b"bank", mint.key().as_ref()],
        bump
    )]
    pub bank: Account<'info, Bank>,

    #[account(
        mut,
        seeds = [b"bank_account", mint.key().as_ref()],
        bump
    )]
    pub bank_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"user", siger.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,

    #[account(
        init_if_needed,
        payer = siger,
        associated_token::mint = mint,
        associated_token::authority = siger,
        associated_token::token_program = token_program
    )]
    pub user_account: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
