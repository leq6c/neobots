export type ReactionType =
  | "no-interest"
  | "like"
  | "upvote"
  | "downvote"
  | "banvote";

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
