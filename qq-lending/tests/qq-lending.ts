import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";
import { PublicKey, Keypair } from "@solana/web3.js";
// import idl from "../target/idl/qq_lending.json";
import { QqLending } from "../target/types/qq_lending";

describe("Anchor Local Lending Tests (No Bankrun)", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.qqLottery as Program<QqLending>;
  const signer = provider.wallet.payer;

  let mintUSDC: PublicKey;
  let mintWSOL: PublicKey;

  let userUSDCAccount: PublicKey;
  let userWSOLAccount: PublicKey;

  let bankUSDCAccount: PublicKey;
  let bankWSOLAccount: PublicKey;

  before("init accounts", async () => {
    // 1️⃣ 创建两个 Mint: USDC 和 WSOL
    mintUSDC = await createMint(
      provider.connection,
      signer,
      signer.publicKey,
      null,
      6
    );
    mintWSOL = await createMint(
      provider.connection,
      signer,
      signer.publicKey,
      null,
      9
    );

    // 2️⃣ 创建用户 token accounts
    userUSDCAccount = await createAccount(
      provider.connection,
      signer,
      mintUSDC,
      signer.publicKey
    );
    userWSOLAccount = await createAccount(
      provider.connection,
      signer,
      mintWSOL,
      signer.publicKey
    );

    [bankUSDCAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("bank_account"), mintUSDC.toBuffer()],
      program.programId
    );
    [bankWSOLAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("bank_account"), mintWSOL.toBuffer()],
      program.programId
    );

    // 4️⃣ Mint some tokens to treasury and user
    await mintTo(
      provider.connection,
      signer,
      mintUSDC,
      bankUSDCAccount,
      signer,
      1_000_000_000
    ); // treasury 1,000 USDC
    await mintTo(
      provider.connection,
      signer,
      mintUSDC,
      userUSDCAccount,
      signer,
      10_000_000
    ); // user 10 USDC

    await mintTo(
      provider.connection,
      signer,
      mintWSOL,
      bankWSOLAccount,
      signer,
      500_000_000_000
    ); // treasury 500 WSOL
    await mintTo(
      provider.connection,
      signer,
      mintWSOL,
      userWSOLAccount,
      signer,
      1_000_000_000
    ); // user 1 WSOL
  });

  it("Initialize User Account", async () => {
    const tx = await program.methods.initUser(mintUSDC).rpc();
    console.log("Init user tx:", tx);
  });

  it("Initialize Banks", async () => {
    // USDC Bank
    const txUSDC = await program.methods
      .initBank(new anchor.BN(80), new anchor.BN(50)) // liquidation_threshold, max_ltv
      .accounts({
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Init USDC Bank:", txUSDC);

    // WSOL Bank
    const txWSOL = await program.methods
      .initBank(new anchor.BN(80), new anchor.BN(50))
      .accounts({
        mint: mintWSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Init WSOL Bank:", txWSOL);
  });

  it("Deposit USDC", async () => {
    const tx = await program.methods
      .deposit(new anchor.BN(5_000_000)) // 5 USDC
      .accounts({
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Deposit USDC tx:", tx);
  });

  it("Borrow WSOL against USDC collateral", async () => {
    // 注意：priceUpdate 用 mock
    const tx = await program.methods
      .borrow(new anchor.BN(500_000_000)) // borrow 0.5 WSOL
      .accounts({
        signer: signer.publicKey,
        mint: mintWSOL,
        priceUpdate: Keypair.generate().publicKey, // mock price feed account
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Borrow WSOL tx:", tx);
  });

  it("Repay WSOL", async () => {
    const tx = await program.methods
      .repay(new anchor.BN(500_000_000))
      .accounts({
        signer: signer.publicKey,
        mint: mintWSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Repay WSOL tx:", tx);
  });

  it("Withdraw USDC", async () => {
    const tx = await program.methods
      .withdraw(new anchor.BN(2_000_000)) // withdraw 2 USDC
      .accounts({
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Withdraw USDC tx:", tx);
  });
});
