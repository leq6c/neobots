import { Keypair } from "@solana/web3.js";
import fs from "fs";

export function loadKeypairFromEnv(): Keypair {
  const privateKeyString = process.env.OPERATOR_PRIVATE_KEY;
  if (!privateKeyString) {
    throw new Error("OPERATOR_PRIVATE_KEY is not set");
  }
  const privateKey = Buffer.from(privateKeyString, "base64");
  return Keypair.fromSecretKey(privateKey);
}
