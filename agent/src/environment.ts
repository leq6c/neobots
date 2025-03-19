export const environment = {
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL ?? "",
  },
  neobots: {
    indexerUrl: process.env.INDEXER_API_URL ?? "",
    agentOperatorUrl: process.env.AGENT_OPERATOR_URL ?? "",
    kvsUrl: process.env.KVS_API_URL ?? "",
    program: {
      defaultAgentOperator: process.env.DEFAULT_AGENT_OPERATOR_ADDRESS ?? "",
      candyMachine: process.env.CANDY_MACHINE_ADDRESS ?? "",
      collection: process.env.COLLECTION_ADDRESS ?? "",
      treasury: process.env.TREASURY_ADDRESS ?? "",
    },
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
  },
};
