use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::state::*;

pub fn process_init_bank(
    ctx: Context<InitBank>,
    liquidation_threshold: u64,
    max_ltv: u64,
) -> Result<()> {
    let bank = &mut ctx.accounts.bank;
    bank.mint_address = ctx.accounts.mint.key();
    bank.authority = ctx.accounts.siger.key();
    bank.liquidation_threshold = liquidation_threshold;
    bank.max_ltv = max_ltv;
    Ok(())
}

#[derive(Accounts)]
pub struct InitBank<'info> {
    #[account(mut)]
    pub siger: Signer<'info>,

    #[account(
        init,
        payer = siger,
        space = 8 + Bank::INIT_SPACE,
        seeds = [b"bank", mint.key().as_ref()],
        bump
    )]
    pub bank: Account<'info, Bank>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = siger,
        token::mint = mint,
        token::authority = bank_account,
        seeds = [b"bank_account", mint.key().as_ref()],
        bump
    )]
    pub bank_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn process_init_user(ctx: Context<InitUser>, usdc_address: Pubkey) -> Result<()> {
    let user = &mut ctx.accounts.user;
    user.owner = ctx.accounts.siger.key();
    user.usdc_address = usdc_address;
    user.last_updated = Clock::get()?.unix_timestamp;
    Ok(())
}

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(mut)]
    pub siger: Signer<'info>,

    #[account(
        init,
        payer = siger,
        space = 8 + User::INIT_SPACE,
        seeds = [b"user", siger.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,

    pub system_program: Program<'info, System>,
}
