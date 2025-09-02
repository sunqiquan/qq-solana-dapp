import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as sb from "@switchboard-xyz/on-demand";
import { BN, Program } from "@coral-xyz/anchor";
import { QqLottery } from "../target/types/qq_lottery";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);
console.log(TOKEN_METADATA_PROGRAM_ID);

describe("qq-lottery", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.qqLottery as Program<QqLottery>;
  const lotteryPrice = new BN(10000);

  let switchBoard = anchor.web3.Keypair.generate();
  let switchBoardProgram;

  before("Load switchboard program", async () => {
    const switchBoardIDL = await anchor.Program.fetchIdl(
      sb.ON_DEMAND_DEVNET_PID,
      {
        connection,
      }
    );
    switchBoardProgram = new anchor.Program(switchBoardIDL, provider);
  });

  it("Initialize Lottery Config", async () => {
    const slot = new BN((await connection.getSlot()) + 100);
    const initConfigIx = await program.methods
      .initializeConfig(new BN(0), slot, lotteryPrice)
      .instruction();

    const initLotteryIx = await program.methods
      .initializeLottery()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const lastBlockhash = await connection.getLatestBlockhash();
    const tx = new anchor.web3.Transaction({
      blockhash: lastBlockhash.blockhash,
      lastValidBlockHeight: lastBlockhash.lastValidBlockHeight,
    }).add(initConfigIx, initLotteryIx);
    const signaure = await anchor.web3.sendAndConfirmTransaction(
      connection,
      tx,
      [wallet.payer]
    );
    console.log("Initialize Signature", signaure);
  });

  async function buyTicket() {
    const computeIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 300000,
    });
    const priorityIx = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1,
    });
    const changeLotteryIx = await program.methods
      .changeLotteryConfig()
      .instruction();
    const buyTicket = await program.methods
      .buyTicket()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const lastBlockhash = await connection.getLatestBlockhash();
    const tx = new anchor.web3.Transaction({
      blockhash: lastBlockhash.blockhash,
      lastValidBlockHeight: lastBlockhash.lastValidBlockHeight,
    }).add(computeIx, priorityIx, changeLotteryIx, buyTicket);
    const signaure = await anchor.web3.sendAndConfirmTransaction(
      connection,
      tx,
      [wallet.payer]
    );
    console.log("Buy Ticket Signature", signaure);
  }

  it("Buy Ticket", async () => {
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
  });

  it("Commit Winner", async () => {
    const queue = new anchor.web3.PublicKey(sb.ON_DEMAND_DEVNET_QUEUE);
    const queueAccount = new sb.Queue(switchBoardProgram, queue);
    console.log("Queue account", queue.toString());
    try {
      await queueAccount.loadData();
    } catch (err) {
      console.log("Queue account not found");
      process.exit(1);
    }

    const [randomness, ix] = await sb.Randomness.create(
      switchBoardProgram,
      switchBoard,
      queue
    );
    console.log("randomness: ", randomness.pubkey.toBase58());
    console.log("switchBoard: ", switchBoard.publicKey.toBase58());
    const createRandomnessTx = await sb.asV0Tx({
      connection: connection,
      ixs: [ix],
      payer: wallet.publicKey,
      signers: [wallet.payer, switchBoard],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });

    const blockhashContext = await connection.getLatestBlockhashAndContext();

    const createRandomnessSignature = await connection.sendTransaction(
      createRandomnessTx
    );
    await connection.confirmTransaction({
      signature: createRandomnessSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
    });
    console.log("createRandomnessSignature: ", createRandomnessSignature);

    const sbCommitIx = await randomness.commitIx(queue);

    const commitIx = await program.methods
      .commitWinner()
      .accounts({
        randomnessAccountData: randomness.pubkey,
      })
      .instruction();

    const commitTx = await sb.asV0Tx({
      connection: switchBoardProgram.provider.connection,
      ixs: [sbCommitIx, commitIx],
      payer: wallet.publicKey,
      signers: [wallet.payer],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });

    const commitSignature = await connection.sendTransaction(commitTx);
    await connection.confirmTransaction({
      signature: commitSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
    });
    console.log("commitSignature: ", commitSignature);

    const sbRevealIx = await randomness.revealIx();
    const revealIx = await program.methods
      .chooseWinner()
      .accounts({
        randomnessAccountData: randomness.pubkey,
      })
      .instruction();

    const revealTx = await sb.asV0Tx({
      connection: switchBoardProgram.provider.connection,
      ixs: [sbRevealIx, revealIx],
      payer: wallet.publicKey,
      signers: [wallet.payer],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });

    const revealSignature = await connection.sendTransaction(revealTx);
    await connection.confirmTransaction({
      signature: commitSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
    });
    console.log("revealSignature: ", revealSignature);
  });

  it("Claim Prize", async () => {
    const [configAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("lottery_config")],
      program.programId
    );
    const lotteryConfig = await program.account.lotteryConfig.fetch(
      configAddress
    );
    console.log("Lottery config", lotteryConfig);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    tokenAccounts.value.forEach(async (account) => {
      console.log("Token account mint", account.account.data.parsed.info.mint);
      console.log("Token account address", account.pubkey.toBase58());
    });

    const winningMint = anchor.web3.PublicKey.findProgramAddressSync(
      [new anchor.BN(lotteryConfig.winner).toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];
    console.log("Winning mint", winningMint.toBase58());

    const winningTokenAddress = getAssociatedTokenAddressSync(
      winningMint,
      wallet.publicKey
    );
    console.log("Winning token address", winningTokenAddress.toBase58());

    const claimIx = await program.methods
      .claimPrize()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const blockhashContext = await connection.getLatestBlockhash();
    const claimTx = new anchor.web3.Transaction({
      blockhash: blockhashContext.blockhash,
      lastValidBlockHeight: blockhashContext.lastValidBlockHeight,
      feePayer: wallet.payer.publicKey,
    }).add(claimIx);

    const claimSig = await anchor.web3.sendAndConfirmTransaction(
      connection,
      claimTx,
      [wallet.payer]
    );
    console.log("claimSig: ", claimSig);
  });
});
