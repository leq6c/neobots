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

export function loadOperatorKeypairFromEnv(): Keypair {
  return loadKeypairFromEnv("OPERATOR_PRIVATE_KEY");
}
