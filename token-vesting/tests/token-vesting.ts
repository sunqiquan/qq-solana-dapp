import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TokenVesting } from "../target/types/token_vesting";
import { assert } from "chai";
import { createHash } from "crypto";
import {
  createAssociatedTokenAccount,
  createMint,
  getAssociatedTokenAddress,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { airdropIfRequired } from "@solana-developers/helpers";

const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;
const QQTOKEN_TOTAL_AMOUNT = LAMPORTS_PER_SOL * 10;
const TREASURY_TOKEN_AMOUNT = LAMPORTS_PER_SOL;
const EMPLOYEE_TOTAL_AMOUNT = 100_000;

describe("token-vesting", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as NodeWallet;
  const employer = wallet.payer;
  const beneficiary = new anchor.web3.Keypair();
  const program = anchor.workspace.tokenVesting as Program<TokenVesting>;
  const companyName = `QQ Web3 Inc. ${Date.now()}`;
  const companyNameHash = createHash("sha256").update(companyName).digest();

  let QQMint: PublicKey;
  let QQMintATA: PublicKey;

  before("Create Mint and Token Account", async () => {
    await airdropIfRequired(
      provider.connection,
      beneficiary.publicKey,
      1 * LAMPORTS_PER_SOL,
      0.5 * LAMPORTS_PER_SOL
    );

    // create mint
    QQMint = await createMint(
      provider.connection,
      employer,
      employer.publicKey,
      employer.publicKey,
      9,
      undefined,
      undefined,
      TOKEN_PROGRAM
    );
    console.log("QQMint: ", QQMint.toBase58());

    // create QQMint ATA
    QQMintATA = await createAssociatedTokenAccount(
      provider.connection,
      employer,
      QQMint,
      employer.publicKey,
      undefined,
      TOKEN_PROGRAM
    );

    // mint tokens to associated token account
    await mintTo(
      provider.connection,
      employer,
      QQMint,
      QQMintATA,
      employer,
      QQTOKEN_TOTAL_AMOUNT,
      [],
      undefined,
      TOKEN_PROGRAM
    );
  });

  it("Create Treasury Vesting", async () => {
    const tx = await program.methods
      .createVestingAccount(Array.from(companyNameHash), companyName)
      .accounts({
        signer: employer.publicKey,
        mint: QQMint,
        tokenProgram: TOKEN_PROGRAM,
      })
      .rpc();
    console.log("Create Treasury Vesting transaction signature: ", tx);

    const [vestingAccountAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury_vesting"), companyNameHash],
      program.programId
    );
    const treasuryVestingAccount = await program.account.treasuryVesting.fetch(
      vestingAccountAddress
    );
    assert.equal(treasuryVestingAccount.companyName, companyName);

    const [treasuryVesting] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury_vesting"), companyNameHash],
      program.programId
    );

    const [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury_token_account"), treasuryVesting.toBuffer()],
      program.programId
    );

    const treasuryTokenAccountBalance =
      await provider.connection.getTokenAccountBalance(treasuryTokenAccount);
    console.log(
      "treasury_token_account balance: ",
      treasuryTokenAccountBalance.value.amount.toString()
    );
    assert.equal(
      treasuryTokenAccountBalance.value.amount.toString(),
      TREASURY_TOKEN_AMOUNT.toString()
    );
  });

  it("Create Employee Vesting", async () => {
    const tx = await program.methods
      .createEmployeeVesting(
        Array.from(companyNameHash),
        new BN(new Date().getTime()),
        new BN(new Date().getTime() + 100),
        new BN(EMPLOYEE_TOTAL_AMOUNT)
      )
      .accounts({
        beneficiary: beneficiary.publicKey,
      })
      .rpc();
    console.log("Create Employee Vesting transaction signature: ", tx);

    const [treasuryVesting] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury_vesting"), companyNameHash],
      program.programId
    );

    const [employeeVesting] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        beneficiary.publicKey.toBuffer(),
        treasuryVesting.toBuffer(),
      ],
      program.programId
    );

    const employeeVestingAccount = await program.account.employeeVesting.fetch(
      employeeVesting
    );
    assert.equal(
      employeeVestingAccount.beneficiary.toBase58(),
      beneficiary.publicKey.toBase58()
    );
    assert.equal(
      employeeVestingAccount.totalAmount.toString(),
      EMPLOYEE_TOTAL_AMOUNT.toString()
    );
  });

  it("Claim Employee Tokens", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const tx = await program.methods
      .claimTokens(Array.from(companyNameHash))
      .accounts({
        //@ts-ignore
        beneficiary: beneficiary.publicKey,
        tokenProgram: TOKEN_PROGRAM,
      })
      .signers([beneficiary])
      .rpc();

    console.log("Claim Employee Tokens transaction signature: ", tx);

    // get beneficiary ata address
    const beneficiaryATA = await getAssociatedTokenAddress(
      QQMint,
      beneficiary.publicKey,
      false,
      TOKEN_PROGRAM
    );

    const beneficiaryTokenAccountBalance =
      await provider.connection.getTokenAccountBalance(beneficiaryATA);
    console.log(
      "beneficiary_token_account balance: ",
      beneficiaryTokenAccountBalance.value.amount.toString()
    );
    assert.equal(
      beneficiaryTokenAccountBalance.value.amount.toString(),
      EMPLOYEE_TOTAL_AMOUNT.toString()
    );
  });
});
