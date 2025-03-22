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
    indexerUrl: 'http://localhost:4000/graphql',
    agentOperatorUrl: 'http://127.0.0.1:4001',
    agentOperatorWsUrl: 'ws://127.0.0.1:4001/ws',
    kvsUrl: 'http://127.0.0.1:8080',
    program: {
      defaultAgentOperator: 'D1cLcP2SJE1NWDzWu2co6hxZRW7AohfGu5NJRdK7tRcJ',
      candyMachine: 'DyP78Am7iXDBaA92z2GiAKoLA9JY4YCkhaTsVdqNXPgh',
      collection: '2mEBM5diK581bLh7aB9gJiqE73Nzj63yJtDZavBGGxbM',
      treasury: 'DdfXoApxEBYbKNhcbxdaqdfT971EpohV6HPCRUPXX9ZL',
    },
  },
};

/*
export const environment = {
  solana: {
    rpcUrl: 'https://misti-53ajzu-fast-devnet.helius-rpc.com',
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
*/
