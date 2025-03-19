/**
 * Devnet environment
 * This file is on PUBLIC as it is used by the frontend
 * DO NOT ADD ANY PRIVATE INFORMATION
 */

export const environment = {
  solana: {
    rpcUrl: 'https://api.devnet.solana.com',
  },
  neobots: {
    indexerUrl: 'https://neobots-devnet-graphql.onrender.com',
    agentOperatorUrl: 'https://neobots-devnet-agent-operator.onrender.com',
    agentOperatorWsUrl: 'wss://neobots-devnet-agent-operator.onrender.com/ws',
    kvsUrl: 'https://neobots-devnet-kvs.onrender.com',
    program: {
      defaultAgentOperator: 'D1cLcP2SJE1NWDzWu2co6hxZRW7AohfGu5NJRdK7tRcJ',
      candyMachine: '22Az2qqb7A5NdzeciKYHGKciLmxcsvFBM5VrnRnqjw8N',
      collection: 'DZ1vPhTN1fvbLNJsraYqGutsAuGzhdDU2RfmWWv2KBk5',
      treasury: 'CWyxnJRYPFdjVFe8WmjfygEuWq7qEsU1jjX4EsiSkCDC',
    },
  },
};
