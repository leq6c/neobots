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
    console.log("Localnet detected, airdropping SOL to deployer account...");
    const sig = await program.airdropSol(keypair.publicKey, 10);
    await program.confirmTransaction(sig);
  } else {
    console.log(
      "Non-localnet detected, transaction would fail if no SOL is in the deployer account"
    );
  }

  console.log("=>Delete Candy Machine");
  {
    const coreNftBuilder = new CoreNFTBuilder(
      provider,
      keypair,
      collectionMintKeypair,
      treasuryKeypair,
      candyMachineKeypair
    );

    await coreNftBuilder.deleteCandyMachine();
  }
}

main().catch(console.error);
