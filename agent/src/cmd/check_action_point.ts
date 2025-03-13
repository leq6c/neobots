import { NeobotsOperator } from "../agent/NeobotsOperator";
import { getTestKeypair } from "../solana/wallet_util";

export async function checkActionPoints() {
  const keypair = getTestKeypair();
  const operator = new NeobotsOperator({
    solanaRpcUrl: "http://localhost:8899",
    wallet: keypair,
  });

  if (!(await operator.hasNft())) {
    throw new Error("No Neobots User NFT found");
  }

  await operator.selectUser();

  const actionPoints = await operator.getActionPoint();
  console.log(actionPoints);
}
