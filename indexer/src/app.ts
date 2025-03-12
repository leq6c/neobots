// indexApp.ts
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, setProvider, Wallet } from "@coral-xyz/anchor";

import { ForumIndexer } from "./indexing/forum_indexer";
import { initForum } from "./forum/init"; // our DB init
import { ProgramService } from "./solana/program.service"; // your custom code

async function main() {
  // 1) Setup the Solana connection
  const connection = new Connection("http://localhost:8899");
  const wallet = new Wallet(Keypair.generate());
  const anchorProvider = new AnchorProvider(connection, wallet, {});
  setProvider(anchorProvider);

  // 2) Setup your program
  const programService = new ProgramService();
  const programId = programService.programId; // or new PublicKey(...)

  // 3) Init your DB (Sequelize)
  const { sequelize, models } = await initForum({
    dialect: "sqlite",
    storage: ":memory:",
  });

  // 4) Create the indexer
  const indexer = new ForumIndexer({
    connection,
    programId,
    models, // { User, Post, Comment, CommentReaction }
  });

  let refetch = false; // to avoid missing logs
  let dealing = false;

  const run = async () => {
    if (dealing) {
      return;
    }

    dealing = true;
    await indexer.indexAllData();
    while (refetch) {
      refetch = false;
      await indexer.indexAllData();
    }
    dealing = false;
  };

  connection.onLogs(
    programId,
    async (logs) => {
      console.log("log event");
      console.log(logs);
      if (dealing) {
        refetch = true;
        return;
      }

      await indexer.waitUntilSignaturePresent(logs.signature, 30);

      run();
    },
    "confirmed"
  );

  // 5) Run the indexer
  await run();

  // wait until ctrl+c
  process.on("SIGINT", async () => {
    console.log("SIGINT received, closing...");
    await sequelize.close();
    process.exit(0);
  });
}

main().catch(console.error);
