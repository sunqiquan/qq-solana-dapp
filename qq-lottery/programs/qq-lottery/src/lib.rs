use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3,
        mpl_token_metadata::types::{CollectionDetails, Creator, DataV2},
        set_and_verify_sized_collection_item, sign_metadata, CreateMasterEditionV3,
        CreateMetadataAccountsV3, MasterEditionAccount, Metadata, MetadataAccount,
        SetAndVerifySizedCollectionItem, SignMetadata,
    },
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};
use switchboard_on_demand::accounts::RandomnessAccountData;

declare_id!("CZfcrFGmvJQnPk86zoUAEbrteSkSNtmSPYxaZf6zJ9mf");

#[constant]
pub const NAME: &str = "Token Lottery Ticket #";

#[constant]
pub const URI: &str = "Token Lottery";

#[constant]
pub const SYMBOL: &str = "TICKET";

#[program]
pub mod qq_lottery {

    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        start: u64,
        end: u64,
        price: u64,
    ) -> Result<()> {
        ctx.accounts.lottery_config.set_inner(LotteryConfig {
            bump: ctx.bumps.lottery_config,
            winner: 0,
            winner_chosen: false,
            lottery_start: start,
            lottery_end: end,
            lottery_pot_amount: 0,
            ticket_num: 0,
            ticket_price: price,
            randomness_account: Pubkey::default(),
            authority: ctx.accounts.payer.key(),
        });

        Ok(())
    }

    pub fn initialize_lottery(ctx: Context<InitializeLottery>) -> Result<()> {
        // collection_mint signer seeds+bump
        let signer_seeds: &[&[&[u8]]] =
            &[&[b"lottery_collection_mint", &[ctx.bumps.collection_mint]]];

        // mint lottery collection NFT
        msg!("Creating collection mint and mint token to it");
        let mint_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.collection_mint.to_account_info(),
                to: ctx.accounts.collection_token_account.to_account_info(),
                authority: ctx.accounts.collection_mint.to_account_info(),
            },
            signer_seeds,
        );
        mint_to(mint_cpi_ctx, 1)?;

        // create collection nft metadata
        msg!("Creating metadata account");
        let metadata_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &signer_seeds,
        );
        let data = DataV2 {
            name: NAME.to_string(),
            symbol: SYMBOL.to_string(),
            uri: URI.to_string(),
            seller_fee_basis_points: 0,
            creators: Some(vec![Creator {
                address: ctx.accounts.collection_mint.key(),
                verified: false,
                share: 100,
            }]),
            collection: None,
            uses: None,
        };
        create_metadata_accounts_v3(
            metadata_cpi_ctx,
            data,
            true,
            true,
            Some(CollectionDetails::V1 { size: 0 }),
        )?;

        // create collection nft master edition
        msg!("Creating master edition account");
        let master_edition_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &signer_seeds,
        );
        create_master_edition_v3(master_edition_cpi_ctx, Some(0))?;

        // sign metadata
        msg!("Sign metadata");
        let sign_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            SignMetadata {
                creator: ctx.accounts.collection_mint.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
            },
            &signer_seeds,
        );
        sign_metadata(sign_cpi_ctx)?;

        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        // check ticket status
        let clock = Clock::get()?;
        require!(
            clock.slot >= ctx.accounts.lottery_config.lottery_start
                && clock.slot <= ctx.accounts.lottery_config.lottery_end,
            ErrorCode::LotteryNotOpen
        );

        // transfer money from user to lottery
        let transfer_cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.lottery_config.to_account_info(),
            },
        );
        transfer(transfer_cpi_ctx, ctx.accounts.lottery_config.ticket_price)?;
        ctx.accounts.lottery_config.lottery_pot_amount += ctx.accounts.lottery_config.ticket_price;

        // collection_mint signer seeds+bump
        let signer_seeds: &[&[&[u8]]] =
            &[&[b"lottery_collection_mint", &[ctx.bumps.collection_mint]]];

        // mint lottery NFT to user
        let mint_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.lottery_mint.to_account_info(),
                to: ctx.accounts.lottery_mint_ata.to_account_info(),
                authority: ctx.accounts.collection_mint.to_account_info(),
            },
            signer_seeds,
        );
        mint_to(mint_cpi_ctx, 1)?;

        // create lottery metadata
        let ticket_name =
            NAME.to_owned() + ctx.accounts.lottery_config.ticket_num.to_string().as_str();
        let metadata_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.lottery_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        );
        let data = DataV2 {
            name: ticket_name,
            symbol: SYMBOL.to_string(),
            uri: URI.to_string(),
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };
        create_metadata_accounts_v3(metadata_cpi_ctx, data, true, true, None)?;

        // create lottery master edition
        let master_edition_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition.to_account_info(),
                mint: ctx.accounts.lottery_mint.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        );
        create_master_edition_v3(master_edition_cpi_ctx, Some(0))?;

        // verify lotter NFT to collection
        let set_and_verify_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            SetAndVerifySizedCollectionItem {
                metadata: ctx.accounts.metadata.to_account_info(),
                collection_authority: ctx.accounts.collection_mint.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.collection_mint.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                collection_master_edition: ctx.accounts.collection_master_edition.to_account_info(),
            },
            signer_seeds,
        );
        set_and_verify_sized_collection_item(set_and_verify_cpi_ctx, None)?;

        // update ticket num
        ctx.accounts.lottery_config.ticket_num += 1;

        Ok(())
    }

    pub fn commit_winner(ctx: Context<CommitWinner>) -> Result<()> {
        let clock = Clock::get()?;
        let lottery_config = &mut ctx.accounts.lottery_config;
        require!(
            ctx.accounts.payer.key() == lottery_config.authority,
            ErrorCode::NotAuthorized
        );

        let randomness_data =
            RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow())
                .unwrap();
        require!(
            randomness_data.seed_slot == clock.slot - 1,
            ErrorCode::RandomnessAlreadyRevealed,
        );

        lottery_config.randomness_account = ctx.accounts.randomness_account_data.key();

        Ok(())
    }

    pub fn choose_winner(ctx: Context<ChooseWinner>) -> Result<()> {
        let clock = Clock::get()?;
        let lottery_config = &mut ctx.accounts.lottery_config;
        require!(
            ctx.accounts.payer.key() == lottery_config.authority,
            ErrorCode::NotAuthorized
        );
        require!(
            clock.slot > lottery_config.lottery_end,
            ErrorCode::LotteryNotCompleted
        );
        require!(!lottery_config.winner_chosen, ErrorCode::WinnerChosen);
        require!(
            ctx.accounts.randomness_account_data.key() == lottery_config.randomness_account,
            ErrorCode::IncorrectRandomnessAccount
        );

        let randomness_data =
            RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow())
                .unwrap();
        let revealed_random_value = randomness_data
            .get_value(&clock)
            .map_err(|_| ErrorCode::RandomnessNotResolved)?;

        let randomness_result = pick_winner_u64(revealed_random_value, lottery_config.ticket_num);
        msg!("Winner: {}", randomness_result);
        lottery_config.winner = randomness_result;
        lottery_config.winner_chosen = true;

        Ok(())
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        msg!("Winner chosen: {}", ctx.accounts.lottery_config.winner);
        require!(
            ctx.accounts.lottery_config.winner_chosen,
            ErrorCode::WinnerNotChosen
        );
        require!(
            ctx.accounts.metadata.collection.as_ref().unwrap().verified,
            ErrorCode::NotVerifiedTicket
        );
        require!(
            ctx.accounts.metadata.collection.as_ref().unwrap().key
                == ctx.accounts.collection_mint.key(),
            ErrorCode::IncorrectTicket
        );

        let ticket_name = NAME.to_owned() + &ctx.accounts.lottery_config.winner.to_string();
        let metadata_name = ctx.accounts.metadata.name.replace("\u{0}", "");
        msg!("Ticket name: {}", ticket_name);
        msg!("Metdata name: {}", metadata_name);
        require!(ticket_name == metadata_name, ErrorCode::IncorrectTicket);
        require!(
            ctx.accounts.lottery_mint_ata.amount > 0,
            ErrorCode::IncorrectTicket
        );

        **ctx
            .accounts
            .lottery_config
            .to_account_info()
            .try_borrow_mut_lamports()? -= ctx.accounts.lottery_config.lottery_pot_amount;
        **ctx
            .accounts
            .payer
            .to_account_info()
            .try_borrow_mut_lamports()? += ctx.accounts.lottery_config.lottery_pot_amount;
        ctx.accounts.lottery_config.lottery_pot_amount = 0;

        Ok(())
    }

    pub fn change_lottery_config(ctx: Context<ChangeConfig>) -> Result<()> {
        let clock = Clock::get()?;
        let lottery_config = &mut ctx.accounts.lottery_config;
        require!(
            ctx.accounts.payer.key() == lottery_config.authority,
            ErrorCode::NotAuthorized
        );
        lottery_config.lottery_end = clock.slot + 100;

        Ok(())
    }
}

fn pick_winner_u64(randomness: [u8; 32], ticket_num: u64) -> u64 {
    // get first 8 bytes as u64
    let number = u64::from_le_bytes(randomness[0..8].try_into().unwrap());
    number % ticket_num
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8+ LotteryConfig::INIT_SPACE,
        seeds = [b"lottery_config"],
        bump
    )]
    pub lottery_config: Box<Account<'info, LotteryConfig>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChangeConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"lottery_config"],
        bump
    )]
    pub lottery_config: Box<Account<'info, LotteryConfig>>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct LotteryConfig {
    pub bump: u8,
    pub winner: u64,
    pub winner_chosen: bool,
    pub lottery_start: u64,
    pub lottery_end: u64,
    pub lottery_pot_amount: u64,
    pub ticket_num: u64,
    pub ticket_price: u64,
    pub randomness_account: Pubkey,
    pub authority: Pubkey,
}

#[derive(Accounts)]
pub struct InitializeLottery<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = collection_mint,
        mint::freeze_authority = collection_mint,
        seeds = [b"lottery_collection_mint"],
        bump
    )]
    pub collection_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = collection_mint,
        associated_token::authority = collection_mint,
        associated_token::token_program = token_program,
    )]
    pub collection_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: This account will be initialized by the metaplex program
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: This account will be initialized by the metaplex program
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref(), b"edition"],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub master_edition: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"lottery_config"],
        bump
    )]
    pub lottery_config: Box<Account<'info, LotteryConfig>>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = collection_mint,
        mint::freeze_authority = collection_mint,
        mint::token_program = token_program,
        seeds = [lottery_config.ticket_num.to_le_bytes().as_ref()],
        bump
    )]
    pub lottery_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = lottery_mint,
        associated_token::authority = payer,
        associated_token::token_program = token_program,
    )]
    pub lottery_mint_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: This account will be initialized by the metaplex program
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), lottery_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: This account will be initialized by the metaplex program
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), lottery_mint.key().as_ref(), b"edition"],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub master_edition: UncheckedAccount<'info>,

    #[account(
        seeds = [b"lottery_collection_mint"],
        bump
    )]
    pub collection_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub collection_metadata: Account<'info, MetadataAccount>,

    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref(), b"edition"],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub collection_master_edition: Account<'info, MasterEditionAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CommitWinner<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"lottery_config"],
        bump = lottery_config.bump
    )]
    pub lottery_config: Box<Account<'info, LotteryConfig>>,

    /// CHECK: the account's data is validated manually in the handler.
    pub randomness_account_data: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChooseWinner<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"lottery_config"],
        bump = lottery_config.bump
    )]
    pub lottery_config: Box<Account<'info, LotteryConfig>>,

    /// CHECK: the account's data is validated manually in the handler.
    pub randomness_account_data: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"lottery_config"],
        bump = lottery_config.bump
    )]
    pub lottery_config: Box<Account<'info, LotteryConfig>>,

    #[account(
        seeds = [b"lottery_collection_mint"],
        bump
    )]
    pub collection_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        seeds = [lottery_config.winner.to_le_bytes().as_ref()],
        bump
    )]
    pub lottery_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        associated_token::mint = lottery_mint,
        associated_token::authority = payer,
        associated_token::token_program = token_program,
    )]
    pub lottery_mint_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        seeds = [b"metadata", token_metadata_program.key().as_ref(), lottery_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub metadata: Account<'info, MetadataAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Incorrect randomness account")]
    IncorrectRandomnessAccount,

    #[msg("Lottery not completed")]
    LotteryNotCompleted,

    #[msg("Lottery is not open")]
    LotteryNotOpen,

    #[msg("Not authorized")]
    NotAuthorized,

    #[msg("Randomness already revealed")]
    RandomnessAlreadyRevealed,

    #[msg("Randomness not resolved")]
    RandomnessNotResolved,

    #[msg("Winner not chosen")]
    WinnerNotChosen,

    #[msg("Winner already chosen")]
    WinnerChosen,

    #[msg("Ticket is not verified")]
    NotVerifiedTicket,

    #[msg("Incorrect ticket")]
    IncorrectTicket,
}
