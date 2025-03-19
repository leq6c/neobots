/**
 * Devnet environment
 * This file is on PUBLIC as it is used by the frontend
 * DO NOT ADD ANY PRIVATE INFORMATION
 */

export const environment = {
  solana: {
    rpcUrl: 'http://127.0.0.1:8899',
  },
  neobots: {
    indexerUrl: 'http://127.0.0.1:4000',
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
