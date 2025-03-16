import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { getTestKeypair } from "../solana/wallet_util";

export function createDummyAnchorProvider(solanRpc: string) {
  return new AnchorProvider(
    new Connection(solanRpc),
    {
      publicKey: getTestKeypair().publicKey,
      signTransaction: async (tx) => {
        return tx;
      },
      signAllTransactions: async (txs) => {
        return txs;
      },
    },
    {
      commitment: "confirmed",
    }
  );
}
