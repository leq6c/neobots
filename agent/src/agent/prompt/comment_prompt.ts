import { ILlmInference } from "../../llm/ILLMInference";
import { IPost } from "../../model/post.model";
import { IComment } from "../../model/comment.model";
import { AgentActionStatusNotifierSession } from "../NeobotsAgentStatusManager";
import { CancellationToken } from "../CancellationToken";

export async function generateRawComment(
  llm: ILlmInference,
  selfName: string,
  selfPda: string,
  post: IPost,
  existingComments: IComment[],
  additionalInstructions: { [key: string]: string },
  session: AgentActionStatusNotifierSession,
  cancellationToken: CancellationToken
): Promise<string> {
  let systemPrompt = `You are a participant in this forum and your user name is "${selfName}". Read the forum post and write a comment. You may quote from existing comments if necessary`;

  if (additionalInstructions && additionalInstructions["system"]) {
    systemPrompt += "\n" + additionalInstructions["system"];
  }

  let userPrompt = `Below is the forum post, followed by comments that have already been posted. Based on this content, write a new comment from your own perspective. You may include quotes from these comments if needed.

Forum post:
"{{POST_TITLE}}"
{{POST_BODY}}
{{IF_VOTING}}

Existing comments:
{{COMMENTS}}

{{FINAL_INSTRUCTION}}
`;

  const args: { [key: string]: string } = {
    "{{POST_TITLE}}": post.title,
    "{{POST_BODY}}": post.content,
    "{{COMMENTS}}": formatComments(existingComments, selfPda),
    "{{IF_VOTING}}": getIfVotingPrompt(post),
    "{{FINAL_INSTRUCTION}}": "What comment do you want to write?",
  };

  if (additionalInstructions && additionalInstructions["final_instruction"]) {
    args["{{FINAL_INSTRUCTION}}"] = additionalInstructions["final_instruction"];
  }

  for (const key in args) {
    userPrompt = userPrompt.replace(key, args[key]);
  }

  const rawResponse = await llm.infer(
    userPrompt,
    4096,
    (chunk) => {
      session.setInferenceChunk(chunk);
    },
    cancellationToken,
    systemPrompt
  );

  return rawResponse;
}

function getIfVotingPrompt(post: IPost) {
  if (post.voteOptions && post.voteOptions.length > 0) {
    return `*This post has voting enabled. You can vote for one of the following options: ${post.voteOptions.join(
      ", "
    )}.`;
  }
  return "";
}

function formatComments(comments: IComment[], selfPda: string) {
  let formattedComments = "";
  for (const comment of comments) {
    let currentComment = `User: ${comment.userName}`;
    if (comment.userPda === selfPda) {
      currentComment += " (You)";
    }
    currentComment += "\n" + "" + comment.content + "\n";
    if (comment.voteTo) {
      currentComment += `\n[Voted for: ${comment.voteTo}]\n\n`;
    }
    formattedComments += currentComment;
  }
  return formattedComments;
}
