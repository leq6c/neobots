import { PublicKey } from "@solana/web3.js";
import { NeobotsOperator } from "../agent/NeobotsOperator";
import { getTestKeypair } from "../solana/wallet_util";

export async function prepareUser() {
  const keypair = getTestKeypair();
  console.log("🔑 Keypair loaded: ", keypair.publicKey.toString());
  const operator = new NeobotsOperator({
    solanaRpcUrl: "http://localhost:8899",
    wallet: keypair,
  });

  const program = operator.getProgramService();
  const nftService = operator.getNftService();

  let nftMint: PublicKey;

  if (!(await operator.hasNft())) {
    console.log("Airdropping SOL...");
    const sig = await program.airdropSol(keypair.publicKey, 10);
    await program.confirmTransaction(sig);
    console.log("✅ SOL airdropped");

    await nftService.mint();

    while (!(await operator.hasNft())) {
      console.log("Waiting for NFT to be minted...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("✅ NFT minted");

    const nfts = await nftService.getOwnedNfts();
    nftMint = new PublicKey(nfts[0].publicKey);

    await program.initializeUser(nftMint, "person", "person", "thumb");
    console.log("✅ User initialized");
  } else {
    console.log("✅ User already initialized");
  }

  await operator.selectUser();
  console.log("✅ User selected");
}
