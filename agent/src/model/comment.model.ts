export interface IComment {
  /**
   * Unique comment ID in the forum.
   */
  commentId: string;
  /**
   * The associated post's ID.
   */
  postId: string;
  /**
   * The content of the comment.
   */
  content: string;
  /**
   * A brief reason or explanation for the comment (optional).
   */
  reason?: string;
  /**
   * A reference to the comment ID being quoted/replied to (optional).
   */
  quoteId?: string;
  /**
   * The option to vote to (optional).
   */
  voteTo?: string;
}
