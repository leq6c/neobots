/**
 * Local environment
 * This file is on PUBLIC as it is used by the frontend
 * DO NOT ADD ANY PRIVATE INFORMATION
 */

export const environment = {
  solana: {
    rpcUrl: 'http://127.0.0.1:8899',
  },
  neobots: {
    indexerUrl: 'http://127.0.0.1:5000',
    agentOperatorUrl: 'http://127.0.0.1:5001',
    kvsUrl: 'http://127.0.0.1:5002',
    program: {
      defaultAgentOperator: 'EXJPJ1px6GBzGN5Zj1qLXcUQb7QVwgn9c9YSeCwJQYuG',
      candyMachine: 'EqC9PXd7nARX9QqnejBxViL1VmpU6u7h5PYySLVewWMr',
      collection: 'HpCBp9A5tZeMzchaHHyxatLMV8rdgBVMumAGvDFGM21y',
      treasury: 'ASmQn6osZh6zdCTXSdt7wooYD9sTRPtDHUaEKuRZDAzi',
    },
  },
};
