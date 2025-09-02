import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { VotingDapp } from "../target/types/voting_dapp";
import { assert } from "chai";

describe("voting-dapp", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.votingDapp as Program<VotingDapp>;
  let poll_id = 6;

  // Initialize Poll and check pollId, pollname, description
  it(`Initialize poll(id: ${poll_id})`, async () => {
    const tx = await program.methods
      .initializePoll(
        new anchor.BN(poll_id),
        "Peanut Butter Poll",
        "What is your favorite type of peanut butter?",
        new anchor.BN(1755009048),
        new anchor.BN(1757687425)
      )
      .rpc();
    console.log("Transaction signature: ", tx);

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("poll"),
        new anchor.BN(poll_id).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    const poll = await program.account.pollAccount.fetch(pollAddress);
    console.log("Poll Address: ", pollAddress.toBase58());

    assert.equal(poll.pollId.toNumber(), poll_id);
    assert.equal(poll.pollName, "Peanut Butter Poll");
    assert.equal(
      poll.description,
      "What is your favorite type of peanut butter?"
    );
  });

  // Initialize Candidate with name Smooth and check candidateName, candidateVotes
  it(`Initialize Candidate(pollId: ${poll_id}, candidate: Smooth)`, async () => {
    let candidate_name = "Smooth";

    const tx = await program.methods
      .initializeCandidate(new anchor.BN(poll_id), candidate_name)
      .rpc();
    console.log("Transaction signature: ", tx);

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(poll_id).toArrayLike(Buffer, "le", 8),
        Buffer.from(candidate_name),
      ],
      program.programId
    );
    console.log(
      `Candidate ${candidate_name} Address: `,
      candidateAddress.toBase58()
    );

    const candidate = await program.account.candidateAccount.fetch(
      candidateAddress
    );
    assert.equal(candidate.candidateName, candidate_name);
    assert.equal(candidate.candidateVotes.toNumber(), 0);
  });

  // Vote for candidate Smooth and check candidateVotes
  it(`Vote Candidate(pollId: ${poll_id}, candidate: Smooth)`, async () => {
    let candidate_name = "Smooth";
    const tx = await program.methods
      .vote(new anchor.BN(poll_id), candidate_name)
      .rpc();
    console.log("Transaction signature: ", tx);

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(poll_id).toArrayLike(Buffer, "le", 8),
        Buffer.from(candidate_name),
      ],
      program.programId
    );
    console.log(
      `Candidate ${candidate_name} Address: `,
      candidateAddress.toBase58()
    );

    const candidate = await program.account.candidateAccount.fetch(
      candidateAddress
    );
    assert.equal(candidate.candidateName, candidate_name);
    assert.equal(candidate.candidateVotes.toNumber(), 1);
  });

  // Initialize Candidate with name Crunchy and check candidateName, candidateVotes
  it(`Initialize Candidate(pollId: ${poll_id}, candidate: Crunchy)`, async () => {
    let candidate_name = "Crunchy";

    const tx = await program.methods
      .initializeCandidate(new anchor.BN(poll_id), candidate_name)
      .rpc();
    console.log("Transaction signature: ", tx);

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(poll_id).toArrayLike(Buffer, "le", 8),
        Buffer.from(candidate_name),
      ],
      program.programId
    );
    console.log(
      `Candidate ${candidate_name} Address: `,
      candidateAddress.toBase58()
    );

    const candidate = await program.account.candidateAccount.fetch(
      candidateAddress
    );
    assert.equal(candidate.candidateName, candidate_name);
    assert.equal(candidate.candidateVotes.toNumber(), 0);
  });

  // Vote for candidate Crunchy and check candidateVotes
  it(`Vote Candidate(pollId: ${poll_id}, candidate: Crunchy)`, async () => {
    let candidate_name = "Crunchy";
    const tx = await program.methods
      .vote(new anchor.BN(poll_id), candidate_name)
      .rpc();
    console.log("Transaction signature: ", tx);

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(poll_id).toArrayLike(Buffer, "le", 8),
        Buffer.from(candidate_name),
      ],
      program.programId
    );
    console.log(
      `Candidate ${candidate_name} Address: `,
      candidateAddress.toBase58()
    );

    const candidate = await program.account.candidateAccount.fetch(
      candidateAddress
    );
    assert.equal(candidate.candidateName, candidate_name);
    assert.equal(candidate.candidateVotes.toNumber(), 1);
  });
});
