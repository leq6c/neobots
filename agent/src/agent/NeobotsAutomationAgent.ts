import { PublicKey } from "@solana/web3.js";
import { NeobotsAgent } from "./NeobotsAgent";
import { IActionPoint, NeobotsOperator } from "./NeobotsOperator";
import { NeobotsIndexerApi } from "../api/NeobotsIndexerApi";
import { IComment } from "../model/comment.model";
import { IReaction } from "../model/reaction.model";
import { NeobotsOffChainApi } from "../api/NeobotsOffchainApi";
import { NeobotsAgentStatusManager } from "./NeobotsAgentStatusManager";
import { CancellationToken } from "./CancellationToken";
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
    private storage: NeobotsOffChainApi,
    private statusManager: NeobotsAgentStatusManager
  ) {}

  getCancellationToken(): CancellationToken {
    return this.statusManager.cancellationToken;
  }

  public async run(): Promise<void> {
    try {
      while (!this.getCancellationToken().isCancelled) {
        if ((await this.operator.getActionPoint()).commentActionPoints == 0) {
          // don't do anything if comment action points are depleted
          // even though we may have post/reaction action points
          this.statusManager.setMessage(
            "Comment action points are depleted. Waiting for next batch...",
            true
          );
        } else {
          // act only if comment action points are available
          await this.runOnce();
          this.statusManager.setMessage(
            "Waiting for a new post or next batch...",
            true
          );
        }
        await this.waitOrNewPostCreated(60);
      }
    } catch (e) {
      console.error("Error in automation round:", e);
      throw e;
    } finally {
      this.statusManager.setMessage("Automation agent stopped.", false);
    }
  }

  public async runOnce(): Promise<void> {
    const forum = await this.operator.getProgramService().getForum();
    console.log("Forum: ", forum);
    this.statusManager.setMessage(
      `Working on a round ${Number(forum.roundStatus.roundNumber)}...`,
      true
    );

    try {
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
      const totalReactionPoints =
        ap.upvoteActionPoints +
        ap.banvoteActionPoints +
        ap.downvoteActionPoints +
        ap.likeActionPoints; // or subdivide into like/downvote/upvote if you want
      if (totalReactionPoints > 0) {
        await this.reactionFlow(ap);
      }

      console.log("Automation round complete.");
    } catch (e) {
      console.error("Error in automation round:", e);
      throw e;
    } finally {
    }
  }

  private async waitOrNewPostCreated(seconds: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let eventReceived = false;
      let unregistered = false;

      const unregister = this.operator
        .getProgramService()
        .waitForEvent((log, unregister) => {
          console.log("New post created");
          unregister();
          unregistered = true;
          eventReceived = true;
        }, "CreatePost");

      let throwError = false;

      for (let i = 0; i < seconds; i++) {
        if (this.getCancellationToken().isCancelled) {
          throwError = true;
          break;
        }
        if (eventReceived) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // wait for 3 seconds to ensure the event is received
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (!unregistered) {
        unregister();
      }

      if (throwError) {
        reject(new Error("Operation cancelled"));
      } else {
        resolve();
      }
    });
  }

  /**
   * Flow: Create a new post by passing some "news or user input" into the LLM
   */
  private async createPostFlow(): Promise<void> {
    // this action holds the status of the action
    // it would act as a notifier for the status of the action
    // so if you do some operation to the action using session, it would be notified to the status manager
    // and the status manager would tell the client to update the status of the action
    const action = this.statusManager.initializeAction("createPost");

    // Possibly get some external “news” content or user prompt
    // For illustration, we’ll just pretend it’s an empty user prompt:
    const post = await this.agent.createPost(
      action,
      this.getCancellationToken()
    );
    console.log("Creating new post from LLM:", post);

    // this `startSessionAsync` is a mechanism to notify the status manager about the status of the action
    // you can access to `set` methods through the `session` object
    // this forces code writer to keep the sequence of the action properly to be properly notified.
    await action.startSessionAsync(async (session) => {
      session.setProgressIndeterminate();
      session.setMessage("Fetching user data... 🔍");
      const user = await this.operator.getUser();

      session.setMessage("Uploading post to the storage... 📂", "running");
      const contentUri = await this.storage.put(post.content);
      session.setMessage("Post uploaded to the storage.", "success");

      session.setMessage("Sending post to Chain... 🔗", "running");
      const sig = await this.operator.getProgramService().createPost(
        user.nftMint,
        contentUri,
        "general" // TODO: use the category from the LLM
      );
      session.setMessage("Post created on chain. 🔗", "success");
      console.log("Created post (sig):", sig);

      session.setTargetContent(post.content, post.postId, "post created");
    });

    // We set action's status to "closed" when the flow is complete
    // But as you can see, we may also set it to "error" if something goes wrong and keep the action open
    // This way, you can see the status of the action in the UI and take action if needed
    // In the next round, the status would be reopened and the flow would be executed again
    // So that it would be updated anyway
    action.close();
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
    const action = this.statusManager.initializeAction("commentFlow");

    await action.startSessionAsync(async (session) => {
      session.setProgressIndeterminate();
      session.setMessage("Fetching posts... 📖");
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

      session.setMessage("Selecting posts to read... 📖");
      const selected = await this.agent.selectPostsToRead(
        session,
        postSummaries,
        this.config.maxPostsToRead,
        this.getCancellationToken()
      );

      session.setMessage("Favorite posts selected...");

      // 3) For each chosen post, fetch comments (up to 100).
      session.setMessage("Reading posts... 📖");
      session.setProgress(0, selected.length);
      let idx = 0;
      for (const choice of selected) {
        idx++;
        session.setProgress(idx, selected.length);
        if (ap.commentActionPoints <= 0) {
          session.setMessage("No more comment action points left. Stopping...");
          console.log("No more comment points left");
          break;
        }
        console.log(`CommentFlow: reading post: ${choice.postId}`);

        // fetch full post data
        session.setMessage("Reading a post... 📖 " + choice.postId);
        const fullPost = await this.indexer.getPost(choice.postId);
        session.setTargetContent(fullPost?.content || "", choice.postId);
        console.log("fullPost", fullPost);
        if (!fullPost) {
          session.setMessage("Post not found. Skipping...");
          continue;
        }

        session.setMessage(
          "Reading comments from the post... " + choice.postId
        );
        const rawComments = await this.indexer.getComments({
          target: choice.postId,
          order: "asc", // maybe ascending so we can slice up
          limit: 500, // fetch a big chunk, then we'll do our own slicing
        });
        // slice it according to the logic in your note:
        // e.g. if commentCount < 100 => use all
        // else => first 50 (context) + last 50 (primary) + maybe top by “score” if you had it
        session.setMessage(
          "Selecting comments from the post... " + choice.postId
        );
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
        session.setMessage("Writing a new comment... 💬");
        const newComment = await this.agent.createComment(
          session,
          iPost,
          existingComments,
          this.getCancellationToken()
        );
        session.setMessage("Comment written! Posting to chain... 🔗");
        console.log("New LLM comment:", newComment);

        // 5) post on chain
        const user = await this.operator.getUser();
        const sig = await this.operator.getProgramService().addComment(
          user.nftMint,
          fullPost.post_sequence_id, // or however your chain code expects the post ID
          new PublicKey(fullPost.post_author_pda),
          await this.storage.put(newComment.content)
        );
        session.setMessage("Comment posted! sig:" + sig);
        console.log("Added comment (sig): ", sig);

        // consume 1 comment point
        ap.commentActionPoints -= 1;
      }
    });

    action.close();
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
  private async reactionFlow(ap: IActionPoint) {
    const action = this.statusManager.initializeAction("reactionFlow");

    await action.startSessionAsync(async (session) => {
      session.setProgressIndeterminate();
      session.setMessage("Fetching posts...");
      // 1) fetch top N posts
      const posts = await this.indexer.getPosts({
        order: "desc",
        limit: this.config.maxPostsFetched,
      });
      const postSummaries = posts.map((p: any) => ({
        postId: p.post_pda,
        title: p.content.slice(0, 80),
      }));
      session.setMessage("Selecting posts to read...");
      const selected = await this.agent.selectPostsToRead(
        session,
        postSummaries,
        this.config.maxPostsToRead,
        this.getCancellationToken()
      );

      session.setMessage("Favorite posts selected...");

      session.setProgress(0, selected.length);
      let idx = 0;

      for (const choice of selected) {
        idx++;
        session.setProgress(idx, selected.length);
        const totalReactionPoints =
          ap.upvoteActionPoints +
          ap.banvoteActionPoints +
          ap.downvoteActionPoints +
          ap.likeActionPoints; // or subdivide into like/downvote/upvote if you want

        if (totalReactionPoints <= 0) {
          session.setMessage(
            "No reaction points left, stopping reaction flow."
          );
          console.log("No reaction points left, stopping reaction flow.");
          break;
        }
        console.log(`ReactionFlow: reading post: ${choice.postId}`);
        // fetch full post
        session.setMessage("Reading a post... " + choice.postId);
        const fullPost = await this.indexer.getPost(choice.postId);
        session.setTargetContent(fullPost?.content || "", choice.postId);
        if (!fullPost) continue;

        // fetch & slice comments
        session.setMessage(
          "Reading comments from the post... " + choice.postId
        );
        const rawComments = await this.indexer.getComments({
          target: choice.postId,
          order: "asc",
          limit: 500,
        });
        if (rawComments.length === 0) {
          console.log("No comments found, skipping post:", choice.postId);
          session.setMessage(
            "No comments found, skipping post:" + choice.postId
          );
          continue;
        }
        session.setMessage("Selecting comments from the post...");
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
          session.setMessage(
            "No reaction requests found, skipping post:" + choice.postId
          );
          continue;
        }

        // 4) LLM suggests a reaction for each
        session.setMessage("Writing reactions... 💬");
        const preferred = ["like", "upvote", "downvote", "banvote"];
        let rawReactions = await this.agent.generateReactions(
          session,
          reactionRequests,
          preferred,
          this.getCancellationToken()
        );

        if (rawReactions.length === 0) {
          console.log("No reactions found, skipping post:", choice.postId);
          session.setMessage(
            "Hmm, nothing interesting found in this post. Skipping..."
          );
          continue;
        }

        session.setMessage("Prioritizing reactions... 🔍");
        // 5) LLM prioritizes top-K
        // If we have e.g. 10 reaction points left, we pick top 10 from the LLM’s scoring
        rawReactions = await this.agent.prioritizeReactions(
          session,
          rawReactions,
          this.getCancellationToken()
        );

        if (rawReactions.length === 0) {
          console.log(
            "No reactions found after prioritization, skipping post:",
            choice.postId
          );
          session.setMessage(
            "Hmm, nothing interesting found in this post. Skipping..." +
              choice.postId
          );
          continue;
        }

        let rawReactionsIdx = 0;
        session.setProgress(rawReactionsIdx, rawReactions.length);

        // 6) post on chain
        const user = await this.operator.getUser();
        for (const r of rawReactions) {
          rawReactionsIdx++;
          session.setProgress(rawReactionsIdx, rawReactions.length);
          if (r.reactionType === "no-interest") continue;

          // check action points
          const reactionType = r.reactionType;
          if (reactionType === "upvote" && ap.upvoteActionPoints <= 0) {
            continue;
          } else if (
            reactionType === "downvote" &&
            ap.downvoteActionPoints <= 0
          ) {
            continue;
          } else if (reactionType === "like" && ap.likeActionPoints <= 0) {
            continue;
          } else if (
            reactionType === "banvote" &&
            ap.banvoteActionPoints <= 0
          ) {
            continue;
          }

          console.log(
            `Reacting to comment ${r.targetCommentId} with ${r.reactionType}`
          );
          session.setMessage(
            `Reacting to comment ${r.targetCommentId} with ${r.reactionType} 💬`
          );
          const [userPdaStr, seqIdStr] = r.targetCommentId.split(":");
          if (!userPdaStr || !seqIdStr) {
            console.log(
              "Invalid targetCommentId, skipping:",
              r.targetCommentId
            );
            session.setMessage(
              "Invalid targetCommentId, skipping:" + r.targetCommentId
            );
            continue;
          }
          const seqId = parseInt(seqIdStr, 10);

          session.setMessage("Sending reaction to chain... 🔗");

          const sig = await this.operator
            .getProgramService()
            .addReaction(
              user.nftMint,
              fullPost.post_sequence_id,
              seqId,
              new PublicKey(fullPost.post_author_pda),
              r.reactionType as "upvote" | "downvote" | "like" | "banvote"
            );
          session.setMessage("Reaction sent! sig:" + sig);
          // consume 1 reaction point
          if (r.reactionType === "upvote") {
            ap.upvoteActionPoints -= 1;
          } else if (r.reactionType === "downvote") {
            ap.downvoteActionPoints -= 1;
          } else if (r.reactionType === "like") {
            ap.likeActionPoints -= 1;
          } else if (r.reactionType === "banvote") {
            ap.banvoteActionPoints -= 1;
          }
        }
      }
    });

    action.close();
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
    if (!this.operator.isUserSelected()) {
      throw new Error("User not selected");
    }
    if (!this.operator.getProgramService()) {
      throw new Error("ProgramService not initialized for operator.");
    }
  }
}
