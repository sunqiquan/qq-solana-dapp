import { randomBytes } from "crypto";
import * as anchor from "@coral-xyz/anchor";
import { BN, type Program } from "@coral-xyz/anchor";
import { Swap } from "../target/types/swap";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert } from "chai";

import {
  confirmTransaction,
  createAccountsMintsAndTokenAccounts,
} from "@solana-developers/helpers";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

const ANCHOR_SLOW_TEST_THRESHOLD = 40 * 1000;
const TOKEN_PROGRAM: typeof TOKEN_PROGRAM_ID | typeof TOKEN_2022_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;

function getRandomBigNumber(size = 8) {
  return new BN(randomBytes(size));
}

describe("swap", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const connection = anchor.getProvider().connection;
  const program = anchor.workspace.swap as Program<Swap>;
  const payer = anchor.getProvider().wallet.payer;

  let alice: anchor.web3.Keypair;
  let bob: anchor.web3.Keypair;
  const accounts: Record<string, PublicKey> = {
    tokenProgram: TOKEN_PROGRAM,
  };

  const tokenAOfferedAmount = new BN(1_000_000);
  const tokenBWantedAmount = new BN(1_000_000);

  before(
    "Create Alice and Bob accounts, 2 token mints, and associated token accounts and both tokens for both users",
    async () => {
      const usersMintsAndTokenAccounts =
        await createAccountsMintsAndTokenAccounts(
          [
            [1_000_000_000, 0],
            [0, 1_000_000_000],
          ],
          0.1 * LAMPORTS_PER_SOL,
          connection,
          payer
        );

      // user alice and bob
      const users = usersMintsAndTokenAccounts.users;
      alice = users[0];
      bob = users[1];
      accounts.maker = alice.publicKey;
      accounts.taker = bob.publicKey;

      // token mintA and mintB
      const mints = usersMintsAndTokenAccounts.mints;
      const tokenMintA = mints[0];
      const tokenMintB = mints[1];
      accounts.tokenMintA = tokenMintA.publicKey;
      accounts.tokenMintB = tokenMintB.publicKey;

      // token accounts
      const tokenAccounts = usersMintsAndTokenAccounts.tokenAccounts;

      // alice TokenAccountA and TokenAccountB
      const aliceTokenAccountA = tokenAccounts[0][0];
      const aliceTokenAccountB = tokenAccounts[0][1];
      accounts.makerTokenAccountA = aliceTokenAccountA;
      accounts.makerTokenAccountB = aliceTokenAccountB;

      // bob TokenAccountA and TokenAccountB
      const bobTokenAccountA = tokenAccounts[1][0];
      const bobTokenAccountB = tokenAccounts[1][1];
      accounts.takerTokenAccountA = bobTokenAccountA;
      accounts.takerTokenAccountB = bobTokenAccountB;
    }
  );

  it("Puts the tokens Alice offers into the vault when Alice makes an offer", async () => {
    const offerId = getRandomBigNumber();
    accounts.offer = PublicKey.findProgramAddressSync(
      [
        Buffer.from("offer"),
        accounts.maker.toBuffer(),
        offerId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];
    accounts.vault = getAssociatedTokenAddressSync(
      accounts.tokenMintA,
      accounts.offer,
      true,
      TOKEN_PROGRAM
    );

    const makeOfferTx = await program.methods
      .makeOffer(offerId, tokenAOfferedAmount, tokenBWantedAmount)
      .accounts({ ...accounts })
      .signers([alice])
      .rpc();

    await confirmTransaction(connection, makeOfferTx, "finalized");

    // check our vault contains the tokens offered
    const vaultBalance = await connection.getTokenAccountBalance(
      accounts.vault
    );
    assert.equal(vaultBalance.value.amount, tokenAOfferedAmount.toString());

    // check our Offer account contain the correct data
    const offerAccount = await program.account.offer.fetch(accounts.offer);
    assert(offerAccount.id.eq(offerId));
    assert(offerAccount.maker.equals(alice.publicKey));
    assert(offerAccount.tokenMintA.equals(accounts.tokenMintA));
    assert(offerAccount.tokenMintB.equals(accounts.tokenMintB));
    assert(offerAccount.tokenBWantedAmount.eq(tokenBWantedAmount));
  }).slow(ANCHOR_SLOW_TEST_THRESHOLD);

  it("Puts the tokens from the vault into Bob's account, and gives Alice Bob's tokens, when Bob takes an offer", async () => {
    const takeOfferTx = await program.methods
      .takeOffer()
      .accounts({ ...accounts })
      .signers([bob])
      .rpc();

    await confirmTransaction(connection, takeOfferTx, "finalized");

    // Check the offered tokens are now in Bob's account
    // (note: there is no before balance as Bob didn't have any offered tokens before the transaction)
    const bobTokenAccountBalanceAfterResponse =
      await connection.getTokenAccountBalance(accounts.takerTokenAccountA);
    const bobTokenAccountBalanceAfter = new BN(
      bobTokenAccountBalanceAfterResponse.value.amount
    );
    assert(bobTokenAccountBalanceAfter.eq(tokenAOfferedAmount));

    // Check the wanted tokens are now in Alice's account
    // (note: there is no before balance as Alice didn't have any wanted tokens before the transaction)
    const aliceTokenAccountBalanceAfterResponse =
      await connection.getTokenAccountBalance(accounts.makerTokenAccountB);
    const aliceTokenAccountBalanceAfter = new BN(
      aliceTokenAccountBalanceAfterResponse.value.amount
    );
    assert(aliceTokenAccountBalanceAfter.eq(tokenBWantedAmount));
  }).slow(ANCHOR_SLOW_TEST_THRESHOLD);
});
