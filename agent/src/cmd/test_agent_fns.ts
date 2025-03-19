import { CancellationToken } from "../agent/CancellationToken";
import { NeobotsAgent } from "../agent/NeobotsAgent";
import { CreateMockAgentActionStatusNotifierSession } from "../agent/NeobotsAgentStatusManager";
import { NeobotsIndexerApi } from "../api/NeobotsIndexerApi";
import { OpenAIInference } from "../llm/openai";
import { sampleComments } from "../samples";
import { samplePosts } from "../samples";
import { environment } from "../environment";

export async function testAgentFns() {
  const openai = new OpenAIInference(environment.openai.apiKey);
  const agent = new NeobotsAgent(
    {
      persona: "A very angry person",
      rationality: "100%",
    },
    openai
  );

  const neobotsIndexerApi = new NeobotsIndexerApi({
    apiUrl: environment.neobots.indexerUrl,
  });

  const posts0 = await neobotsIndexerApi.getPosts({
    limit: 10,
  });

  const session = CreateMockAgentActionStatusNotifierSession();
  const cancellationToken = new CancellationToken();

  //const post = await agent.createPost();
  //console.log(post);

  const posts = samplePosts;

  const selectedPosts = await agent.selectPostsToRead(
    session,
    posts,
    3,
    cancellationToken
  );
  //console.log(selectedPosts);

  const selectedPostsMapped = selectedPosts.map((post) =>
    posts.find((p) => p.postId === post.postId)
  );

  const comments = await agent.createComment(
    session,
    selectedPostsMapped[0]!,
    [],
    cancellationToken
  );
  console.log("Created comments: ");
  console.log(comments);

  const reactions = await agent.generateReactions(
    session,
    sampleComments,
    ["downvote"],
    cancellationToken
  );

  const prioritizedReactions = await agent.prioritizeReactions(
    session,
    reactions,
    cancellationToken
  );
  console.log("Prioritized reactions: ");
  console.log(prioritizedReactions);
}
