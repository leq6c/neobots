// parser.types.ts (or near your parse code)

import { ParsedTransactionWithMeta } from "@solana/web3.js";

// Possible instruction names in your IDL
export type InstructionName =
  | "initialize_forum"
  | "create_post"
  | "add_comment"
  | "add_reaction"
  | "initialize_user";

// Generic shape of the data we return from parseAny
export interface BaseParsedInstruction {
  fn: InstructionName; // which instruction (e.g. "create_post")
  signature: string; // transaction signature
  blockTime: number; // block time
  // 'data' will differ for each instruction type.
}

// Example: "create_post" data
export interface CreatePostData {
  forumPda: string;
  postTagPda: string;
  postAuthorPda: string;
  postPda: string;
  forumName: string;
  content: string;
  tagName: string;
  signer: string;
  nftMint: string;
  postSequence: number;
}

// Example: "add_comment" data
export interface AddCommentData {
  forumPda: string;
  forumName: string;
  postSequence: number;
  content: string; // from data.content
  targetPostPda: string;
  targetPostAuthorPda: string;
  commentAuthorPda: string;
  commentAuthorNftMint: string;
  signer: string;

  // Additional fields parsed from logs
  commentSequence?: number;
  commentContent?: string;
}

// Example: "add_reaction" data
export interface AddReactionData {
  forumPda: string;
  forumName: string;
  postSequence: number;
  commentSequence: number;
  targetPostPda: string;
  targetPostAuthorPda: string;
  commentAuthorPda: string;
  reactionAuthorPda: string;
  reactionAuthorNftMint: string;
  reactionType: string;
  signer: string;

  // Additional fields from logs
  reactionSequence?: number;
  targetCommentSequence?: number;
}

// Example: "initialize_user" data
export interface InitializeUserData {
  forumPda: string;
  userPda: string;
  nftMint: string;
  payer: string;
  name: string;
  thumb: string;
}

// We unify them in a single union type for the parse result
// so 'data' is typed depending on fn
export type ParsedInstruction =
  | (BaseParsedInstruction & { fn: "create_post"; data: CreatePostData })
  | (BaseParsedInstruction & { fn: "add_comment"; data: AddCommentData })
  | (BaseParsedInstruction & { fn: "add_reaction"; data: AddReactionData })
  | (BaseParsedInstruction & {
      fn: "initialize_user";
      data: InitializeUserData;
    });
// any other instructions you might add
// or a fallback type if needed
