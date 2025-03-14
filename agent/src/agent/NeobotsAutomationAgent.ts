import { PublicKey } from "@solana/web3.js";
import { NeobotsAgent } from "./NeobotsAgent";
import { NeobotsOperator } from "./NeobotsOperator";
import { NeobotsIndexerApi } from "../api/NeobotsIndexerApi";
import { IComment } from "../model/comment.model";
import { IReaction } from "../model/reaction.model";
import { NeobotsOffChainApi } from "../api/NeobotsOffchainApi";

interface AutomationConfig {
  maxPostsFetched: number; // e.g. 100
  maxPostsToRead: number; // e.g. 10 (how many the LLM narrows down to)
  maxCommentsContext: number; // e.g. 50
  maxCommentsTail: number; // e.g. 50
  maxReactionsPerRound: number; // e.g. 20
}

/**
 * This automation agent coordinates:
 *  - Checking and using action points
 *  - Selecting which posts to comment on
 *  - Selecting which posts/comments to react to
 *  - Possibly creating brand-new posts if we have Post Points
 */
export class NeobotsAutomationAgent {
  constructor(
    private config: AutomationConfig,
    private agent: NeobotsAgent,
    private operator: NeobotsOperator,
    private indexer: NeobotsIndexerApi,
    private storage: NeobotsOffChainApi
  ) {}

  public async runOnce(): Promise<void> {
    // 1) Ensure we have selected a user (Agent identity)
    await this.ensureUserSelected();

    // 2) Check current action points
    const ap = await this.operator.getActionPoint();
    console.log("Current ActionPoints: ", ap);

    /**
     * 3) Possibly create a post if we have Post Points
     *    (You might want to always do at most 1 or 2 new posts per round.)
     */
    if (ap.postActionPoints > 0) {
      await this.createPostFlow();
      // assume we use 1 post point per post
      ap.postActionPoints -= 1; // or more if you want to do multiple posts
    }

    /**
     * 4) If we have Comment Points, do a "commenting" flow
     */
    if (ap.commentActionPoints > 0) {
      await this.commentFlow(ap);
    }

    /**
     * 5) If we have Reaction Points, do a "reaction" flow
     */
    const totalReactionPoints = ap.reactionActionPoints; // or subdivide into like/downvote/upvote if you want
    if (totalReactionPoints > 0) {
      await this.reactionFlow(ap);
    }

    console.log("Automation round complete.");
  }

  /**
   * Flow: Create a new post by passing some "news or user input" into the LLM
   */
  private async createPostFlow(): Promise<void> {
    // Possibly get some external “news” content or user prompt
    // For illustration, we’ll just pretend it’s an empty user prompt:
    const post = await this.agent.createPost();
    console.log("Creating new post from LLM:", post);

    const user = await this.operator.getUser();
    const sig = await this.operator.getProgramService().createPost(
      user.nftMint,
      await this.storage.put(post.content),
      post.category || "General" // store category as your on-chain "tag_name" or similar
    );
    console.log("Created post (sig):", sig);
  }

  /**
   * Flow:
   *  1) fetch top X posts
   *  2) LLM picks Y = config.maxPostsToRead
   *  3) fetch comments for those posts
   *  4) LLM writes a comment
   *  5) post on chain
   *
   * We'll decrement commentActionPoints as we go, so we don't exceed what's available.
   */
  private async commentFlow(ap: any) {
    // 1) fetch the latest N=100 posts
    const posts = await this.indexer.getPosts({
      order: "desc",
      limit: this.config.maxPostsFetched,
    });

    // 2) transform to LLM-compatible shape, then let LLM filter
    const postSummaries = posts.map((p: any) => ({
      postId: p.post_pda,
      title: p.content.slice(0, 80), // or anything that can stand as "title"
    }));
    const selected = await this.agent.selectPostsToRead(
      postSummaries,
      this.config.maxPostsToRead
    );

    // 3) For each chosen post, fetch comments (up to 100).
    for (const choice of selected) {
      if (ap.commentActionPoints <= 0) {
        console.log("No more comment points left");
        break;
      }
      console.log(`CommentFlow: reading post: ${choice.postId}`);

      // fetch full post data
      const fullPost = await this.indexer.getPost(choice.postId);
      console.log("fullPost", fullPost);
      if (!fullPost) {
        continue;
      }

      const rawComments = await this.indexer.getComments({
        target: choice.postId,
        order: "asc", // maybe ascending so we can slice up
        limit: 500, // fetch a big chunk, then we'll do our own slicing
      });
      // slice it according to the logic in your note:
      // e.g. if commentCount < 100 => use all
      // else => first 50 (context) + last 50 (primary) + maybe top by “score” if you had it
      const selectedComments = this.selectComments(rawComments);

      // transform to IComment for LLM
      const existingComments = selectedComments.map((c: any) => ({
        commentId: `${c.comment_author_user_pda}:${c.comment_author_sequence_id}`,
        postId: fullPost.post_pda,
        content: c.content,
      }));

      // transform the post to something IPost for the LLM
      const iPost = {
        postId: fullPost.post_pda,
        title: "some title",
        content: fullPost.content,
        category: fullPost.tag_name || "General",
        tags: [fullPost.tag_name || "General"],
      };

      // 4) [LLM] create a new comment
      const newComment = await this.agent.createComment(
        iPost,
        existingComments
      );
      console.log("New LLM comment:", newComment);

      // 5) post on chain
      const user = await this.operator.getUser();
      const sig = await this.operator.getProgramService().addComment(
        user.nftMint,
        fullPost.post_sequence_id, // or however your chain code expects the post ID
        new PublicKey(fullPost.post_author_pda),
        await this.storage.put(newComment.content)
      );
      console.log("Added comment (sig): ", sig);

      // consume 1 comment point
      ap.commentActionPoints -= 1;
    }
  }

  /**
   * Reaction Flow:
   *  1) fetch top 100 posts
   *  2) pick top 10 via LLM
   *  3) read comments, apply same slicing logic
   *  4) LLM suggests reaction for each
   *  5) LLM prioritizes top-K (based on leftover reaction points)
   *  6) post on chain
   */
  private async reactionFlow(ap: any) {
    // 1) fetch top N posts
    const posts = await this.indexer.getPosts({
      order: "desc",
      limit: this.config.maxPostsFetched,
    });
    const postSummaries = posts.map((p: any) => ({
      postId: p.post_pda,
      title: p.content.slice(0, 80),
    }));
    const selected = await this.agent.selectPostsToRead(
      postSummaries,
      this.config.maxPostsToRead
    );

    for (const choice of selected) {
      if (ap.reactionActionPoints <= 0) {
        console.log("No reaction points left, stopping reaction flow.");
        break;
      }
      console.log(`ReactionFlow: reading post: ${choice.postId}`);

      // fetch full post
      const fullPost = await this.indexer.getPost(choice.postId);
      if (!fullPost) continue;

      // fetch & slice comments
      const rawComments = await this.indexer.getComments({
        target: choice.postId,
        order: "asc",
        limit: 500,
      });
      if (rawComments.length === 0) {
        console.log("No comments found, skipping post:", choice.postId);
        continue;
      }
      const selectedComments = this.selectComments(rawComments);

      // transform to ReactionRequests for LLM
      const reactionRequests = selectedComments.map((c: any) => ({
        commentId: `${c.comment_author_user_pda}:${c.comment_author_sequence_id}`,
        content: c.content,
      }));

      if (reactionRequests.length === 0) {
        console.log(
          "No reaction requests found, skipping post:",
          choice.postId
        );
        continue;
      }

      // 4) LLM suggests a reaction for each
      const preferred = ["Like", "Dislike", "Upvote", "Downvote"];
      let rawReactions = await this.agent.generateReactions(
        reactionRequests,
        preferred
      );

      if (rawReactions.length === 0) {
        console.log("No reactions found, skipping post:", choice.postId);
        continue;
      }

      // 5) LLM prioritizes top-K
      // If we have e.g. 10 reaction points left, we pick top 10 from the LLM’s scoring
      rawReactions = await this.agent.prioritizeReactions(
        rawReactions,
        ap.reactionActionPoints
      );

      if (rawReactions.length === 0) {
        console.log(
          "No reactions found after prioritization, skipping post:",
          choice.postId
        );
        continue;
      }

      // 6) post on chain
      const user = await this.operator.getUser();
      for (const r of rawReactions) {
        if (ap.reactionActionPoints <= 0) break;
        if (r.reactionType === "No-interest") continue;

        console.log(
          `Reacting to comment ${r.targetCommentId} with ${r.reactionType}`
        );
        const [userPdaStr, seqIdStr] = r.targetCommentId.split(":");
        if (!userPdaStr || !seqIdStr) {
          console.log("Invalid targetCommentId, skipping:", r.targetCommentId);
          continue;
        }
        const seqId = parseInt(seqIdStr, 10);

        await this.operator.getProgramService().addReaction(
          user.nftMint,
          fullPost.post_sequence_id,
          seqId,
          new PublicKey(fullPost.post_author_pda),
          r.reactionType // or pass it in "content"
        );

        // consume 1 reaction point
        ap.reactionActionPoints -= 1;
      }
    }
  }

  /**
   * Helper: slice the raw comments array into up to 100 comments:
   *  - if <100, use all
   *  - else the first 50 + last 50 + possibly we’d add “top by score” if you have that data
   *
   * For simplicity, here we’ll do just first 50 + last 50 if there are more than 100.
   */
  private selectComments(rawComments: any[]): any[] {
    if (rawComments.length <= 100) {
      return rawComments;
    }
    const first = rawComments.slice(0, this.config.maxCommentsContext);
    const last = rawComments.slice(-this.config.maxCommentsTail);
    // optionally insert “top by score” if you have a “score” field
    // ...
    return first.concat(last);
  }

  /**
   * Ensure we've selected an NFT user for the operator.
   */
  private async ensureUserSelected(): Promise<void> {
    if (!(await this.operator.hasNft())) {
      throw new Error("No NFT found in the operator's wallet.");
    }
    if (!this.operator.getProgramService()) {
      throw new Error("ProgramService not initialized for operator.");
    }
    await this.operator.selectUser();
  }
}
