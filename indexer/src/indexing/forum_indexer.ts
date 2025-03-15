// ForumIndexer.ts

import { Connection, PublicKey, Commitment } from "@solana/web3.js";
import { parseAny } from "../solana/parser/parseTx"; // <--- your refactored parse function
import type {
  ConfirmedSignatureInfo,
  Finality,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";

import { ForumModels } from "../forum/init"; // or wherever your models are exported
import neobotsIdl from "../../../program/target/idl/neobots.json"; // Adjust to your actual IDL path
import { NeobotsOffChainApi } from "../api/NeobotsOffChainApi";
import { Post } from "../forum/models/post.model";

interface ForumIndexerConfig {
  connection: Connection;
  programId: PublicKey;
  models: ForumModels; // { User, Post, Comment, CommentReaction }
  offChainApi: NeobotsOffChainApi;
}

export class ForumIndexer {
  private connection: Connection;
  private programId: PublicKey;
  private models: ForumModels;
  private batchSize: number;
  private commitment: Finality;
  private offChainApi: NeobotsOffChainApi;

  constructor(config: ForumIndexerConfig) {
    this.connection = config.connection;
    this.programId = config.programId;
    this.models = config.models;
    this.batchSize = 100; // default, or pass as param
    this.commitment = "confirmed";
    this.offChainApi = config.offChainApi;
  }

  public async waitUntilSignaturePresent(
    signature: string,
    timeoutSeconds: number
  ): Promise<boolean> {
    const startTime = Date.now();
    while (true) {
      const status = await this.connection.getSignatureStatus(signature);

      if (status?.value?.confirmationStatus === this.commitment) {
        break;
      }

      if (Date.now() - startTime > timeoutSeconds * 1000) {
        console.log("Signature not found after timeout");
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("Signature found");
    return true;
  }

  /**
   * Main function to index the entire set of program transactions
   * from the earliest to the newest, or just the "new" ones since the last index.
   */
  public async indexAllData(): Promise<void> {
    // 1) Check if we have a "latest indexed signature" in DB
    const latestSignatureInDb = await this.getLatestIndexedSignature(); // e.g. '3gSd...'

    // If no signature is in DB, this is our "first time" indexing
    const isFirstTime = !latestSignatureInDb;

    // We'll keep an array of all signature infos we collect
    let allSigs: ConfirmedSignatureInfo[] = [];

    // If first time: we fetch **all** signatures from newest to oldest, in multiple batches
    // until the RPC returns no more
    if (isFirstTime) {
      console.log("No previously indexed signature found. Doing full sync...");
      let before: string | undefined = undefined;

      while (true) {
        const sigInfos = await this.connection.getSignaturesForAddress(
          this.programId,
          {
            limit: this.batchSize,
            before,
          },
          this.commitment
        );
        if (sigInfos.length === 0) {
          break; // no more
        }
        allSigs.push(...sigInfos);
        before = sigInfos[sigInfos.length - 1].signature; // keep paging back
        if (sigInfos.length < this.batchSize) {
          // fetched fewer than batchSize, so no more left
          break;
        }
      }

      // Now we have an array in descending order (newest->oldest).
      // Reverse it to process oldest->newest
      allSigs.reverse();

      // Process each in ascending time
      await this.indexSignaturesArray(allSigs);

      // The newest signature is at the end of allSigs now
      if (allSigs.length > 0) {
        const newestSig = allSigs[allSigs.length - 1].signature;
        await this.saveLatestIndexedSignature(newestSig);
        console.log(`Full sync done. Latest signature saved: ${newestSig}`);
      } else {
        console.log("No transactions found at all.");
      }
    } else {
      // 2) Not first time => fetch only the "new" transactions
      // We'll keep retrieving in descending order but will stop once we reach 'latestSignatureInDb'
      console.log(
        `Found existing latest signature: ${latestSignatureInDb}. Fetching newer ones...`
      );

      // We'll store results in an array
      let done = false;
      let before: string | undefined = undefined;

      while (!done) {
        const sigInfos = await this.connection.getSignaturesForAddress(
          this.programId,
          {
            limit: this.batchSize,
            before,
            // We can use `until: latestSignatureInDb` so that the RPC will
            // stop returning results once it hits that signature
            until: latestSignatureInDb,
          },
          this.commitment
        );

        if (sigInfos.length === 0) {
          done = true;
          break;
        }

        allSigs.push(...sigInfos);

        // If we've reached the old signature or fetched fewer than batchSize,
        // we might be done
        const lastSig = sigInfos[sigInfos.length - 1].signature;
        if (
          lastSig === latestSignatureInDb ||
          sigInfos.length < this.batchSize
        ) {
          done = true;
        } else {
          // keep paging
          before = lastSig;
        }
      }

      // The array is descending (newest->oldest).
      // But these are the "new" sigs *after* the previously known signature.
      // Some might be duplicates if "until" signature was encountered in the middle.
      // We'll filter them so we only process strictly "newer" ones.
      // Then reverse for oldest->newest processing.
      const filtered = allSigs.filter(
        (s) => s.signature !== latestSignatureInDb
      );

      if (filtered.length === 0) {
        console.log("No new transactions since last indexed signature.");
        return;
      }

      filtered.reverse();
      await this.indexSignaturesArray(filtered);

      // The newest sig is now at the end of 'filtered'
      const newestSig = filtered[filtered.length - 1].signature;
      await this.saveLatestIndexedSignature(newestSig);
      console.log(
        `Indexed ${filtered.length} new transactions. Updated newest sig: ${newestSig}`
      );
    }
  }

  /**
   * Retrieve the latest indexed signature from the DB (or config table).
   * Return `undefined` if not found (i.e., first time).
   */
  private async getLatestIndexedSignature(): Promise<string | undefined> {
    const row = await this.models.IndexMetadata.findOne({
      where: { meta_key: "latestSignature" },
    });

    if (!row) return undefined;
    return row.meta_value; // stored as TEXT
  }

  /**
   * Save the newest (latest) signature in your DB so future runs only index
   * transactions that came after it.
   */
  private async saveLatestIndexedSignature(sig: string): Promise<void> {
    // Upsert or create the row
    await this.models.IndexMetadata.upsert({
      meta_key: "latestSignature",
      meta_value: sig,
      updated_at: new Date(),
    });
  }

  /**
   * Helper: Fetch each signature in the array, parse, and store in DB (ascending order).
   */
  private async indexSignaturesArray(sigInfos: ConfirmedSignatureInfo[]) {
    const sigStrings = sigInfos.map((info) => info.signature);
    const parsedTxs = await this.connection.getParsedTransactions(sigStrings, {
      maxSupportedTransactionVersion: 0,
      commitment: this.commitment,
    });

    // For each transaction, parse and index
    // 'parsedTxs' is in the same order as 'sigStrings'
    for (const tx of parsedTxs) {
      if (!tx) {
        throw new Error("No transaction found for signature");
      }
      await this.indexTransaction(tx);
    }
  }

  /**
   * Parses one transaction, then upserts relevant rows in DB.
   */
  private async indexTransaction(tx: ParsedTransactionWithMeta) {
    const instructions = parseAny({
      tx,
      programId: this.programId,
      idl: neobotsIdl as any, // Adjust to your actual IDL type
    });

    // For each parsed instruction, insert or update in DB
    for (const instr of instructions) {
      try {
        switch (instr.fn) {
          case "initialize_user":
            await this.indexUser(instr);
            break;

          case "create_post":
            await this.indexPost(instr);
            break;

          case "add_comment":
            await this.indexComment(instr);
            break;

          case "add_reaction":
            await this.indexReaction(instr);
            break;

          // "initialize_forum" is skipped, or handle if you wish
          default:
            // Unknown or unneeded instruction
            break;
        }
      } catch (err) {
        console.error(`Failed to index instruction [${instr.fn}]:`, err);
      }
    }
  }

  /**
   * Insert or update a user from 'initialize_user'
   */
  private async indexUser(instr: any) {
    // instr.data is type { forumPda, userPda, nftMint, payer }
    const { User } = this.models;
    const { data } = instr;

    // Upsert or create the user
    await User.upsert({
      user_pda: data.userPda,
      associated_asset_pda: data.nftMint, // e.g. storing user NFT as unique asset
      create_transaction_signature: instr.signature,
      create_transaction_block_time: instr.blockTime,
      create_transaction_signer: data.payer,
      index_created_at: new Date(),
      index_updated_at: new Date(),
      username: data.name,
      thumbnail_url: data.thumb,
    });
    console.log(`Indexed user: ${data.userPda}`);
  }

  /**
   * Insert or update a post from 'create_post'
   */
  private async indexPost(instr: any) {
    // instr.data is type CreatePostData
    const { Post, User } = this.models;
    const { data } = instr;

    let content = data.content;
    // TODO: this is just a hack to get the content from the off-chain APIkj
    if (content.includes("-")) {
      content = await this.offChainApi.get(content);
    }

    const user = await User.findOne({
      where: { user_pda: data.postAuthorPda },
    });
    const username = user?.username ?? "unknown";
    const thumbnail_url = user?.thumbnail_url ?? "unknown";

    await Post.upsert({
      post_pda: data.postPda,
      post_sequence_id: data.postSequence,
      post_author_pda: data.postAuthorPda,
      post_author_associated_asset_pda: data.nftMint,

      post_author_username: username,
      post_author_thumbnail_url: thumbnail_url,

      tag_name: data.tagName,
      // tag_pda: ??? If you want to store data.postTagPda
      content: content,
      content_url: data.content,
      content_hash: "test",
      index_created_at: new Date(),
      index_updated_at: new Date(),

      create_transaction_signature: instr.signature,
      create_transaction_block_time: instr.blockTime,
      create_transaction_signer: data.signer,

      received_upvotes: 0,
      received_downvotes: 0,
      received_likes: 0,
      received_banvotes: 0,
    });
    console.log(`Indexed post: ${data.postPda}`);
  }

  /**
   * Insert or update a comment from 'add_comment'
   */
  private async indexComment(instr: any) {
    // instr.data is type AddCommentData
    const { Comment, User } = this.models;
    const { data } = instr;

    // In your schema, the PK is (comment_author_sequence_id, comment_author_user_pda)
    // We'll store the parsed `commentSequence` from logs as the sequence ID
    if (data.commentSequence == null) {
      // No commentSequence means we couldn't parse logs
      console.warn(`No commentSequence found for comment. Skipping.`);
      return;
    }

    let content = data.content;
    if (content.includes("-")) {
      content = await this.offChainApi.get(content);
    }

    const user = await User.findOne({
      where: { user_pda: data.commentAuthorPda },
    });
    const username = user?.username ?? "unknown";
    const thumbnail_url = user?.thumbnail_url ?? "unknown";

    await Comment.upsert({
      comment_author_sequence_id: data.commentSequence,
      comment_author_user_pda: data.commentAuthorPda,
      comment_author_associated_asset_pda: data.commentAuthorNftMint,

      comment_author_username: username,
      comment_author_thumbnail_url: thumbnail_url,

      parent_post_pda: data.targetPostPda,
      parent_post_author_user_pda: data.targetPostAuthorPda,
      parent_post_sequence_id: data.postSequence,

      content: content,
      content_url: data.content,
      content_hash: "test",

      index_created_at: new Date(),
      index_updated_at: new Date(),

      create_transaction_signature: instr.signature,
      create_transaction_block_time: instr.blockTime,
      create_transaction_signer: data.signer,
      // received_upvotes, downvotes, etc. default to 0
    });

    const post = await Post.findOne({
      where: { post_pda: data.targetPostPda },
    });
    if (post) {
      await post.update({
        received_comments: (post.received_comments ?? 0) + 1,
        index_updated_at: new Date(),
      });
    }

    console.log(
      `Indexed comment: #${data.commentSequence} from user: ${data.commentAuthorPda}`
    );
  }

  /**
   * Insert or update a reaction from 'add_reaction'
   */
  private async indexReaction(instr: any) {
    // instr.data is type AddReactionData
    const { CommentReaction, Comment, User } = this.models;
    const { data } = instr;

    if (data.reactionSequence == null) {
      console.warn(`No reactionSequence found. Skipping reaction indexing.`);
      return;
    }

    const user = await User.findOne({
      where: { user_pda: data.reactionAuthorPda },
    });
    const username = user?.username ?? "unknown";
    const thumbnail_url = user?.thumbnail_url ?? "unknown";

    // 1) Insert the reaction
    await CommentReaction.upsert({
      reaction_author_sequence_id: data.reactionSequence,
      reaction_author_user_pda: data.reactionAuthorPda,
      reaction_author_associated_asset_pda: data.reactionAuthorNftMint,
      reaction_author_username: username,
      reaction_author_thumbnail_url: thumbnail_url,

      parent_post_pda: data.targetPostPda,
      parent_post_author_user_pda: data.targetPostAuthorPda,
      parent_post_sequence_id: data.postSequence,

      parent_comment_sequence_id: data.targetCommentSequence, // from logs
      parent_comment_author_user_pda: data.commentAuthorPda,

      reaction_type: data.reactionType, // or parse from data, if you have it
      content: "", // for emojis or extra text

      index_created_at: new Date(),
      index_updated_at: new Date(),
      create_transaction_signature: instr.signature,
      create_transaction_block_time: instr.blockTime,
      create_transaction_signer: data.signer,
    });

    console.log(
      `Indexed reaction #${data.reactionSequence}, from user: ${data.reactionAuthorPda}`
    );

    // 2) Optionally, update the 'received_upvotes' or 'received_likes' in the comment table
    // if your logic tracks upvotes in real time. For example:
    if (data.targetCommentSequence != null && data.commentAuthorPda) {
      // increment the comment's 'received_upvotes' or something
      const commentKey = {
        comment_author_sequence_id: data.targetCommentSequence,
        comment_author_user_pda: data.commentAuthorPda,
      };

      const comment = await Comment.findOne({ where: commentKey });
      const post = await Post.findOne({
        where: { post_pda: data.targetPostPda },
      });
      if (comment && post) {
        // For example, increment upvotes:
        if (data.reactionType === "upvote") {
          const commentNewUpvotes = (comment.received_upvotes ?? 0) + 1;
          await comment.update({
            received_upvotes: commentNewUpvotes,
            index_updated_at: new Date(),
          });
          const postNewUpvotes = (post.received_upvotes ?? 0) + 1;
          await post.update({
            received_upvotes: postNewUpvotes,
            index_updated_at: new Date(),
          });
        } else if (data.reactionType === "downvote") {
          const commentNewDownvotes = (comment.received_downvotes ?? 0) + 1;
          await comment.update({
            received_downvotes: commentNewDownvotes,
            index_updated_at: new Date(),
          });
          const postNewDownvotes = (post.received_downvotes ?? 0) + 1;
          await post.update({
            received_downvotes: postNewDownvotes,
            index_updated_at: new Date(),
          });
        } else if (data.reactionType === "banvote") {
          const commentNewBanvotes = (comment.received_banvotes ?? 0) + 1;
          await comment.update({
            received_banvotes: commentNewBanvotes,
            index_updated_at: new Date(),
          });
          const postNewBanvotes = (post.received_banvotes ?? 0) + 1;
          await post.update({
            received_banvotes: postNewBanvotes,
            index_updated_at: new Date(),
          });
        } else if (data.reactionType === "like") {
          const commentNewLikes = (comment.received_likes ?? 0) + 1;
          await comment.update({
            received_likes: commentNewLikes,
            index_updated_at: new Date(),
          });
          const postNewLikes = (post.received_likes ?? 0) + 1;
          await post.update({
            received_likes: postNewLikes,
            index_updated_at: new Date(),
          });
        }
        console.log(
          `Incremented upvotes for comment #${data.targetCommentSequence}`
        );
      }
    }
  }
}
