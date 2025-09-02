use crate::constants::{MAXIMUM_AGE, SOL_USD_FEED_ID, USDC_USD_FEED_ID};
use crate::error::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, Price, PriceUpdateV2};
use std::convert::TryInto;

const WAD: u128 = 1_000_000_000_000_000_000u128; // 1e18
const BPS_DIVISOR: u128 = 10_000u128; // 表示 basis points 的分母

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,
    pub price_update: Account<'info, PriceUpdateV2>,
    pub collateral_mint: InterfaceAccount<'info, Mint>,
    pub borrowed_mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        seeds = [b"bank", collateral_mint.key().as_ref()],
        bump,
    )]
    pub collateral_bank: Account<'info, Bank>,
    #[account(
        mut,
        seeds = [b"bank_account", collateral_mint.key().as_ref()],
        bump,
    )]
    pub collateral_bank_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"bank", borrowed_mint.key().as_ref()],
        bump,
    )]
    pub borrowed_bank: Account<'info, Bank>,
    #[account(
        mut,
        seeds = [b"bank_account", borrowed_mint.key().as_ref()],
        bump,
    )]
    pub borrowed_bank_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"user", liquidator.key().as_ref()],
        bump,
    )]
    pub user: Account<'info, User>,
    #[account(
        init_if_needed,
        payer = liquidator,
        associated_token::mint = collateral_mint,
        associated_token::authority = liquidator,
        associated_token::token_program = token_program,
    )]
    pub liquidator_collateral_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = liquidator,
        associated_token::mint = borrowed_mint,
        associated_token::authority = liquidator,
        associated_token::token_program = token_program,
    )]
    pub liquidator_borrowed_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn process_liquidate(ctx: Context<Liquidate>) -> Result<()> {
    let collateral_bank = &mut ctx.accounts.collateral_bank;
    let borrowed_bank = &mut ctx.accounts.borrowed_bank;
    let user = &mut ctx.accounts.user;
    let price_update = &mut ctx.accounts.price_update;

    // 1) 读取价格（Pyth）并把 price -> WAD (1e18) 定点表示
    let sol_feed_id = get_feed_id_from_hex(SOL_USD_FEED_ID)?;
    let usdc_feed_id = get_feed_id_from_hex(USDC_USD_FEED_ID)?;
    let sol_price =
        price_update.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &sol_feed_id)?;
    let usdc_price =
        price_update.get_price_no_older_than(&Clock::get()?, MAXIMUM_AGE, &usdc_feed_id)?;

    // 把 pyth 的 price (+expo) 转成以 WAD 为单位的 price（price_wad = price * WAD）
    let price_to_wad = |p: &Price| -> u128 {
        // p has fields: price: i64, expo: i32
        let p_i128 = p.price as i128;
        let expo = p.exponent;
        // scaled = p * WAD * 10^{expo}
        // if expo < 0 -> divide by 10^{-expo}
        let mut scaled = p_i128.checked_mul(WAD as i128).unwrap();
        if expo < 0 {
            let denom = 10i128.pow((-expo) as u32);
            scaled = scaled.checked_div(denom).unwrap();
        } else if expo > 0 {
            let mul = 10i128.pow(expo as u32);
            scaled = scaled.checked_mul(mul).unwrap();
        }
        // assume price positive for simplicity
        scaled as u128
    };

    let sol_price_wad = price_to_wad(&sol_price);
    let usdc_price_wad = price_to_wad(&usdc_price);

    // 2) 计算用户的 total_collateral_usd_wad 和 total_borrowed_usd_wad
    // 我们把两种 mint（collateral_mint / borrowed_mint）都视为可能的两个资产（USDC 和 SOL）——
    // 根据 user.usdc_address 来判断哪个 mint 属于 USDC，哪个属于 SOL。
    let usdc_mint_pubkey = user.usdc_address;

    // helper to compute contribution of a given mint to collateral/borrowed (token units -> usd_wad)
    let calc_value_wad_for_mint = |mint_decimals: u8, is_usdc: bool, token_amount: u64| -> u128 {
        let price_wad = if is_usdc {
            usdc_price_wad
        } else {
            sol_price_wad
        };
        let amount_u128 = token_amount as u128;
        let mint_scale = 10u128.pow(mint_decimals as u32);
        // value_wad = token_amount * price_wad / 10^{mint_decimals}
        amount_u128
            .checked_mul(price_wad)
            .unwrap()
            .checked_div(mint_scale)
            .unwrap()
    };

    // For the two mints passed in the instruction, determine whether they correspond to USDC (user.usdc_address) or SOL.
    // Then add appropriate contributions using user.deposited_*/borrowed_*.
    let mut total_collateral_usd_wad: u128 = 0;
    let mut total_borrowed_usd_wad: u128 = 0;

    // Process collateral_mint
    let collateral_is_usdc = ctx.accounts.collateral_mint.key() == usdc_mint_pubkey;
    let collateral_decimals = ctx.accounts.collateral_mint.decimals;
    let collateral_token_deposited = if collateral_is_usdc {
        user.deposited_usdc
    } else {
        user.deposited_sol
    };
    let collateral_token_borrowed = if collateral_is_usdc {
        user.borrowed_usdc
    } else {
        user.borrowed_sol
    };

    total_collateral_usd_wad = total_collateral_usd_wad
        .checked_add(calc_value_wad_for_mint(
            collateral_decimals,
            collateral_is_usdc,
            collateral_token_deposited,
        ))
        .unwrap();
    total_borrowed_usd_wad = total_borrowed_usd_wad
        .checked_add(calc_value_wad_for_mint(
            collateral_decimals,
            collateral_is_usdc,
            collateral_token_borrowed,
        ))
        .unwrap();

    // Process borrowed_mint (the other mint)
    let borrowed_is_usdc = ctx.accounts.borrowed_mint.key() == usdc_mint_pubkey;
    let borrowed_decimals = ctx.accounts.borrowed_mint.decimals;
    let borrowed_token_deposited = if borrowed_is_usdc {
        user.deposited_usdc
    } else {
        user.deposited_sol
    };
    let borrowed_token_borrowed = if borrowed_is_usdc {
        user.borrowed_usdc
    } else {
        user.borrowed_sol
    };

    total_collateral_usd_wad = total_collateral_usd_wad
        .checked_add(calc_value_wad_for_mint(
            borrowed_decimals,
            borrowed_is_usdc,
            borrowed_token_deposited,
        ))
        .unwrap();
    total_borrowed_usd_wad = total_borrowed_usd_wad
        .checked_add(calc_value_wad_for_mint(
            borrowed_decimals,
            borrowed_is_usdc,
            borrowed_token_borrowed,
        ))
        .unwrap();

    // 3) 检查是否 undercollateralized
    // collateral_threshold = total_collateral * liquidation_threshold_bps / 10000
    let collateral_threshold_wad = total_collateral_usd_wad
        .checked_mul(collateral_bank.liquidation_threshold as u128)
        .unwrap()
        .checked_div(BPS_DIVISOR)
        .unwrap();

    // If collateral threshold >= borrowed -> NOT undercollateralized (no liquidation)
    if collateral_threshold_wad >= total_borrowed_usd_wad {
        return Err(ErrorCode::NotUndercollateralized.into());
    }

    // 4) 计算本次清算应该偿还多少 borrowed（以 USD_wad）
    // liquidation_close_factor 假设为 BPS，例如 5000 = 50%
    let liquidation_usd_wad = total_borrowed_usd_wad
        .checked_mul(collateral_bank.liquidation_close_factor as u128)
        .unwrap()
        .checked_div(BPS_DIVISOR)
        .unwrap();

    // 5) 把 liquidation_usd_wad 换算成 borrowed token 的最小单位（token_amount）
    let borrowed_price_wad = if borrowed_is_usdc {
        usdc_price_wad
    } else {
        sol_price_wad
    };
    let borrowed_mint_scale = 10u128.pow(borrowed_decimals as u32);

    // token_amount = liquidation_usd_wad * 10^{mint_decimals} / price_wad
    let borrowed_token_amount_u128 = liquidation_usd_wad
        .checked_mul(borrowed_mint_scale)
        .unwrap()
        .checked_div(borrowed_price_wad)
        .unwrap();

    // ensure fits u64 (transfer_checked expects u64 amount)
    let borrowed_token_amount: u64 = borrowed_token_amount_u128.try_into().unwrap();

    // 6) liquidator 将 borrowed token 转到 borrowed_bank_token_account（CPI，签名人是 liquidator）
    let transfer_to_bank = TransferChecked {
        from: ctx.accounts.liquidator_borrowed_account.to_account_info(),
        mint: ctx.accounts.borrowed_mint.to_account_info(),
        to: ctx.accounts.borrowed_bank_account.to_account_info(),
        authority: ctx.accounts.liquidator.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx_to_bank = CpiContext::new(cpi_program.clone(), transfer_to_bank);
    let borrowed_decimals_u8 = ctx.accounts.borrowed_mint.decimals;
    transfer_checked(cpi_ctx_to_bank, borrowed_token_amount, borrowed_decimals_u8)?;

    // 7) 计算应给 liquidator 的抵押物数量（含 bonus）
    // collateral_value_to_transfer = liquidation_usd_wad * (1 + bonus_bps/10000)
    let bonus_numerator = BPS_DIVISOR + collateral_bank.liquidation_bonus as u128;
    let collateral_value_to_transfer_wad = liquidation_usd_wad
        .checked_mul(bonus_numerator)
        .unwrap()
        .checked_div(BPS_DIVISOR)
        .unwrap();

    let collateral_price_wad = if collateral_is_usdc {
        usdc_price_wad
    } else {
        sol_price_wad
    };
    let collateral_mint_scale = 10u128.pow(collateral_decimals as u32);

    let collateral_token_amount_u128 = collateral_value_to_transfer_wad
        .checked_mul(collateral_mint_scale)
        .unwrap()
        .checked_div(collateral_price_wad)
        .unwrap();

    let collateral_token_amount: u64 = collateral_token_amount_u128.try_into().unwrap();

    // 8) 把抵押物从 collateral_bank_token_account (PDA) 转给 liquidator 的 ATA（需要 PDA 签名）
    let transfer_to_liquidator = TransferChecked {
        from: ctx.accounts.collateral_bank_account.to_account_info(),
        mint: ctx.accounts.collateral_mint.to_account_info(),
        to: ctx.accounts.liquidator_collateral_account.to_account_info(),
        authority: ctx.accounts.collateral_bank_account.to_account_info(),
    };

    let mint_key = ctx.accounts.collateral_mint.key();
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"treasury",
        mint_key.as_ref(),
        &[ctx.bumps.collateral_bank_account],
    ]];
    let cpi_ctx_to_liquidator =
        CpiContext::new(cpi_program.clone(), transfer_to_liquidator).with_signer(signer_seeds);
    let collateral_decimals_u8 = ctx.accounts.collateral_mint.decimals;
    transfer_checked(
        cpi_ctx_to_liquidator,
        collateral_token_amount,
        collateral_decimals_u8,
    )?;

    // 9) 更新状态（减少 user 的 borrowed 与 collateral，更新 banks）
    // 注意：这里我们以 token 最小单位直接减值。真实协议中应同步调整 shares（这里示例只做量的更新）
    if borrowed_is_usdc {
        user.borrowed_usdc = user
            .borrowed_usdc
            .checked_sub(borrowed_token_amount)
            .unwrap();
    } else {
        user.borrowed_sol = user
            .borrowed_sol
            .checked_sub(borrowed_token_amount)
            .unwrap();
    }

    if collateral_is_usdc {
        user.deposited_usdc = user
            .deposited_usdc
            .checked_sub(collateral_token_amount)
            .unwrap();
    } else {
        user.deposited_sol = user
            .deposited_sol
            .checked_sub(collateral_token_amount)
            .unwrap();
    }

    // 更新 bank 的总量（注意：production 中应按 shares 调整）
    borrowed_bank.total_borrowed = borrowed_bank
        .total_borrowed
        .checked_sub(borrowed_token_amount)
        .unwrap();
    collateral_bank.total_deposits = collateral_bank
        .total_deposits
        .checked_sub(collateral_token_amount)
        .unwrap();

    user.last_updated = Clock::get()?.unix_timestamp;

    Ok(())
}
