import { Buffer } from "buffer";
import {
  AnchorProvider,
  BN,
  getProvider,
  Program,
  BorshInstructionCoder,
} from "@coral-xyz/anchor";
import idl from "../../../program/target/idl/neobots.json";
import type { Neobots } from "../../../program/target/types/neobots";
import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  LAMPORTS_PER_SOL,
  ParsedTransactionWithMeta,
  PublicKey,
  TransactionSignature,
} from "@solana/web3.js";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { parseAny } from "./parser/parseTx";

export class ProgramService {
  private readonly forumId = "forum_id";
  private get anchorProvider(): AnchorProvider {
    return getProvider() as AnchorProvider;
  }

  private get program(): Program<Neobots> {
    return new Program(idl as Neobots, this.anchorProvider);
  }

  get programId(): PublicKey {
    return new PublicKey(this.program.programId);
  }

  constructor() {
    // polyfill Buffer for anchor
    if (typeof window !== "undefined") {
      (window as any).Buffer = Buffer;
    }
  }

  // localnet
  async airdropSol(
    address: PublicKey,
    sols: number
  ): Promise<TransactionSignature> {
    return await this.anchorProvider.connection.requestAirdrop(
      address,
      LAMPORTS_PER_SOL * sols
    );
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

  async initializeUser(mint: PublicKey): Promise<TransactionSignature> {
    return await this.program.methods
      .initializeUser(this.forumId)
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
    const user = await this.getUser(userNftMint);
    if (user == null) {
      console.log("user not found");
    }
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
    content: string
  ): Promise<TransactionSignature> {
    return await this.program.methods
      .addReaction(this.forumId, postId, commentId)
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
    return await this.program.account.user.fetch(this.getUserPda(nftMint));
  }

  async getPost(userNftMint: PublicKey, postId: number): Promise<any> {
    const postCountBN = new BN(postId);
    const postCountLE = postCountBN.toArrayLike(Buffer, "le", 4);

    const postPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("post"),
        this.getForumPda().toBuffer(),
        this.getUserPda(userNftMint).toBuffer(),
        postCountLE,
      ],
      this.program.programId
    )[0];

    return await this.program.account.post.fetch(postPda);
  }

  async listPosts(before?: string): Promise<any[]> {
    const defaultTag = "default";
    const defaultTagPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("tag"),
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

    return posts.filter((p) => p != null).map((p) => this.parseAny(p));
  }

  async listAll(before?: string): Promise<any[]> {
    const signatures =
      await this.anchorProvider.connection.getSignaturesForAddress(
        this.getForumPda(),
        {
          limit: 1000,
          before: before,
        }
      );

    const txs = await this.anchorProvider.connection.getParsedTransactions(
      signatures.filter((s) => s.err === null).map((s) => s.signature)
    );

    return [];
  }

  parseAny(tx: ParsedTransactionWithMeta): any[] {
    return parseAny({
      tx,
      programId: this.programId,
      idl: idl as any,
    });
  }

  getForumPda(): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("forum"), Buffer.from(this.forumId)],
      this.program.programId
    )[0];
  }

  getUserPda(nftMint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user"), nftMint.toBuffer()],
      this.program.programId
    )[0];
  }
}
