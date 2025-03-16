import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Neobots } from "../program/target/types/neobots";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { CoreNFTBuilder } from "./CoreNFTBuilder";
import { ProgramService } from "../ref/program.service";
import { getTestKeypair } from "./wallet_util";

async function main() {
  // pub const TOKEN_UNIT: u64 = 1_000_000_000;
  // pub const RATIO_SCALE: u64 = 1_000_000;
  const TOKEN_UNIT = 1_000_000_000;
  const RATIO_SCALE = 1_000_000;

  // Configure the client to use the local cluster.
  // anchor
  console.log("=>Start");
  const keypair = getTestKeypair();
  const provider = new anchor.AnchorProvider(
    new anchor.web3.Connection("http://127.0.0.1:8899"),
    new anchor.Wallet(keypair),
    {
      commitment: "confirmed",
    }
  );
  anchor.setProvider(provider);

  const program = new ProgramService(provider);

  // for localnet
  console.log("=>Airdrop SOL");
  const sig = await program.airdropSol(keypair.publicKey, 10);
  await program.confirmTransaction(sig);

  let forumPda: PublicKey;

  let splTokenMint: PublicKey;

  // NFT Builder
  let coreNftBuilder: CoreNFTBuilder;
  let collection: Keypair;
  let mintAuthority: PublicKey;

  console.log("=>Find required PDAs");
  {
    // Find the PDA for the forum
    [forumPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("forum"), Buffer.from("forum_id")],
      program.programId
    );

    [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint-authority")],
      program.programId
    );
  }

  console.log("=>Create Candy Machine");
  {
    coreNftBuilder = new CoreNFTBuilder(provider, keypair);
    await coreNftBuilder.createCollection();
    await coreNftBuilder.createCandyMachine();
    await coreNftBuilder.addItemsToCandyMachine();
    await coreNftBuilder.checkCandyMachine();
    // get collection mint
    collection = coreNftBuilder.getCollectionMint();
  }

  console.log("=>Initialize Forum");
  {
    const tx = await program.initializeForum(collection.publicKey);
    console.log("transaction signature", tx);

    console.log("Wait till transaction is finalized...");
    await program.finalizeTransaction(tx);

    const forum = await program.getForum();
    console.log("Forum:", forum);

    splTokenMint = forum.mint;
    console.log("SPL token mint:", splTokenMint.toBase58());
  }
}

main().catch(console.error);
