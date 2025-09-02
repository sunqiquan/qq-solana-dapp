#![allow(deprecated)]
use anchor_lang::prelude::*;

declare_id!("EQ84rMPQR8HQQ5QfHKyLnRUGF3XAaUMHtWmhv1ZzSEaE");

#[program]
pub mod curd_dapp {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
        _title_hash: [u8; 32],
        title: String,
        content: String,
    ) -> Result<()> {
        msg!(
            "Created journal entry(title: {}, content: {})",
            title,
            content
        );
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.signer.key();
        journal_entry.title = title;
        journal_entry.content = content;
        Ok(())
    }

    pub fn update_journal_entry(
        ctx: Context<UpdateEntry>,
        _title_hash: [u8; 32],
        title: String,
        content: String,
    ) -> Result<()> {
        msg!(
            "Updated journal entry(title: {}, content: {})",
            title,
            content
        );
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.content = content;
        Ok(())
    }

    pub fn delete_journal_entry(
        _ctx: Context<DeleteEntry>,
        _title_hash: [u8; 32],
        title: String,
    ) -> Result<()> {
        msg!("Deleted journal entry(title: {})", title);
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntry {
    pub owner: Pubkey,
    #[max_len(128)]
    pub title: String,
    #[max_len(1024)]
    pub content: String,
}

#[derive(Accounts)]
// why hash? because seed must not be longer than 32 bytes
#[instruction(title_hash: [u8; 32])]
pub struct CreateEntry<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + JournalEntry::INIT_SPACE,
        seeds = [b"journal_entry".as_ref(), &title_hash, signer.key().as_ref()],
        bump
    )]
    pub journal_entry: Account<'info, JournalEntry>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
// why hash? because seed must not be longer than 32 bytes
#[instruction(title_hash: [u8; 32])]
pub struct UpdateEntry<'info> {
    #[account(
        mut,
        realloc = 8 + JournalEntry::INIT_SPACE,
        realloc::payer = signer,
        realloc::zero = true,
        seeds = [b"journal_entry".as_ref(), &title_hash, signer.key().as_ref()],
        bump
    )]
    pub journal_entry: Account<'info, JournalEntry>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
// why hash? because seed must not be longer than 32 bytes
#[instruction(title_hash: [u8; 32])]
pub struct DeleteEntry<'info> {
    #[account(
        mut,
        close = signer,
        seeds = [b"journal_entry".as_ref(), &title_hash, signer.key().as_ref()],
        bump
    )]
    pub journal_entry: Account<'info, JournalEntry>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
