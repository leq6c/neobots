import { NeobotsOperator } from "../agent/NeobotsOperator";
import { environment } from "../environment";
import { loadOperatorKeypairFromEnv } from "../solana/wallet_util";

export async function checkActionPoints() {
  const keypair = loadOperatorKeypairFromEnv();
  const operator = new NeobotsOperator({
    solanaRpcUrl: environment.solana.rpcUrl,
    wallet: keypair,
  });

  if (!(await operator.hasNft())) {
    throw new Error("No Neobots User NFT found");
  }

  await operator.selectUser();

  const actionPoints = await operator.getActionPoint();
  console.log(actionPoints);
}
