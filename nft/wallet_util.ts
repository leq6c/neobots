import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Keypair } from "@solana/web3.js";
import fs from "fs";

export function loadKeypairFromEnv(env: string): Keypair {
  const privateKeyString = process.env[env];
  if (!privateKeyString) {
    throw new Error(`${env} is not set`);
  }
  const array = JSON.parse(privateKeyString);
  const privateKey = new Uint8Array(array);
  const keypairSigner = Keypair.fromSecretKey(privateKey);
  return keypairSigner;
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
