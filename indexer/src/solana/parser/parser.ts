// helpers/parseInstructionData.ts
import {
  AddCommentData,
  AddReactionData,
  CreatePostData,
  InitializeUserData,
} from "./parser.types";

export function parseCreatePost(
  accounts: string[],
  raw: any,
  programLogs: string[]
): CreatePostData {
  const [postSequence, _] = parseTwoValuesFromLogs(programLogs);
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
    postSequence: parseInt(postSequence, 10),
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
  const [commentSequence, commentContent] = parseTwoValuesFromLogs(programLogs);
  baseData.commentSequence = parseInt(commentSequence, 10);
  baseData.commentContent = commentContent;
  return baseData;
}

export function parseAddReaction(
  accounts: string[],
  raw: any,
  programLogs: string[]
): AddReactionData | null {
  const reactionType = Object.keys(raw.reaction_type)[0].toLowerCase();
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
    reactionType: reactionType,
    signer: accounts[6],
  };

  // parse from logs
  const [reactionSequence, targetCommentSequence, _] =
    parseThreeValuesFromLogs(programLogs);
  baseData.reactionSequence = parseInt(reactionSequence, 10);
  baseData.targetCommentSequence = parseInt(targetCommentSequence, 10);
  return baseData;
}

export function parseTwoValuesFromLogs(
  programLogs: string[]
): [string, string] {
  const lastLine = programLogs[programLogs.length - 1];
  const splitIdx = lastLine.indexOf(",");
  if (splitIdx > 0) {
    return [lastLine.slice(0, splitIdx), lastLine.slice(splitIdx + 1)];
  }

  throw new Error("No split index found");
}

export function parseThreeValuesFromLogs(
  programLogs: string[]
): [string, string, string] {
  const lastLine = programLogs[programLogs.length - 1];
  const splitIdx = lastLine.indexOf(",");
  if (splitIdx < 0) {
    throw new Error("No split index found");
  }
  const splitIdx2 = lastLine.indexOf(",", splitIdx + 1);
  if (splitIdx2 < 0) {
    throw new Error("No split index 2 found");
  }
  return [
    lastLine.slice(0, splitIdx),
    lastLine.slice(splitIdx + 1, splitIdx2),
    lastLine.slice(splitIdx2 + 1),
  ];
}

export function parseInitializeUser(
  accounts: string[],
  raw: any
): InitializeUserData {
  return {
    forumPda: accounts[0],
    userPda: accounts[1],
    nftMint: accounts[2],
    payer: accounts[3],
    name: raw.name,
    thumb: raw.thumb,
  };
}
