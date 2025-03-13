import { program } from "commander";
import { server } from "./cmd/start_server";
import { indexer } from "./cmd/indexer";

async function main() {
  program.command("server").action(async () => {
    await server();
  });

  program.command("indexer").action(async () => {
    await indexer();
  });

  program.parse(process.argv);
}

main().catch(console.error);
