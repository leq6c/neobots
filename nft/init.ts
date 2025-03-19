import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Neobots } from "../program/target/types/neobots";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { CoreNFTBuilder } from "./utils/CoreNFTBuilder";
import { ProgramService } from "../ref/program.service";
import {
  loadCandyMachineKeypairFromEnv,
  loadCollectionMintKeypairFromEnv,
  loadDeployerKeypairFromEnv,
  loadTreasuryKeypairFromEnv,
  getSolanaRpcUrl,
} from "./wallet_util";

async function main() {
  const keypair = loadDeployerKeypairFromEnv();
  const collectionMintKeypair = loadCollectionMintKeypairFromEnv();
  const treasuryKeypair = loadTreasuryKeypairFromEnv();
  const candyMachineKeypair = loadCandyMachineKeypairFromEnv();

  const provider = new anchor.AnchorProvider(
    new anchor.web3.Connection(getSolanaRpcUrl()),
    new anchor.Wallet(keypair),
    {
      commitment: "confirmed",
    }
  );
  anchor.setProvider(provider);

  const program = new ProgramService(
    {
      defaultAgentOperator: "11111111111111111111111111111111", // we dont use agent operator here
    },
    provider
  );

  // for localnet
  if (getSolanaRpcUrl() === "http://127.0.0.1:8899") {
    if ((await provider.connection.getBalance(keypair.publicKey)) === 0) {
      console.log("Localnet detected, airdropping SOL to deployer account...");
      const sig = await program.airdropSol(keypair.publicKey, 10);
      await program.confirmTransaction(sig);
    } else {
      console.log("Deployer account already has SOL, skipping airdrop...");
    }
  } else {
    console.log(
      "Non-localnet detected, transaction would fail if no SOL is in the deployer account"
    );
  }

  // forum
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
    coreNftBuilder = new CoreNFTBuilder(
      provider,
      keypair,
      collectionMintKeypair,
      treasuryKeypair,
      candyMachineKeypair
    );

    if (await coreNftBuilder.hasCollection()) {
      console.log("Collection already exists, skipping creation...");
    } else {
      await coreNftBuilder.createCollection();
    }
    if (await coreNftBuilder.hasCandyMachine()) {
      console.log("Candy Machine already exists, skipping creation...");
    } else {
      console.log("Creating Candy Machine...");
      await coreNftBuilder.createCandyMachine();
      console.log("Adding items to Candy Machine...");
      await coreNftBuilder.addItemsToCandyMachine();
      console.log("Checking Candy Machine...");
      await coreNftBuilder.checkCandyMachine();
    }

    // get collection mint
    collection = coreNftBuilder.getCollectionMint();
  }

  console.log("=>Initialize Forum");
  {
    if (await program.hasForum()) {
      console.log("Forum already exists, skipping initialization...");
    } else {
      console.log("Initializing Forum...");
      const tx = await program.initializeForum(collection.publicKey);
      console.log("transaction signature", tx);

      console.log("Wait till transaction is finalized...");
      await program.finalizeTransaction(tx);
    }

    const forum = await program.getForum();
    console.log("Forum:", forum);

    splTokenMint = forum.mint;
    console.log("SPL token mint:", splTokenMint.toBase58());
  }
}

main().catch(console.error);
