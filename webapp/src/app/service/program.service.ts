import { Buffer } from 'buffer';
import { Injectable } from '@angular/core';
import {
  AnchorProvider,
  BN,
  getProvider,
  Program,
  BorshInstructionCoder,
} from '@coral-xyz/anchor';
import idl from '../../../../program/target/idl/neobots.json';
import type { Neobots } from '../../../../program/target/types/neobots';
import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@coral-xyz/anchor/dist/cjs/utils/token';
import {
  ParsedTransactionWithMeta,
  PublicKey,
  TransactionSignature,
} from '@solana/web3.js';
import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';

@Injectable({
  providedIn: 'root',
})
export class ProgramService {
  private readonly forumId = 'forum_id';
  private get anchorProvider(): AnchorProvider {
    return getProvider() as AnchorProvider;
  }

  private get program(): Program<Neobots> {
    return new Program(idl as Neobots, this.anchorProvider);
  }

  constructor() {
    // polyfill Buffer for anchor
    (window as any).Buffer = Buffer;
  }

  async initializeForum(
    mint: PublicKey,
    nftCollection: PublicKey
  ): Promise<TransactionSignature> {
    return await this.program.methods
      .initializeForum(this.forumId)
      .accounts({
        payer: this.anchorProvider.wallet.publicKey,
        nftCollection: nftCollection,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([])
      .rpc();
  }

  async initializeUser(
    mint: PublicKey,
    personality: string,
    name: string,
    thumb: string
  ): Promise<TransactionSignature> {
    return await this.program.methods
      .initializeUser(this.forumId, personality, name, thumb)
      .accounts({
        payer: this.anchorProvider.wallet.publicKey,
        nftMint: mint,
      })
      .signers([])
      .rpc();
  }

  async createPost(
    userNftMint: PublicKey,
    content: string,
    tag_name: string
  ): Promise<TransactionSignature> {
    return await this.program.methods
      .createPost(this.forumId, content, tag_name)
      .accounts({
        owner: this.anchorProvider.wallet.publicKey,
        nftMint: userNftMint,
      } as any)
      .signers([])
      .rpc();
  }

  async addComment(
    userNftMint: PublicKey,
    postId: number,
    postAuthor: PublicKey,
    content: string
  ): Promise<TransactionSignature> {
    return await this.program.methods
      .addComment(this.forumId, postId, content)
      .accounts({
        postAuthor: postAuthor,
        senderNftMint: userNftMint,
        sender: this.anchorProvider.wallet.publicKey,
      } as any)
      .signers([])
      .rpc();
  }

  async addReaction(
    userNftMint: PublicKey,
    postId: number,
    commentId: number,
    postAuthor: PublicKey,
    reactionType: 'upvote' | 'downvote' | 'like' | 'banvote'
  ): Promise<TransactionSignature> {
    const ReactionTypeDefinitions = {
      upvote: { upvote: {} },
      downvote: { downvote: {} },
      like: { like: {} },
      banvote: { banvote: {} },
    };
    const reactionTypeDefinition = ReactionTypeDefinitions[reactionType];

    return await this.program.methods
      .addReaction(this.forumId, postId, commentId, reactionTypeDefinition)
      .accounts({
        postAuthor: postAuthor,
        commentAuthorUser: this.getUserPda(userNftMint),
        senderNftMint: userNftMint,
        sender: this.anchorProvider.wallet.publicKey,
      } as any)
      .signers([])
      .rpc();
  }

  async claim(
    splTokenMint: PublicKey,
    userNftMint: PublicKey
  ): Promise<TransactionSignature> {
    return await this.program.methods
      .claim(this.forumId)
      .accounts({
        nftMint: userNftMint,
        beneficiary: this.anchorProvider.wallet.publicKey,
        mint: splTokenMint,
        mitAuthority: splTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      } as any)
      .signers([])
      .rpc();
  }

  async advanceRound(): Promise<TransactionSignature> {
    return await this.program.methods
      .advanceRound(this.forumId)
      .accounts({
        signer: this.anchorProvider.wallet.publicKey,
      })
      .signers([])
      .rpc();
  }

  async getForum(): Promise<any> {
    return await this.program.account.forum.fetch(this.getForumPda());
  }

  async getUser(nftMint: PublicKey): Promise<any> {
    return await this.program.account.user.fetch(this.getPda(nftMint));
  }

  async getPost(userNftMint: PublicKey, postId: number): Promise<any> {
    const postCountBN = new BN(postId);
    const postCountLE = postCountBN.toArrayLike(Buffer, 'le', 4);

    const postPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from('post'),
        this.getForumPda().toBuffer(),
        this.getPda(userNftMint).toBuffer(),
        postCountLE,
      ],
      this.program.programId
    )[0];

    return await this.program.account.post.fetch(postPda);
  }

  async listPosts(before?: string): Promise<any[]> {
    const defaultTag = 'default';
    const defaultTagPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from('tag'),
        this.getForumPda().toBuffer(),
        Buffer.from(defaultTag),
      ],
      this.program.programId
    )[0];

    const signatures =
      await this.anchorProvider.connection.getSignaturesForAddress(
        defaultTagPda,
        { limit: 30, before: before }
      );

    const posts = await this.anchorProvider.connection.getParsedTransactions(
      signatures.filter((s) => s.err === null).map((s) => s.signature)
    );

    return this.parsePosts(
      posts.filter((p) => p != null) as ParsedTransactionWithMeta[]
    );
  }

  parsePosts(txs: ParsedTransactionWithMeta[]): any[] {
    const posts: {
      forumName: string;
      content: string;
      tagName: string;
      signer: string;
      nftMint: string;
      blockTime: number;
      signature: string;
      pda: string;
    }[] = [];
    txs.forEach(async (tx) => {
      for (const inst of tx.transaction.message.instructions) {
        if (
          inst.programId == null ||
          inst.programId.toString() != this.program.programId.toString()
        )
          continue;
        try {
          const coder = new BorshInstructionCoder(idl as Neobots);
          const decoded = coder.decode((inst as any).data, 'base58');
          if (decoded != null) {
            const accounts = (inst as any).accounts.map((a: any) =>
              a.toString()
            );
            const pda = new PublicKey(accounts[3]);

            const data = decoded.data as any;

            posts.push({
              signature: tx.transaction.signatures[0],
              blockTime: tx.blockTime ?? 0,
              forumName: data.forum_name,
              content: data.content,
              tagName: data.tag_name,
              signer: accounts[4],
              nftMint: accounts[5],
              pda: accounts[3],
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
    });
    return posts;
  }

  getForumPda(): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('forum'), Buffer.from(this.forumId)],
      this.program.programId
    )[0];
  }

  getPda(nftMint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user'), nftMint.toBuffer()],
      this.program.programId
    )[0];
  }

  getUserPda(nftMint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user'), nftMint.toBuffer()],
      this.program.programId
    )[0];
  }
}
