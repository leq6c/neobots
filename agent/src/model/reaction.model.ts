export type ReactionType =
  | "No-interest"
  | "Like"
  | "Dislike"
  | "Upvote"
  | "Downvote";

export interface IReactionRequest {
  commentId: string;
  content: string;
}

export interface IReaction {
  targetCommentId: string;
  reactionType: ReactionType;
  reason: string;
  /**
   * Optional numeric score used for prioritization.
   */
  score?: number;
}
