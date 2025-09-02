use crate::calc_interest::calculate_accrued_interest;
use crate::constants::{MAXIMUM_AGE, SOL_USD_FEED_ID, USDC_USD_FEED_ID};
use crate::error::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};
use std::convert::TryInto;

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        seeds = [b"bank", mint.key().as_ref()],
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
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub user_account: InterfaceAccount<'info, TokenAccount>,

    pub price_update: Account<'info, PriceUpdateV2>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn process_borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
    let bank = &mut ctx.accounts.bank;
    let user = &mut ctx.accounts.user;
    let price_update = &ctx.accounts.price_update;

    //
    // -------- 1. 获取价格源
    //
    let sol_feed_id = get_feed_id_from_hex(SOL_USD_FEED_ID)?;
    let usdc_feed_id = get_feed_id_from_hex(USDC_USD_FEED_ID)?;

    let sol_price =
        price_update.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &sol_feed_id)?;
    let usdc_price =
        price_update.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &usdc_feed_id)?;

    //
    // -------- 2. 计算带利息的抵押品价值
    //
    let accrued_sol =
        calculate_accrued_interest(user.deposited_sol, bank.interest_rate, user.last_updated)?;

    let accrued_usdc =
        calculate_accrued_interest(user.deposited_usdc, bank.interest_rate, user.last_updated)?;

    let total_collateral_usd: u128 = (accrued_sol as u128)
        .checked_mul(sol_price.price as u128)
        .unwrap()
        + (accrued_usdc as u128)
            .checked_mul(usdc_price.price as u128)
            .unwrap();

    //
    // -------- 3. 应用清算阈值
    //
    let borrowable_value_usd: u128 = total_collateral_usd
        .checked_mul(bank.liquidation_threshold as u128)
        .unwrap()
        / 10_000; // 假设 liquidation_threshold 是 bps

    //
    // -------- 4. 换算成用户想借的资产数量
    //
    let target_feed_id = if ctx.accounts.mint.key() == user.usdc_address {
        usdc_feed_id
    } else {
        sol_feed_id
    };

    let target_price =
        price_update.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &target_feed_id)?;

    let borrowable_amount: u64 = (borrowable_value_usd
        .checked_div(target_price.price as u128)
        .unwrap())
    .try_into()
    .unwrap();

    //
    // -------- 5. 校验用户是否超额借款
    //
    require!(amount <= borrowable_amount, ErrorCode::OverBorrowableAmount);

    //
    // -------- 6. CPI 转账：从 bank treasury → user
    //
    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.bank_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.user_account.to_account_info(),
        authority: ctx.accounts.bank_account.to_account_info(),
    };

    let mint_key = ctx.accounts.mint.key();
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"bank_account",
        mint_key.as_ref(),
        &[ctx.bumps.bank_account],
    ]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_cpi_accounts,
        signer_seeds,
    );
    transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

    //
    // -------- 7. 更新 Bank & User 状态
    //
    if bank.total_borrowed == 0 {
        bank.total_borrowed = amount;
        bank.total_borrowed_shares = amount;
    }

    let user_shares = bank
        .total_borrowed_shares
        .checked_mul(amount)
        .unwrap()
        .checked_div(bank.total_borrowed)
        .unwrap();

    bank.total_borrowed += amount;
    bank.total_borrowed_shares += user_shares;

    if ctx.accounts.mint.key() == user.usdc_address {
        user.borrowed_usdc += amount;
        user.borrowed_usdc_shares += user_shares;
    } else {
        user.borrowed_sol += amount;
        user.borrowed_sol_shares += user_shares;
    }

    // 更新最后一次计息时间
    user.last_updated = Clock::get()?.unix_timestamp;

    Ok(())
}
