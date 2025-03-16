import { Buffer } from "buffer";
import {
  AnchorProvider,
  BN,
  Program,
  BorshInstructionCoder,
} from "@coral-xyz/anchor";
import idl from "../program/target/idl/neobots.json";
import type { Neobots } from "../program/target/types/neobots";
import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  ParsedTransactionWithMeta,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from "@solana/web3.js";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { parseAny } from "./parser/parseTx";
import { CreatePostData, ParsedInstruction } from "./parser/parser.types";
import { extractProgramLogs } from "./parser/parseLogs";

export interface ActionPoints {
  post: number;
  comment: number;
  upvote: number;
  downvote: number;
  like: number;
  banvote: number;
}

export class ProgramService {
  private readonly forumId = "forum_id";

  private get program(): Program<Neobots> {
    return new Program(idl as Neobots, this.anchorProvider);
  }

  get programId(): PublicKey {
    return new PublicKey(this.program.programId);
  }

  get defaultOperator(): PublicKey {
    return new PublicKey("EXJPJ1px6GBzGN5Zj1qLXcUQb7QVwgn9c9YSeCwJQYuG");
  }

  get tokenUnit(): number {
    return 1_000_000_000;
  }

  constructor(protected anchorProvider: AnchorProvider) {
    // polyfill Buffer for anchor
    if (typeof window !== "undefined") {
      (window as any).Buffer = Buffer;
    }
  }

  waitForChanges(callback: () => void, target: PublicKey = this.programId) {
    let once = false;
    let subscriptionId: number;

    subscriptionId = this.anchorProvider.connection.onLogs(
      target,
      () => {
        if (once) return;
        once = true;
        this.anchorProvider.connection.removeOnLogsListener(subscriptionId);
        callback();
      },
      "confirmed"
    );
  }

  waitForEvent(
    callback: (log: any, unregister: () => void) => void,
    eventName: "CreatePost" | "AddComment" | "AddReaction",
    target: PublicKey = this.programId
  ): () => void {
    let subscriptionId: number;

    const unregister = () => {
      this.anchorProvider.connection.removeOnLogsListener(subscriptionId);
    };

    subscriptionId = this.anchorProvider.connection.onLogs(
      target,
      (log) => {
        const { logsForThisIx, leftoverLogs } = extractProgramLogs(
          log.logs,
          this.programId.toString()
        );
        if (
          logsForThisIx.length > 0 &&
          logsForThisIx[0] == `Instruction: ${eventName}`
        ) {
          callback(log, unregister);
        }
      },
      "finalized"
    );

    return unregister;
  }

  async confirmTransaction(sig: TransactionSignature): Promise<void> {
    await this.anchorProvider.connection.confirmTransaction({
      signature: sig,
      ...(await this.anchorProvider.connection.getLatestBlockhash()),
    });
  }

  async finalizeTransaction(sig: TransactionSignature): Promise<void> {
    await this.anchorProvider.connection.confirmTransaction(
      {
        signature: sig,
        ...(await this.anchorProvider.connection.getLatestBlockhash()),
      },
      "finalized"
    );
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
    nftCollection: PublicKey
  ): Promise<TransactionSignature> {
    const METADATA_SEED = "metadata";
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    const [mint] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint")],
      this.program.programId
    );

    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(METADATA_SEED),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    return await this.program.methods
      .initializeForum(this.forumId)
      .accounts({
        payer: this.anchorProvider.wallet.publicKey,
        nftCollection: nftCollection,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        metadata: metadataAddress,
      } as any)
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

  async setUserOperator(
    userNftMint: PublicKey,
    operator: PublicKey
  ): Promise<TransactionSignature> {
    return await this.program.methods
      .setUserOperator(this.forumId)
      .accounts({
        payer: this.anchorProvider.wallet.publicKey,
        nftMint: userNftMint,
        operator: operator,
      })
      .signers([])
      .rpc();
  }

  async initializerUserWithOperator(
    mint: PublicKey,
    personality: string,
    name: string,
    thumb: string,
    operator: PublicKey
  ): Promise<TransactionSignature> {
    const initializeUserTx = this.program.methods
      .initializeUser(this.forumId, personality, name, thumb)
      .accounts({
        payer: this.anchorProvider.wallet.publicKey,
        nftMint: mint,
      });

    const setUserOperatorTx = this.program.methods
      .setUserOperator(this.forumId)
      .accounts({
        payer: this.anchorProvider.wallet.publicKey,
        nftMint: mint,
        operator: operator,
      });

    const tx = new Transaction().add(
      await initializeUserTx.instruction(),
      await setUserOperatorTx.instruction()
    );

    return await this.anchorProvider.sendAndConfirm(tx);
  }

  async unsetUserOperator(
    userNftMint: PublicKey
  ): Promise<TransactionSignature> {
    return await this.program.methods
      .unsetUserOperator(this.forumId)
      .accounts({
        payer: this.anchorProvider.wallet.publicKey,
        nftMint: userNftMint,
      })
      .signers([])
      .rpc();
  }

  async resetUserActionPoints(
    userNftMint: PublicKey
  ): Promise<TransactionSignature> {
    return await this.program.methods
      .resetUserActionPoints(this.forumId)
      .accounts({
        nftMint: userNftMint,
        signer: this.anchorProvider.wallet.publicKey,
      })
      .signers([])
      .rpc();
  }

  async simulateResetUserActionPoints(userNftMint: PublicKey): Promise<{
    user: ActionPoints;
    default: ActionPoints;
  }> {
    const result = await this.program.methods
      .resetUserActionPoints(this.forumId)
      .accounts({
        nftMint: userNftMint,
        signer: this.anchorProvider.wallet.publicKey,
      })
      .signers([])
      .simulate();

    const { logsForThisIx, leftoverLogs } = extractProgramLogs(
      result.raw.map((r) => r.toString()),
      this.programId.toString()
    );

    const parseItem = (item: string) => {
      return item.split("=");
    };

    const parse = (line: string) => {
      const sp = line.split(",");
      const obj: any = {};
      for (const item of sp.slice(1)) {
        const [key, value] = parseItem(item);
        obj[key] = value;
      }
      return {
        type: sp[0].split("=")[1],
        values: obj,
      };
    };

    const results = logsForThisIx.slice(1).map(parse);

    return {
      user: results.find((r) => r.type === "user")!.values,
      default: results.find((r) => r.type === "forum")!.values,
    };
  }

  async initializeUserInstruction(
    mint: PublicKey,
    personality: string,
    name: string,
    thumb: string
  ): Promise<TransactionInstruction> {
    return await this.program.methods
      .initializeUser(this.forumId, personality, name, thumb)
      .accounts({
        payer: this.anchorProvider.wallet.publicKey,
        nftMint: mint,
      })
      .instruction();
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
    reactionType: "upvote" | "downvote" | "like" | "banvote"
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

  async getClaimableAmount(userNftMint: PublicKey): Promise<number> {
    const user = await this.getUser(userNftMint);
    return Number(user.claimableAmount);
  }

  async getSplTokenMint(): Promise<PublicKey> {
    const forum = await this.getForum();
    return forum.mint;
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
        systemProgram: SYSTEM_PROGRAM_ID,
      } as any)
      .signers([])
      .rpc();
  }

  async getForum(): Promise<any> {
    return await this.program.account.forum.fetch(this.getForumPda());
  }

  async getUserCounter(): Promise<any> {
    return await this.program.account.userCounter.fetch(
      this.getUserCounterPda()
    );
  }

  async getUser(nftMint: PublicKey): Promise<any> {
    return await this.program.account.user.fetch(this.getUserPda(nftMint));
  }

  async isUserInitialized(nftMint: PublicKey): Promise<boolean> {
    try {
      const user = await this.getUser(nftMint);
      return user != null;
    } catch (e) {
      return false;
    }
  }

  async getPostWithSignature(
    sig: TransactionSignature
  ): Promise<CreatePostData | undefined> {
    const tx = await this.anchorProvider.connection.getParsedTransaction(sig, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    const parsed = this.parseAny(tx!);
    return parsed.find((p) => p.fn === "create_post")?.data;
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

  parseAny(tx: ParsedTransactionWithMeta): ParsedInstruction[] {
    return parseAny({
      tx,
      programId: this.programId,
      idl: idl as any,
    });
  }

  getUserCounterPda(): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("usercounter")],
      this.program.programId
    )[0];
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
