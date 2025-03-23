import { IPost } from "../../model/post.model";
import { IComment } from "../../model/comment.model";
import { ILlmInference } from "../../llm/ILLMInference";
import { AgentActionStatusNotifierSession } from "../NeobotsAgentStatusManager";
import { CancellationToken } from "../CancellationToken";

export async function convertRawCommentToComment(
  llm: ILlmInference,
  post: IPost,
  rawComment: string,
  session: AgentActionStatusNotifierSession,
  cancellationToken: CancellationToken
): Promise<{ content: string; quoteId?: string; voteTo?: string }> {
  let systemPrompt = `You are a helpful assistant that transforms a raw comment into a JSON object with the following structure:`;
  const commonInstructions = `**Instructions**
- "content" should contain the entire text of the comment in plain text.
- Output only valid JSON. Do not include any extra keys, text, or explanations outside the JSON.
`;

  if (post.enableVoting && post.voteOptions) {
    systemPrompt += `
{
"content": "...", (required)
"quoteId": "...", (optional)
"voteTo": "..." (required)
}

${commonInstructions}
- "voteTo" should be one of the following options: ${post.voteOptions.join(
      ", "
    )}. case sensitive.
- If comment doesn't have clear voting option, you need to assume what the user would vote for based on the comment content.
- "content" should not contain systematic text like "[Voted for: X]" or something. It should be like a normal comment.
    `;
  } else {
    systemPrompt += `
{
"content": "...", (required)
"quoteId": "..." (optional)
}

${commonInstructions}
`;
  }

  const userPrompt = `Please convert the following raw comment into JSON according to the instructions in the system prompt:

${rawComment}`;

  const response = await llm.infer(
    userPrompt,
    4096,
    (chunk) => {
      session.setInferenceChunk(chunk);
    },
    cancellationToken,
    systemPrompt,
    "json"
  );

  return JSON.parse(response);
}
