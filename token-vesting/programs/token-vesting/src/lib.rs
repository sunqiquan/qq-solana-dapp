#[warn(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};
declare_id!("6gQrFJFHcqBoSA89jxajLzogHCLQtoVemFse3KC3VsDG");

const TREASURY_TOKEN_AMOUNT: u64 = 1_000_000_000;

#[program]
pub mod token_vesting {
    use super::*;

    pub fn create_vesting_account(
        ctx: Context<CreateTreasuryVesting>,
        _company_name_hash: [u8; 32],
        company_name: String,
    ) -> Result<()> {
        ctx.accounts.treasury_vesting.set_inner(TreasuryVesting {
            owner: ctx.accounts.signer.key(),
            mint: ctx.accounts.mint.key(),
            treasury_token_account: ctx.accounts.treasury_token_account.key(),
            company_name,
            treasury_vesting_bump: ctx.bumps.treasury_vesting,
            treasury_token_account_bump: ctx.bumps.treasury_token_account,
        });

        // fund to treasury_token_account
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.mint_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_context =
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        transfer_checked(
            cpi_context,
            TREASURY_TOKEN_AMOUNT,
            ctx.accounts.mint.decimals,
        )
    }

    pub fn create_employee_vesting(
        ctx: Context<CreateEmployeeVesting>,
        _company_name_hash: [u8; 32],
        start_time: i64,
        end_time: i64,
        total_amount: i64,
    ) -> Result<()> {
        ctx.accounts.employee_vesting.set_inner(EmployeeVesting {
            beneficiary: ctx.accounts.beneficiary.key(),
            start_time,
            end_time,
            total_amount,
            total_withdrawn: 0,
            treasury_vesting: ctx.accounts.treasury_vesting.key(),
            employee_vesting_bump: ctx.bumps.employee_vesting,
        });
        Ok(())
    }

    pub fn claim_tokens(ctx: Context<ClaimTokens>, company_name_hash: [u8; 32]) -> Result<()> {
        let employee_vesting = &mut ctx.accounts.employee_vesting;
        let now = Clock::get()?.unix_timestamp * 1000; // in milliseconds
        let time_since_start = now.saturating_sub(employee_vesting.start_time);
        require!(time_since_start > 0, ErrorCode::ClamingNotAvailable);

        // calculate amount to be claimed
        let vested_amount = if now >= employee_vesting.end_time {
            employee_vesting.total_amount
        } else {
            let total_vesting_time = employee_vesting.end_time - employee_vesting.start_time;
            (employee_vesting.total_amount * time_since_start) / total_vesting_time
        };

        let claimable_amount = vested_amount.saturating_sub(employee_vesting.total_withdrawn);
        require!(claimable_amount > 0, ErrorCode::NothingToClaim);

        let transfer_cpi_accounts = TransferChecked {
            from: ctx.accounts.treasury_token_account.to_account_info(),
            to: ctx.accounts.employee_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.treasury_vesting.to_account_info(),
        };

        let seeds = &[
            b"treasury_vesting",
            company_name_hash.as_ref(),
            &[ctx.accounts.treasury_vesting.treasury_vesting_bump],
        ];
        let signer_seeds = [&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_cpi_accounts,
            &signer_seeds,
        );
        transfer_checked(
            cpi_context,
            claimable_amount as u64,
            ctx.accounts.mint.decimals,
        )?;
        employee_vesting.total_withdrawn += claimable_amount;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(company_name_hash: [u8; 32])]
pub struct CreateTreasuryVesting<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + TreasuryVesting::INIT_SPACE,
        seeds = [b"treasury_vesting", company_name_hash.as_ref()],
        bump
    )]
    pub treasury_vesting: Account<'info, TreasuryVesting>,

    #[account(
        init,
        payer = signer,
        token::mint = mint,
        token::authority = treasury_vesting,
        seeds = [b"treasury_token_account", treasury_vesting.key().as_ref()],
        bump
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program
    )]
    pub mint_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = mint.mint_authority == COption::Some(signer.key())
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
#[derive(InitSpace)]
pub struct TreasuryVesting {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub treasury_token_account: Pubkey,
    #[max_len(64)]
    pub company_name: String,
    pub treasury_vesting_bump: u8,
    pub treasury_token_account_bump: u8,
}

#[derive(Accounts)]
#[instruction(company_name_hash: [u8; 32])]
pub struct CreateEmployeeVesting<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    pub beneficiary: SystemAccount<'info>,

    #[account(
        has_one = owner,
        seeds = [b"treasury_vesting", company_name_hash.as_ref()],
        bump = treasury_vesting.treasury_vesting_bump
    )]
    pub treasury_vesting: Account<'info, TreasuryVesting>,

    #[account(
        init,
        payer = owner,
        space = 8 + EmployeeVesting::INIT_SPACE,
        seeds = [b"employee_vesting", beneficiary.key().as_ref(), treasury_vesting.key().as_ref()],
        bump
    )]
    pub employee_vesting: Account<'info, EmployeeVesting>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct EmployeeVesting {
    pub beneficiary: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub total_amount: i64,
    pub total_withdrawn: i64,
    pub treasury_vesting: Pubkey,
    pub employee_vesting_bump: u8,
}

#[derive(Accounts)]
#[instruction(company_name_hash: [u8; 32])]
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub beneficiary: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = mint,
        has_one = treasury_token_account,
        seeds = [b"treasury_vesting", company_name_hash.as_ref()],
        bump = treasury_vesting.treasury_vesting_bump
    )]
    pub treasury_vesting: Account<'info, TreasuryVesting>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = treasury_vesting,
        seeds = [b"treasury_token_account", treasury_vesting.key().as_ref()],
        bump = treasury_vesting.treasury_token_account_bump
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        has_one = beneficiary,
        has_one = treasury_vesting,
        seeds = [b"employee_vesting", beneficiary.key().as_ref(), treasury_vesting.key().as_ref()],
        bump = employee_vesting.employee_vesting_bump
    )]
    pub employee_vesting: Account<'info, EmployeeVesting>,

    #[account(
        init_if_needed,
        payer = beneficiary,
        associated_token::mint = mint,
        associated_token::authority = beneficiary,
        associated_token::token_program = token_program,
    )]
    pub employee_token_account: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Claming is not avaiable yet.")]
    ClamingNotAvailable,

    #[msg("There is nothing to claim.")]
    NothingToClaim,
}
