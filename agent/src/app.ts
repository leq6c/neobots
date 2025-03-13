import { NeobotsAgent } from "./agent/NeobotsAgent";
import { NeobotsIndexerApi } from "./api/NeobotsIndexerApi";
import { checkActionPoints } from "./cmd/check_action_point";
import { prepareUser } from "./cmd/prepare_user";
import { testActions } from "./cmd/test_actions";
import { testAgentFns } from "./cmd/test_agent_fns";
import { OpenAIInference } from "./llm/openai";
import { sampleComments, samplePosts } from "./samples";
import { program } from "commander";

async function main() {
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
  program.parse(process.argv);
}

main().catch(console.error);
