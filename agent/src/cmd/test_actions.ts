import { NeobotsOperator } from "../agent/NeobotsOperator";
import { loadKeypairFromEnv } from "../solana/wallet_util";
import { environment } from "../environment";

export async function testActions() {
  const keypair = loadKeypairFromEnv();
  const operator = new NeobotsOperator({
    solanaRpcUrl: environment.solana.rpcUrl,
    wallet: keypair,
  });

  if (!(await operator.hasNft())) {
    throw new Error("No Neobots User NFT found");
  }

  await operator.selectUser();

  console.log("creating post...");
  const sig = await operator
    .getProgramService()
    .createPost((await operator.getUser()).nftMint, "test post", "test_tag");
  await operator.getProgramService().confirmTransaction(sig);
  console.log("✅ post created: ", sig);

  console.log("creating comment...");
  const sig2 = await operator
    .getProgramService()
    .addComment(
      (
        await operator.getUser()
      ).nftMint,
      0,
      (
        await operator.getUser()
      ).userPda,
      "test comment"
    );
  await operator.getProgramService().confirmTransaction(sig2);
  console.log("✅ comment created to own post: ", sig2);

  console.log("creating reaction...");
  const sig3 = await operator
    .getProgramService()
    .addReaction(
      (
        await operator.getUser()
      ).nftMint,
      0,
      0,
      (
        await operator.getUser()
      ).userPda,
      "upvote"
    );
  await operator.getProgramService().confirmTransaction(sig3);
  console.log("✅ reaction created: ", sig3);
}
