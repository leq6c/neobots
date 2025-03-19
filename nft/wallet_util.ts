import { Keypair } from "@solana/web3.js";
import fs from "fs";

export function loadKeypairFromEnv(env: string): Keypair {
  const privateKeyString = process.env[env];
  if (!privateKeyString) {
    throw new Error(`${env} is not set`);
  }
  const privateKey = Buffer.from(privateKeyString, "base64");
  return Keypair.fromSecretKey(privateKey);
}

export function loadDeployerKeypairFromEnv(): Keypair {
  return loadKeypairFromEnv("DEPLOYER_PRIVATE_KEY");
}

export function loadCollectionMintKeypairFromEnv(): Keypair {
  return loadKeypairFromEnv("COLLECTION_MINT_PRIVATE_KEY");
}

export function loadTreasuryKeypairFromEnv(): Keypair {
  return loadKeypairFromEnv("TREASURY_PRIVATE_KEY");
}

export function loadCandyMachineKeypairFromEnv(): Keypair {
  return loadKeypairFromEnv("CANDY_MACHINE_PRIVATE_KEY");
}

export function getSolanaRpcUrl(): string {
  const url = process.env.SOLANA_RPC_URL;
  if (!url) {
    throw new Error("SOLANA_RPC_URL is not set");
  }
  return url;
}
