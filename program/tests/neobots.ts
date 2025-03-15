import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Neobots } from "../target/types/neobots";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { CreateCompressedNftOutput } from "@metaplex-foundation/js";
import { expect } from "chai";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { CoreNFTBuilder } from "./CoreNFTBuilder";

// pub const TOKEN_UNIT: u64 = 1_000_000_000;
// pub const RATIO_SCALE: u64 = 1_000_000;
const TOKEN_UNIT = 1_000_000_000;
const RATIO_SCALE = 1_000_000;

describe("neobots", async () => {
  // Configure the client to use the local cluster.
  // anchor
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Neobots as Program<Neobots>;

  const authority = Keypair.generate();
  const user1 = Keypair.generate();
  const user2 = Keypair.generate();

  let forumPda: PublicKey;
  let user1Pda: PublicKey;
  let user2Pda: PublicKey;
  let postPda: PublicKey;

  let splTokenMint: PublicKey;

  // NFT Builder
  let coreNftBuilder: CoreNFTBuilder;
  let collection: Keypair;
  // nft1 is owned by user1
  let nft1: Keypair;
  // nft2 is owned by user2
  let nft2: Keypair;

  let mintAuthority: PublicKey;

  before(async () => {
    // Find the PDA for the forum
    [forumPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("forum"), Buffer.from("forum_id")],
      program.programId
    );

    [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint-authority")],
      program.programId
    );
  });

  // this is for learning purposes
  it("Airdrop SOL to the authority and user", async () => {
    // Airdrop SOL to the authority
    const tx = await provider.connection.requestAirdrop(
      authority.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(tx);

    // Airdrop SOL to the user
    const txUser1 = await provider.connection.requestAirdrop(
      user1.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(txUser1);

    // Airdrop SOL to the user
    const txUser2 = await provider.connection.requestAirdrop(
      user2.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(txUser2);

    console.log("Airdropped 1 SOL to the authority:", tx);
    console.log("Airdropped 1 SOL to the user 1:", txUser1);
    console.log("Airdropped 1 SOL to the user 2:", txUser2);
  });

  it("Core NFT Builder", async () => {
    coreNftBuilder = new CoreNFTBuilder(provider, authority);
    await coreNftBuilder.createCollection();
    await coreNftBuilder.createCandyMachine();
    await coreNftBuilder.addItemsToCandyMachine();
    await coreNftBuilder.checkCandyMachine();

    // airdrop
    await coreNftBuilder.airdrop(user1, 100); // 100 SOL
    await coreNftBuilder.airdrop(user2, 100); // 100 SOL

    // mint NFT
    nft1 = await coreNftBuilder.mintNFT(user1);
    nft2 = await coreNftBuilder.mintNFT(user2);

    // generate PDA for user1 and user2 (neobots platform user)
    [user1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), nft1.publicKey.toBuffer()],
      program.programId
    );

    [user2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), nft2.publicKey.toBuffer()],
      program.programId
    );

    // get collection mint
    collection = coreNftBuilder.getCollectionMint();
  });

  it("initialize forum", async () => {
    // Add your test here.
    const tx = await program.methods
      .initializeForum("forum_id")
      .accounts({
        payer: provider.wallet.publicKey,
        nftCollection: collection.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const forum = await program.account.forum.fetch(forumPda);
    console.log("Forum:", forum);

    splTokenMint = forum.mint;

    console.log("SPL token mint:", splTokenMint.toBase58());
  });

  it("initialize user 1", async () => {
    console.log("NFT:", nft1);

    const tx = await program.methods
      .initializeUser("forum_id", "personality", "name", "thumb")
      .accounts({
        payer: user1.publicKey,
        nftMint: nft1.publicKey,
      })
      .signers([user1])
      .rpc();
    console.log("Initialized user 1:", tx);

    const user = await program.account.user.fetch(user1Pda);
    console.log("User 1:", user);
  });

  it("create post", async () => {
    const tx = await program.methods
      .createPost("forum_id", "Hello, world!", "tag_name")
      .accounts({
        owner: user1.publicKey,
        nftMint: nft1.publicKey,
      })
      .signers([user1])
      .rpc();

    const postCountBN = new BN(0);
    const postCountLE = postCountBN.toArrayLike(Buffer, "le", 4);

    [postPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("post"),
        forumPda.toBuffer(),
        user1Pda.toBuffer(),
        postCountLE,
      ],
      program.programId
    );

    const post = await program.account.post.fetch(postPda);
    console.log("Post PDA:", postPda.toBase58());
    console.log("Post:", post);
  });

  it("initialize user 2", async () => {
    const tx = await program.methods
      .initializeUser("forum_id", "personality", "name", "thumb")
      .accounts({
        payer: user2.publicKey,
        nftMint: nft2.publicKey,
      })
      .signers([user2])
      .rpc();

    console.log("Initialized user 2:", tx);

    const user = await program.account.user.fetch(user2Pda);
    console.log("User 2:", user);
  });

  it("Add comment", async () => {
    const tx = await program.methods
      .addComment("forum_id", 0, "Hello, world!")
      .accounts({
        postAuthor: user1Pda,
        senderNftMint: nft2.publicKey,
        sender: user2.publicKey,
      })
      .signers([user2])
      .rpc();

    console.log("Added comment:", tx);

    const user2Data = await program.account.user.fetch(user2Pda);
    console.log("User 2:", user2Data);

    expect(user2Data.commentCount).to.equal(1);
  });

  it("Add reaction", async () => {
    const tx = await program.methods
      .addReaction("forum_id", 0, 1, {upvote: {}})
      .accounts({
        postAuthor: user1Pda,
        commentAuthorUser: user2Pda,
        senderNftMint: nft1.publicKey,
        sender: user1.publicKey,
      })
      .signers([user1])
      .rpc();

    console.log("Added reaction:", tx);

    const user1Data = await program.account.user.fetch(user1Pda);
    console.log("User 1:", user1Data);

    const user2Data = await program.account.user.fetch(user2Pda);
    console.log("User 2:", user2Data);

    expect(user1Data.reactionCount).to.equal(1);
    expect(user1Data.upvoteCount).to.equal(1);
    expect(user1Data.receivedReactionCount.toNumber()).to.equal(0);
    expect(user2Data.receivedReactionCount.toNumber()).to.equal(1);
    expect(user2Data.receivedUpvoteCount.toNumber()).to.equal(1);

    // giver
    expect(user1Data.claimableAmount.toNumber()).to.equal(0.1 * TOKEN_UNIT); // send reaction(0.1)

    // receiver
    expect(user2Data.claimableAmount.toNumber()).to.equal(
      0.1 * TOKEN_UNIT + 0.5 * TOKEN_UNIT
    ); // send comment(0.1) + receive reaction(0.5)
  });

  it("claim", async () => {
    const tx = await program.methods
      .claim("forum_id")
      .accounts({
        nftMint: nft1.publicKey,
        beneficiary: user1.publicKey,
        mint: splTokenMint,
        mintAuthority: splTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user1])
      .rpc();

    console.log("Claimed:", tx);

    const user1Data = await program.account.user.fetch(user1Pda);
    console.log("User 1:", user1Data);

    expect(user1Data.claimableAmount.toNumber()).to.equal(0);

    const user1TokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      user1,
      splTokenMint,
      user1.publicKey
    );
    console.log("User 1 Token Account:", user1TokenAccount);

    expect(user1TokenAccount.amount).to.equal(BigInt(TOKEN_UNIT * 0.1));

    const forum = await program.account.forum.fetch(forumPda);
    console.log("Forum:", forum);

    expect(forum.roundDistributed.toNumber()).to.equal(TOKEN_UNIT * 0.1);
  });

  it("advance round", async () => {
    let forum = await program.account.forum.fetch(forumPda);

    console.log("Forum:", forum);

    const tx = await program.methods
      .advanceRound("forum_id")
      .accounts({
        signer: user1.publicKey,
      })
      .signers([user1])
      .rpc();

    console.log("Advanced round:", tx);

    forum = await program.account.forum.fetch(forumPda);
    console.log("Forum:", forum);

    expect(forum.roundStatus.roundNumber.toNumber()).to.equal(1);
    expect(forum.roundStatus.roundStartTime.toNumber()).to.above(1);
    expect(forum.roundDistributed.toNumber()).to.equal(0);
  });
});
