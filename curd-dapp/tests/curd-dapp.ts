import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { CurdDapp } from "../target/types/curd_dapp";
import { assert } from "chai";
import { createHash } from "crypto";

describe("curd-dapp", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.curdDapp as Program<CurdDapp>;
  const title = "Test Title";
  const content = "Test Content";
  const title_hash = createHash("sha256").update(title).digest();

  it("Create Entry", async () => {
    const tx = await program.methods
      .createJournalEntry(Array.from(title_hash), title, content)
      .rpc();
    console.log("Your transaction signature", tx);

    const [journalEntryAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("journal_entry"),
        title_hash,
        provider.wallet.publicKey.toBytes(),
      ],
      program.programId
    );

    const journalEntry = await program.account.journalEntry.fetch(
      journalEntryAddress
    );
    console.log("Journal Entry Address: ", journalEntryAddress.toBase58());

    assert.equal(journalEntry.title, title);
    assert.equal(journalEntry.content, content);
  });

  it("Update Entry", async () => {
    const content = "Updated Content";
    const tx = await program.methods
      .updateJournalEntry(Array.from(title_hash), title, content)
      .rpc();
    console.log("Your transaction signature", tx);

    const [journalEntryAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("journal_entry"),
        title_hash,
        provider.wallet.publicKey.toBytes(),
      ],
      program.programId
    );
    const journalEntry = await program.account.journalEntry.fetch(
      journalEntryAddress
    );
    console.log("Journal Entry Address: ", journalEntryAddress.toBase58());

    assert.equal(journalEntry.title, title);
    assert.equal(journalEntry.content, content);
  });

  it("Delete Entry", async () => {
    const tx = await program.methods
      .deleteJournalEntry(Array.from(title_hash), title)
      .rpc();
    console.log("Your transaction signature", tx);

    const [journalEntryAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("journal_entry"),
        title_hash,
        provider.wallet.publicKey.toBytes(),
      ],
      program.programId
    );

    try {
      await program.account.journalEntry.fetch(journalEntryAddress);
      assert.fail("Journal entry still exists after delete");
    } catch (err) {
      assert.include(err.message, "Account does not exist", "has no data");
    }
  });
});
