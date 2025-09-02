use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
    TransferChecked,
};

pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    amount: u64,
    mint: &InterfaceAccount<'info, Mint>,
    authority: &Signer<'info>,
    token_program: &Interface<'info, TokenInterface>,
) -> Result<()> {
    let accounts = TransferChecked {
        from: from.to_account_info(),
        to: to.to_account_info(),
        mint: mint.to_account_info(),
        authority: authority.to_account_info(),
    };

    let cpi_context = CpiContext::new(token_program.to_account_info(), accounts);
    transfer_checked(cpi_context, amount, mint.decimals)
}

pub fn transfer_tokens_with_singer<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    amount: u64,
    mint: &InterfaceAccount<'info, Mint>,
    authority: AccountInfo<'info>,
    token_program: &Interface<'info, TokenInterface>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let accounts = TransferChecked {
        from: from.to_account_info(),
        to: to.to_account_info(),
        mint: mint.to_account_info(),
        authority,
    };

    let cpi_context =
        CpiContext::new_with_signer(token_program.to_account_info(), accounts, signer_seeds);
    transfer_checked(cpi_context, amount, mint.decimals)
}

pub fn swap_close_account<'info>(
    account: &InterfaceAccount<'info, TokenAccount>,
    destination: &AccountInfo<'info>,
    authority: AccountInfo<'info>,
    token_program: &Interface<'info, TokenInterface>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let accounts = CloseAccount {
        account: account.to_account_info(),
        destination: destination.to_account_info(),
        authority,
    };
    let cpi_context =
        CpiContext::new_with_signer(token_program.to_account_info(), accounts, signer_seeds);
    close_account(cpi_context)
}
