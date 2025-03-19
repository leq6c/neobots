import { addAbortListener } from "events";
import { AnchorProvider, setProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { ProgramService } from "../solana/program.service";
import { NftService } from "../solana/nft.service";
import fs from "fs";
import { environment } from "../environment";

function usePublicKey(keypair: Keypair): AnchorProvider {
  const anchorProvider = new AnchorProvider(
    new Connection(environment.solana.rpcUrl),
    new Wallet(keypair),
    {
      commitment: "confirmed",
    }
  );

  return anchorProvider;
}

async function main() {
  let user1 = Keypair.generate();

  /**
   * Create a new user keypair if it doesn't exist
   */
  if (!fs.existsSync("user1.json")) {
    // save
    const privateKey = new Buffer(user1.secretKey).toJSON();
    console.log(privateKey);
    fs.writeFileSync(
      "user1.json",
      JSON.stringify({
        privateKey: privateKey,
      })
    );
    console.log("minting");
  } else {
    const data = fs.readFileSync("user1.json", "utf8");
    const privateKey = Buffer.from(JSON.parse(data).privateKey, "base64");
    user1 = Keypair.fromSecretKey(privateKey);
  }
  console.log(user1.publicKey.toString());

  const anchorProvider = usePublicKey(user1);

  /**
   * Prepare
   */
  const program = new ProgramService(
    {
      defaultAgentOperator: "", // indexer doesn't need to know about agent operator
    },
    anchorProvider
  );
  const nftService = new NftService(
    {
      candyMachine: environment.neobots.program.candyMachine,
      collection: environment.neobots.program.collection,
      treasury: environment.neobots.program.treasury,
    },
    anchorProvider
  );

  /*
  console.log(await program.airdropSol(user1.publicKey, 100));
  console.log("✅ Airdropped SOL");
  await new Promise((resolve) => setTimeout(resolve, 10_000));

  const candyMachine = await nftService.getCandyMachine();
  console.log(
    "candyMachine remaining:",
    candyMachine.data.itemsAvailable - candyMachine.itemsRedeemed
  );*/

  let user1Nfts = await nftService.getOwnedNfts();

  if (user1Nfts.length === 0) {
    await nftService.mint();
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    console.log("✅ Minted NFT");
    user1Nfts = await nftService.getOwnedNfts();
  }
  console.log("user1 nfts:", user1Nfts.length);
  console.log(user1Nfts[0].publicKey);

  try {
    await program.getUser(new PublicKey(user1Nfts[0].publicKey));
  } catch (e) {
    await program.initializeUser(
      new PublicKey(user1Nfts[0].publicKey),
      "user1",
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150"
    );
    console.log("✅ Initialized User");
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }

  /*
  const tx = await program.createPost(
    new PublicKey(user1Nfts[0].publicKey),
    "Hello",
    "tag_name"
  );
  console.log("✅ Created Post");
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  */

  const postAuthor = program.getUserPda(new PublicKey(user1Nfts[0].publicKey));
  const commentTx = await program.addComment(
    new PublicKey(user1Nfts[0].publicKey),
    0,
    postAuthor,
    "Hello, world!"
  );
  console.log(commentTx);
  console.log("✅ Added Comment");
}

main().catch(console.error);
