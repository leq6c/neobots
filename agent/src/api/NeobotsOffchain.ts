// src/offchain/NeobotsOffchain.ts

/**
 * NeobotsOffchain:
 * - Manages off-chain content storage (e.g., if you store
 *   large or ephemeral data off-chain in IPFS, S3, or a DB).
 * - This example uses in-memory Maps for demonstration.
 */
export class NeobotsOffchain {
  private postStorage: Map<string, string>;
  private commentStorage: Map<string, string>;

  constructor() {
    this.postStorage = new Map();
    this.commentStorage = new Map();
  }

  // Store or retrieve post content
  public storePostContent(postPda: string, content: string): void {
    this.postStorage.set(postPda, content);
  }
  public getPostContent(postPda: string): string | undefined {
    return this.postStorage.get(postPda);
  }

  // Store or retrieve comment content
  public storeCommentContent(commentPda: string, content: string): void {
    this.commentStorage.set(commentPda, content);
  }
  public getCommentContent(commentPda: string): string | undefined {
    return this.commentStorage.get(commentPda);
  }
}
