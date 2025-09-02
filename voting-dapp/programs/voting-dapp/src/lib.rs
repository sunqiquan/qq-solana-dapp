#![allow(deprecated)]
use anchor_lang::prelude::*;

declare_id!("3NppKdHJeMqQi1PxvUbsfKoCoz4g5tPib4d7GWG56u3G");

#[program]
pub mod voting_dapp {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        poll_id: u64,
        poll_name: String,
        description: String,
        poll_start: u64,
        poll_end: u64,
    ) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll_account;
        poll_account.poll_id = poll_id;
        poll_account.poll_name = poll_name;
        poll_account.description = description;
        poll_account.poll_start = poll_start;
        poll_account.poll_end = poll_end;
        poll_account.candidate_amount = 0;
        msg!(
            "Initialized poll(Id: {}, name: {})",
            poll_account.poll_id,
            poll_account.poll_name
        );
        Ok(())
    }

    pub fn initialize_candidate(
        ctx: Context<InitializeCandidate>,
        _poll_id: u64,
        candidate_name: String,
    ) -> Result<()> {
        let candidate_account = &mut ctx.accounts.candidate_account;
        candidate_account.candidate_name = candidate_name;
        candidate_account.candidate_votes = 0;

        // 更新候选人数量
        ctx.accounts.poll_account.candidate_amount += 1;
        msg!(
            "Poll(Id: {}) {} has {} candidates",
            ctx.accounts.poll_account.poll_id,
            ctx.accounts.poll_account.poll_name,
            ctx.accounts.poll_account.candidate_amount
        );
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, _poll_id: u64, _candidate_name: String) -> Result<()> {
        let poll_account = &ctx.accounts.poll_account;
        let current_time = Clock::get()?.unix_timestamp as u64;
        if current_time < poll_account.poll_start {
            return Err(ErrorCode::PollNotActive.into());
        }
        if current_time > poll_account.poll_end {
            return Err(ErrorCode::PollEnded.into());
        }

        let candidate_account = &mut ctx.accounts.candidate_account;
        candidate_account.candidate_votes += 1;
        msg!("Voted for candidate: {}", candidate_account.candidate_name);
        msg!(
            "Candidate {} received {} votes",
            candidate_account.candidate_name,
            candidate_account.candidate_votes
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + PollAccount::INIT_SPACE,
        seeds=[b"poll", poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll_account: Account<'info, PollAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct PollAccount {
    pub poll_id: u64,
    #[max_len(32)]
    pub poll_name: String,
    #[max_len(320)]
    pub description: String,
    pub poll_start: u64,
    pub poll_end: u64,
    pub candidate_amount: u64,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct InitializeCandidate<'info> {
    #[account(
        mut,
        seeds=[b"poll", poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll_account: Account<'info, PollAccount>,

    #[account(
        init,
        payer = signer,
        space = 8 + CandidateAccount::INIT_SPACE,
        seeds=[poll_id.to_le_bytes().as_ref(), candidate_name.as_ref()],
        bump
    )]
    pub candidate_account: Account<'info, CandidateAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct CandidateAccount {
    #[max_len(32)]
    pub candidate_name: String,
    pub candidate_votes: u64,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct Vote<'info> {
    #[account(
        seeds=[b"poll", poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll_account: Account<'info, PollAccount>,

    #[account(
        mut,
        seeds=[poll_id.to_le_bytes().as_ref(), candidate_name.as_ref()],
        bump
    )]
    pub candidate_account: Account<'info, CandidateAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The poll is not active yet.")]
    PollNotActive,

    #[msg("The poll has already ended.")]
    PollEnded,
}
