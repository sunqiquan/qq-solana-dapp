use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::shared::*;
use crate::{error::SwapError, Offer};

#[derive(Accounts)]
pub struct TakeOffer<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(mut)]
    pub maker: SystemAccount<'info>,

    pub token_mint_a: InterfaceAccount<'info, Mint>,
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_b,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        close = maker,
        has_one = maker,
        has_one = token_mint_a,
        has_one = token_mint_b,
        seeds = [b"offer", maker.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    offer: Account<'info, Offer>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    vault: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

fn send_wanted_tokens_to_maker(ctx: &Context<TakeOffer>) -> Result<()> {
    transfer_tokens(
        &ctx.accounts.taker_token_account_b,
        &ctx.accounts.maker_token_account_b,
        ctx.accounts.offer.token_b_wanted_amount,
        &ctx.accounts.token_mint_b,
        &ctx.accounts.taker,
        &ctx.accounts.token_program,
    )
}

fn withdraw_and_close_vault(ctx: &Context<TakeOffer>) -> Result<()> {
    let seeds = &[
        b"offer",
        ctx.accounts.maker.to_account_info().key.as_ref(),
        &ctx.accounts.offer.id.to_le_bytes()[..],
        &[ctx.accounts.offer.bump],
    ];
    let signer_seeds = [&seeds[..]];

    // transfer tokenA from vault to taker
    transfer_tokens_with_singer(
        &ctx.accounts.vault,
        &ctx.accounts.taker_token_account_a,
        ctx.accounts.vault.amount,
        &ctx.accounts.token_mint_a,
        ctx.accounts.offer.to_account_info(),
        &ctx.accounts.token_program,
        &signer_seeds,
    )?;

    // close vault
    swap_close_account(
        &ctx.accounts.vault,
        &ctx.accounts.maker,
        ctx.accounts.offer.to_account_info(),
        &ctx.accounts.token_program,
        &signer_seeds,
    )
}

pub fn take_offer_atomic(ctx: &Context<TakeOffer>) -> Result<()> {
    // check maker != taker
    require_keys_neq!(
        ctx.accounts.maker.key(),
        ctx.accounts.taker.key(),
        SwapError::TakerIsMaker
    );

    // check taker has enough tokenB
    require!(
        ctx.accounts.taker_token_account_b.amount >= ctx.accounts.offer.token_b_wanted_amount,
        SwapError::InsufficientTakerB
    );

    // check vault is not empty
    require!(ctx.accounts.vault.amount > 0, SwapError::EmptyVault);

    // transfer tokenB to maker
    send_wanted_tokens_to_maker(ctx)?;

    // withdraw and close vault
    withdraw_and_close_vault(ctx)?;

    Ok(())
}
