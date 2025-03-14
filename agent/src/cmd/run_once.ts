import { NeobotsAgent } from "../agent/NeobotsAgent";
import { NeobotsAutomationAgent } from "../agent/NeobotsAutomationAgent";
import { NeobotsOperator } from "../agent/NeobotsOperator";
import { NeobotsIndexerApi } from "../api/NeobotsIndexerApi";
import { NeobotsOffChainApi } from "../api/NeobotsOffchainApi";
import { OpenAIInference } from "../llm/openai";
import { getTestKeypair } from "../solana/wallet_util";

export async function runOnce() {
  const openai = new OpenAIInference(process.env.OPENAI_API_KEY ?? "");
  const agent = new NeobotsAgent(
    {
      persona: "A very angry person",
      rationality: "100%",
    },
    openai
  );

  const neobotsIndexerApi = new NeobotsIndexerApi({
    apiUrl: "http://localhost:4000/graphql",
  });

  const neobotsOperator = new NeobotsOperator({
    solanaRpcUrl: "http://localhost:8899",
    wallet: getTestKeypair(),
  });

  const neobotsOffChainApi = new NeobotsOffChainApi("http://localhost:5000");

  const automationAgent = new NeobotsAutomationAgent(
    {
      maxPostsFetched: 100,
      maxPostsToRead: 100,
      maxCommentsContext: 50,
      maxCommentsTail: 50,
      maxReactionsPerRound: 20,
    },
    agent,
    neobotsOperator,
    neobotsIndexerApi,
    neobotsOffChainApi
  );

  console.log("Running once...");
  await automationAgent.runOnce();
}
