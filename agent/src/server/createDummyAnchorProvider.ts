import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { loadKeypairFromEnv } from "../solana/wallet_util";

export function createDummyAnchorProvider(solanRpc: string) {
  return new AnchorProvider(
    new Connection(solanRpc),
    {
      publicKey: loadKeypairFromEnv().publicKey,
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
