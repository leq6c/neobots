// helpers/parseInstructionData.ts
import {
  AddCommentData,
  AddReactionData,
  CreatePostData,
  InitializeUserData,
} from "./parser.types";

export function parseCreatePost(accounts: string[], raw: any): CreatePostData {
  return {
    forumPda: accounts[0],
    postTagPda: accounts[1],
    postAuthorPda: accounts[2],
    postPda: accounts[3],
    forumName: raw.forum_name,
    content: raw.content,
    tagName: raw.tag_name,
    signer: accounts[4],
    nftMint: accounts[5],
  };
}

export function parseAddComment(
  accounts: string[],
  raw: any,
  programLogs: string[]
): AddCommentData | null {
  // parse base data
  const baseData: AddCommentData = {
    forumPda: accounts[0],
    forumName: raw.forum_name,
    postSequence: raw.post_sequence,
    content: raw.content,
    targetPostPda: accounts[1],
    targetPostAuthorPda: accounts[2],
    commentAuthorPda: accounts[3],
    commentAuthorNftMint: accounts[4],
    signer: accounts[5],
  };

  // parse additional data from logs
  if (programLogs.length > 0) {
    const lastLine = programLogs[programLogs.length - 1];
    const splitIdx = lastLine.indexOf(",");
    if (splitIdx > 0) {
      baseData.commentSequence = parseInt(lastLine.slice(0, splitIdx), 10);
      baseData.commentContent = lastLine.slice(splitIdx + 1);
      return baseData;
    }
  }

  // If no logs or can't parse, return null
  return null;
}

export function parseAddReaction(
  accounts: string[],
  raw: any,
  programLogs: string[]
): AddReactionData | null {
  const baseData: AddReactionData = {
    forumPda: accounts[0],
    forumName: raw.forum_name,
    postSequence: raw.post_sequence,
    commentSequence: raw.comment_sequence,
    targetPostPda: accounts[1],
    targetPostAuthorPda: accounts[2],
    commentAuthorPda: accounts[3],
    reactionAuthorPda: accounts[4],
    reactionAuthorNftMint: accounts[5],
    signer: accounts[6],
  };

  // parse from logs
  if (programLogs.length > 0) {
    const lastLine = programLogs[programLogs.length - 1];
    const splitIdx = lastLine.indexOf(",");
    if (splitIdx > 0) {
      baseData.reactionSequence = parseInt(lastLine.slice(0, splitIdx), 10);
      baseData.targetCommentSequence = parseInt(
        lastLine.slice(splitIdx + 1),
        10
      );
      return baseData;
    }
  }

  return null;
}

export function parseInitializeUser(accounts: string[]): InitializeUserData {
  return {
    forumPda: accounts[0],
    userPda: accounts[1],
    nftMint: accounts[2],
    payer: accounts[3],
  };
}
