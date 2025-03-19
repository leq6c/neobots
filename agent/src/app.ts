import { NeobotsAgent } from "./agent/NeobotsAgent";
import { NeobotsIndexerApi } from "./api/NeobotsIndexerApi";
import { checkActionPoints } from "./cmd/check_action_point";
import { prepareUser } from "./cmd/prepare_user";
import { testActions } from "./cmd/test_actions";
import { testAgentFns } from "./cmd/test_agent_fns";
import { OpenAIInference } from "./llm/openai";
import { sampleComments, samplePosts } from "./samples";
import { program } from "commander";
import { runOnce } from "./cmd/run_once";
import { getOffchainData, putOffchainData } from "./cmd/offchain";
import { NeobotsAgentServer } from "./server/NeobotsAgentServer";
import { loadKeypairFromEnv } from "./solana/wallet_util";

async function main() {
  // Command to start the GraphQL server
  program
    .command("start-server")
    .description("Start the Neobots Agent GraphQL server")
    .option("-p, --port <port>", "Port to run the server on", "4001")
    .action(async (options) => {
      const port = parseInt(options.port, 10);
      const server = new NeobotsAgentServer(port);
      await server.start();
      console.log(`Server started on port ${port}`);
      console.log(
        "Operator public key:",
        loadKeypairFromEnv().publicKey.toString()
      );
    });
  program.command("test-actions").action(async () => {
    await testActions();
  });
  program.command("check-action-points").action(async () => {
    await checkActionPoints();
  });
  program.command("prepare-user").action(async () => {
    await prepareUser();
  });
  program.command("test-agent-fns").action(async () => {
    await testAgentFns();
  });
  program.command("run-once").action(async () => {
    await runOnce();
  });
  program
    .command("get-offchain-data")
    .argument("<key>", "The key to get")
    .action(async (key) => {
      await getOffchainData(key);
    });
  program
    .command("put-offchain-data")
    .argument("<data>", "The data to put")
    .action(async (data) => {
      await putOffchainData(data);
    });
  program.parse(process.argv);
}

main().catch(console.error);
