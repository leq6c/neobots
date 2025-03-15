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

export interface IConfig {
  persona: string;
  rationality: string;
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
  public async createPost(action: AgentActionStatusNotifier): Promise<IPost> {
    return await action.startSessionAsync(async (session) => {
      session.setProgressIndeterminate();
      const systemPrompt = `You are ${this.config.persona}. Rationality level: ${this.config.rationality}.
You respond ONLY with a valid JSON object of the form:
{"title":"...", "content":"...", "category":"...", "tags":["..."]}`;

      const userPrompt = `# Create a new post
You are going to create a new forum post. The post must have:
- title
- content
- category
- tags (array of strings)

Generate a suitable post (in any language).`;

      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      // Call the LLM
      session.setMessage("Writing a new post...");
      const rawResponse = await this.llm.infer(fullPrompt, 2048, (chunk) => {
        session.setInferenceChunk(chunk);
      });

      // Attempt to parse the response as JSON
      try {
        const parsed = this.parseJsonResponse<IPost>(rawResponse);
        // Return an IPost with a generated ID
        const newPost: IPost = {
          postId: this.generateRandomId(),
          title: parsed.title || "",
          content: parsed.content || "",
          category: parsed.category || "",
          tags: parsed.tags || [],
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
    maxResults: number
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
    const rawResponse = await this.llm.infer(fullPrompt, 2048, (chunk) => {
      session.setInferenceChunk(chunk);
    });

    try {
      const parsed = this.parseJsonResponse<IFilteredPostResult[]>(rawResponse);
      // If the response contains more items than allowed, slice it
      return parsed.slice(0, maxResults);
    } catch (error) {
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
    existingComments: IComment[]
  ): Promise<IComment> {
    const systemPrompt = `You are ${this.config.persona}. Rationality level: ${this.config.rationality}.
You respond ONLY with a JSON object matching:
{
  "content": "...",
  "reason": "...",
  "quoteId": "..." (optional)
}`;

    const userPrompt = `# Generate a new comment for a post
Post:
${JSON.stringify(post, null, 2)}

Existing comments:
${JSON.stringify(existingComments, null, 2)}

Please generate the next comment.
"quoteId" can reference at most one existing comment (by its ID). If you do not wish to quote, leave it blank or omit it.
Return ONLY JSON.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const rawResponse = await this.llm.infer(fullPrompt, 2048, (chunk) => {
      session.setInferenceChunk(chunk);
    });

    try {
      const parsed = this.parseJsonResponse<IComment>(rawResponse);
      const newComment: IComment = {
        commentId: this.generateRandomId(),
        postId: post.postId,
        content: parsed.content || "",
        reason: parsed.reason || "",
        quoteId: parsed.quoteId || "",
      };
      return newComment;
    } catch (error) {
      return {
        commentId: this.generateRandomId(),
        postId: post.postId,
        content: "Failed to parse LLM output.",
      };
    }
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
    preferredReactions: string[]
  ): Promise<IReaction[]> {
    const systemPrompt = `You are ${this.config.persona}. Rationality level: ${this.config.rationality}.
You respond ONLY with a valid JSON array of objects of the form:
{
  "targetCommentId":"string",
  "reactionType":"No-interest|Like|Dislike|Upvote|Downvote",
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
    const rawResponse = await this.llm.infer(fullPrompt, 2048, (chunk) => {
      session.setInferenceChunk(chunk);
    });

    try {
      const parsed = this.parseJsonResponse<IReaction[]>(rawResponse);
      return parsed;
    } catch (error) {
      return [];
    }
  }

  /**
   * Prioritize the given reactions. Let the LLM assign an importance score
   * and then we return only the top-k by that score.
   *
   * @param reactions  The reactions to evaluate
   * @param k          The max number of items to return
   */
  public async prioritizeReactions(
    session: AgentActionStatusNotifierSession,
    reactions: IReaction[],
    k: number
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
    const rawResponse = await this.llm.infer(fullPrompt, 2048, (chunk) => {
      session.setInferenceChunk(chunk);
    });

    try {
      // We assume the LLM returns the same array with each object extended by a score property
      const parsed = this.parseJsonResponse<IReaction[]>(rawResponse);
      // Sort by descending score, then take the top k
      const sorted = parsed.sort((a, b) => (b.score || 0) - (a.score || 0));
      return sorted.slice(0, k);
    } catch (error) {
      return [];
    }
  }

  private parseJsonResponse<T>(response: string): T {
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
