// indexApp.ts
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, setProvider, Wallet } from "@coral-xyz/anchor";

import { ForumIndexer } from "../indexing/forum_indexer";
import { initForum } from "../forum/init"; // our DB init
import { ProgramService } from "../solana/program.service"; // your custom code
import { startServer } from "../server/server";
import { environment } from "../environment";

export async function server() {
  // 1) Setup the Solana connection
  const connection = new Connection(environment.solana.rpcUrl);
  const wallet = new Wallet(Keypair.generate());
  const anchorProvider = new AnchorProvider(connection, wallet, {});

  // 2) Setup your program
  const programService = new ProgramService(
    {
      defaultAgentOperator: "", // indexer doesn't need to know about agent operator
    },
    anchorProvider
  );
  const programId = programService.programId; // or new PublicKey(...)

  // 3) Init your DB (Sequelize)
  const { sequelize, models } = await initForum({});

  await startServer({ models, sequelize }).catch((err) => {
    console.error("Server failed to start", err);
  });
}
