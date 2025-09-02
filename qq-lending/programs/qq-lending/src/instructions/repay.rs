use crate::error::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        seeds = [b"bank",mint.key().as_ref()],
        bump,
    )]
    pub bank: Account<'info, Bank>,
    #[account(
        mut,
        seeds = [b"bank_account", mint.key().as_ref()],
        bump,
    )]
    pub bank_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
    )]
    pub user: Account<'info, User>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub user_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn process_repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
    let bank = &mut ctx.accounts.bank;
    let user = &mut ctx.accounts.user;

    //
    // -------- 1. 校验用户是否有足够的债务可还
    //
    let borrowed_asset = if ctx.accounts.mint.key() == user.usdc_address {
        user.borrowed_usdc
    } else {
        user.borrowed_sol
    };

    require!(amount <= borrowed_asset, ErrorCode::OverRepay);

    //
    // -------- 2. CPI 转账：用户 → 银行金库
    //
    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.user_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.bank_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, transfer_cpi_accounts);
    let decimals = ctx.accounts.mint.decimals;

    token_interface::transfer_checked(cpi_ctx, amount, decimals)?;

    //
    // -------- 3. 计算用户应减去的 shares
    //
    let users_shares = amount
        .checked_mul(bank.total_borrowed_shares)
        .unwrap()
        .checked_div(bank.total_borrowed)
        .unwrap();

    //
    // -------- 4. 更新 User & Bank 状态
    //
    if ctx.accounts.mint.key() == user.usdc_address {
        user.borrowed_usdc = user.borrowed_usdc.checked_sub(amount).unwrap();
        user.borrowed_usdc_shares = user.borrowed_usdc_shares.checked_sub(users_shares).unwrap();
    } else {
        user.borrowed_sol = user.borrowed_sol.checked_sub(amount).unwrap();
        user.borrowed_sol_shares = user.borrowed_sol_shares.checked_sub(users_shares).unwrap();
    }

    bank.total_borrowed = bank.total_borrowed.checked_sub(amount).unwrap();
    bank.total_borrowed_shares = bank
        .total_borrowed_shares
        .checked_sub(users_shares)
        .unwrap();

    Ok(())
}
