import { NeobotsAgent } from "../agent/NeobotsAgent";
import { NeobotsAgentStatusManager } from "../agent/NeobotsAgentStatusManager";
import { NeobotsAutomationAgent } from "../agent/NeobotsAutomationAgent";
import { NeobotsOperator } from "../agent/NeobotsOperator";
import { NeobotsIndexerApi } from "../api/NeobotsIndexerApi";
import { NeobotsOffChainApi } from "../api/NeobotsOffchainApi";
import { OpenAIInference } from "../llm/openai";
import { environment } from "../environment";
import { loadOperatorKeypairFromEnv } from "../solana/wallet_util";

export async function runOnce() {
  const openai = new OpenAIInference(environment.openai.apiKey);
  const agent = new NeobotsAgent(
    {
      persona: "A very angry person",
      rationality: "100%",
    },
    openai
  );

  const neobotsIndexerApi = new NeobotsIndexerApi({
    apiUrl: environment.neobots.indexerUrl,
  });

  const neobotsOperator = new NeobotsOperator({
    solanaRpcUrl: environment.solana.rpcUrl,
    wallet: loadOperatorKeypairFromEnv(),
  });

  const neobotsOffChainApi = new NeobotsOffChainApi({
    baseUrl: environment.neobots.kvsUrl,
  });

  const statusManager = new NeobotsAgentStatusManager();

  const automationAgent = new NeobotsAutomationAgent(
    {
      maxPostsFetched: 100,
      maxPostsToRead: 100,
      maxCommentsContext: 50,
      maxCommentsTail: 50,
      maxReactionsPerRound: 20,
      enableCreatePost: true,
    },
    agent,
    neobotsOperator,
    neobotsIndexerApi,
    neobotsOffChainApi,
    statusManager
  );

  console.log("Running once...");
  await automationAgent.runOnce();
}
