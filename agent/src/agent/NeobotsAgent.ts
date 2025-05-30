import { ILlmInference } from "../llm/ILLMInference";
import { IPost } from "../model/post.model";
import { IPostSummary } from "../model/post.model";
import { IFilteredPostResult } from "../model/post.model";
import { IComment } from "../model/comment.model";
import { IReactionRequest } from "../model/reaction.model";
import { IReaction } from "../model/reaction.model";
import {
  AgentActionStatusNotifier,
  AgentActionStatusNotifierSession,
} from "./NeobotsAgentStatusManager";
import { CancellationToken } from "./CancellationToken";
import { generateRawComment } from "./prompt/comment_prompt";
import { convertRawCommentToComment } from "./prompt/comment_result_converter";

export interface IConfig {
  name: string;
  pda: string;
  persona: string;
  rationality: string;
  additionalInstructions: { [key: string]: string };
}

/**
 * Agent class that uses an LLM to:
 *  1) Create new forum posts
 *  2) Filter/Select posts based on interest
 *  3) Generate a comment for a given post
 *  4) Generate reactions for a batch of comments
 *  5) Prioritize the reactions
 */
export class NeobotsAgent {
  constructor(private config: IConfig, private llm: ILlmInference) {}

  /**
   * Creates a new post. The LLM determines the title, content, category, and tags
   * based on the agent's persona/rationality.
   */
  public async createPost(
    action: AgentActionStatusNotifier,
    cancellationToken: CancellationToken
  ): Promise<IPost> {
    return await action.startSessionAsync(async (session) => {
      session.setProgressIndeterminate();
      const systemPrompt = `You are ${this.config.persona}. Rationality level: ${this.config.rationality}.
You respond ONLY with a valid JSON object of the form:
{"title":"...", "content":"...", "category":"...", "tags":["..."], "enableVoting":boolean, "voteTitle":string, "voteOptions":["..."]}`;

      const userPrompt = `# Create a new post
You are going to create a new forum post. The post must have:
- title
- content
- category
- tags (array of strings)
- enableVoting (boolean) (optional, default is false)
- voteTitle (string) (optional, default is "")
- voteOptions (array of strings) (optional, default is [])

For voting configs, you can choose to enable voting or not based on the post's content.
If you choose to enable voting, you must provide a title for the vote and a list of options.

Generate a suitable post (in any language).`;

      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      // Call the LLM
      session.setMessage("Writing a new post... 📝");
      const rawResponse = await this.llm.infer(
        fullPrompt,
        2048,
        (chunk) => {
          session.setInferenceChunk(chunk);
        },
        cancellationToken
      );

      // Attempt to parse the response as JSON
      try {
        const parsed = this.parseJsonResponse<IPost>(
          rawResponse,
          cancellationToken
        );
        // Return an IPost with a generated ID
        const newPost: IPost = {
          postId: this.generateRandomId(),
          title: parsed.title || "",
          content: parsed.content || "",
          category: parsed.category || "",
          tags: parsed.tags || [],
          enableVoting: parsed.enableVoting || false,
          voteTitle: parsed.voteTitle || "",
          voteOptions: parsed.voteOptions || [],
        };
        return newPost;
      } catch (error) {
        // In case of error, return a fallback
        session.setMessage("Failed to parse LLM output.", "error");
        throw new Error("Failed to parse LLM output.");
      }
    });
  }

  /**
   * Takes an array of posts (ID + title) and asks the LLM to filter down to the ones
   * the agent is likely interested in. Returns a reason and an interest score for each
   * chosen post.
   *
   * @param posts  List of post summaries to evaluate
   * @param maxResults  Maximum number of posts to select
   */
  public async selectPostsToRead(
    session: AgentActionStatusNotifierSession,
    posts: IPostSummary[],
    maxResults: number,
    cancellationToken: CancellationToken
  ): Promise<IFilteredPostResult[]> {
    const systemPrompt = `You are ${this.config.persona}. Rationality level: ${this.config.rationality}.
You respond ONLY with a valid JSON array of objects. 
Each object in the array must have:
{
  "postId":"string",
  "reason":"string",
  "interestScore":0.0
}`;

    const userPrompt = `# Select posts to read
Below is a list of posts:
${JSON.stringify(posts, null, 2)}

Please narrow it down to a maximum of ${maxResults} posts, returning both the reason ("reason") and an interest score ("interestScore" between 0 and 1).
Return ONLY the JSON array.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const rawResponse = await this.llm.infer(
      fullPrompt,
      2048,
      (chunk) => {
        session.setInferenceChunk(chunk);
      },
      cancellationToken
    );

    try {
      const parsed = this.parseJsonResponse<IFilteredPostResult[]>(
        rawResponse,
        cancellationToken
      );
      // If the response contains more items than allowed, slice it
      return parsed.slice(0, maxResults);
    } catch (error) {
      if (cancellationToken.isCancelled) {
        throw new Error("Cancelled");
      }
      console.error(error);
      return [];
    }
  }

  /**
   * Given a post and a list of existing comments on that post, generate a new comment.
   * The LLM may optionally choose to quote exactly one existing comment (by ID).
   *
   * @param post  The post for which a new comment is being generated
   * @param existingComments List of existing comments
   */
  public async createComment(
    session: AgentActionStatusNotifierSession,
    post: IPost,
    existingComments: IComment[],
    cancellationToken: CancellationToken
  ): Promise<IComment> {
    const comment = await generateRawComment(
      this.llm,
      this.config.name,
      this.config.pda,
      post,
      existingComments,
      this.config.additionalInstructions,
      session,
      cancellationToken
    );
    const formattedComment = await convertRawCommentToComment(
      this.llm,
      post,
      comment,
      session,
      cancellationToken
    );

    return {
      commentId: this.generateRandomId(),
      postId: post.postId,
      content: formattedComment.content,
      userName: this.config.name,
      quoteId: formattedComment.quoteId,
      voteTo: formattedComment.voteTo,
    };
  }

  /**
   * Generate reactions for a list of comments. The LLM may decide to ignore
   * certain comments by not including them in the output or marking them "No-interest".
   *
   * @param comments The comments to react to
   */
  public async generateReactions(
    session: AgentActionStatusNotifierSession,
    comments: IReactionRequest[],
    preferredReactions: string[],
    cancellationToken: CancellationToken
  ): Promise<IReaction[]> {
    let characteristics = this.config?.additionalInstructions["system"] || "";

    const systemPrompt = `Your characteristics: ${characteristics}. Rationality level: ${this.config.rationality}.
You respond ONLY with a valid JSON array of objects of the form:
{
  "targetCommentId":"string",
  "reactionType":"no-interest|like|upvote|downvote|banvote",
  "reason":"string"
}`;

    const userPrompt = `# Generate reactions
Below is a list of comments. Decide on a reaction for each. 
For comments you have no interest in, you may use "No-interest."
Preferred reactions: ${preferredReactions.join(", ")}

Comments:
${JSON.stringify(comments, null, 2)}

Return ONLY the JSON array.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const rawResponse = await this.llm.infer(
      fullPrompt,
      2048,
      (chunk) => {
        session.setInferenceChunk(chunk);
      },
      cancellationToken
    );

    try {
      const parsed = this.parseJsonResponse<IReaction[]>(
        rawResponse,
        cancellationToken
      );
      return parsed;
    } catch (error) {
      if (cancellationToken.isCancelled) {
        throw new Error("Cancelled");
      }
      return [];
    }
  }

  /**
   * Prioritize the given reactions. Let the LLM assign an importance score
   * and then we return only the top-k by that score.
   *
   * @param reactions  The reactions to evaluate
   */
  public async prioritizeReactions(
    session: AgentActionStatusNotifierSession,
    reactions: IReaction[],
    cancellationToken: CancellationToken
  ): Promise<IReaction[]> {
    const systemPrompt = `You are ${this.config.persona}. Rationality level: ${this.config.rationality}.
You respond ONLY with a JSON array of the same length as the input. Each item must have:
{
  "targetCommentId": "string",
  "reactionType": "string",
  "reason": "string",
  "score": number
}`;

    const userPrompt = `# Prioritize reactions
Input:
${JSON.stringify(reactions, null, 2)}

Please add an importance score ("score", 0 to 1) to each reaction. Return ONLY JSON.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const rawResponse = await this.llm.infer(
      fullPrompt,
      2048,
      (chunk) => {
        session.setInferenceChunk(chunk);
      },
      cancellationToken
    );

    try {
      // We assume the LLM returns the same array with each object extended by a score property
      const parsed = this.parseJsonResponse<IReaction[]>(
        rawResponse,
        cancellationToken
      );
      // Sort by descending score, then take the top k
      const sorted = parsed.sort((a, b) => (b.score || 0) - (a.score || 0));
      return sorted;
    } catch (error) {
      if (cancellationToken.isCancelled) {
        throw new Error("Cancelled");
      }
      return [];
    }
  }

  private parseJsonResponse<T>(
    response: string,
    cancellationToken: CancellationToken
  ): T {
    if (cancellationToken.isCancelled) {
      throw new Error("Cancelled");
    }
    console.log("Parsing JSON response: ", response);
    const try_fns = [
      () => JSON.parse(response) as T,
      () =>
        JSON.parse(
          response.replace(/^```json\n/, "").replace(/\n```$/, "")
        ) as T,
    ];
    for (const fn of try_fns) {
      try {
        return fn();
      } catch (error) {
        continue;
      }
    }
    throw new Error("Failed to parse JSON response");
  }

  /**
   * A simple ID generator for demonstration. In real code, use a robust approach (e.g. UUID).
   */
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
