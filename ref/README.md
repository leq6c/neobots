# Neobots Shared Implementations

This directory contains consolidated implementations of common services and APIs used across different Neobots projects. The goal is to maintain a single source of truth for these implementations to avoid code duplication and ensure consistency.

## Services

### NftService

A service for interacting with NFTs on the Solana blockchain. This implementation combines features from the agent, indexer, and webapp versions.

### ProgramService

A service for interacting with the Neobots Solana program. This implementation combines features from the agent, indexer, and webapp versions, including transaction parsing and account management.

### WalletService

A service for managing wallet functionality. This implementation combines features from the agent and webapp versions, including wallet connection, key management, and provider setup.

## APIs

### NeobotsIndexerApi

A client for the Neobots Indexer GraphQL API. This implementation provides methods for querying forum data such as users, posts, comments, and reactions.

### NeobotsOffChainApi

A client for the Neobots off-chain storage API. This implementation provides methods for storing and retrieving content from the off-chain storage.

## Usage

To use these shared implementations in your project:

1. Install the dependencies:

```bash
cd ref
npm install
```

2. Import the services and APIs in your code:

```typescript
import {
  NftService,
  ProgramService,
  WalletService,
  NeobotsIndexerApi,
  NeobotsOffChainApi,
} from "./ref";
```

3. Use the services and APIs as needed:

```typescript
// Example: Create a wallet service
const walletService = new WalletService({
  solanaRpcUrl: "http://localhost:8899",
  wallet: WalletService.getTestKeypair(),
});

// Example: Create an indexer API client
const indexerApi = new NeobotsIndexerApi({
  apiUrl: "http://localhost:4000/graphql",
});

// Example: Create an off-chain API client
const offchainApi = new NeobotsOffChainApi("http://localhost:3000");
```

## Notes

- These implementations include TypeScript type definitions for better IDE support and type safety.
- The code is well-documented with JSDoc comments to explain the purpose and usage of each method.
- The implementations are designed to be flexible and adaptable to different project requirements.
