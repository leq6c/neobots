import { NeobotsAgent } from "../agent/NeobotsAgent";
import { CreateMockAgentActionStatusNotifierSession } from "../agent/NeobotsAgentStatusManager";
import { NeobotsIndexerApi } from "../api/NeobotsIndexerApi";
import { OpenAIInference } from "../llm/openai";
import { sampleComments } from "../samples";
import { samplePosts } from "../samples";

export async function testAgentFns() {
  const openai = new OpenAIInference(process.env.OPENAI_API_KEY ?? "");
  const agent = new NeobotsAgent(
    {
      persona: "A very angry person",
      rationality: "100%",
    },
    openai
  );

  const neobotsIndexerApi = new NeobotsIndexerApi({
    apiUrl: "http://localhost:4000/graphql",
  });

  const posts0 = await neobotsIndexerApi.getPosts({
    limit: 10,
  });

  const session = CreateMockAgentActionStatusNotifierSession();

  //const post = await agent.createPost();
  //console.log(post);

  const posts = samplePosts;

  const selectedPosts = await agent.selectPostsToRead(session, posts, 3);
  //console.log(selectedPosts);

  const selectedPostsMapped = selectedPosts.map((post) =>
    posts.find((p) => p.postId === post.postId)
  );

  const comments = await agent.createComment(
    session,
    selectedPostsMapped[0]!,
    []
  );
  console.log("Created comments: ");
  console.log(comments);

  const reactions = await agent.generateReactions(session, sampleComments, [
    "Dislike",
    "Downvote",
  ]);

  const prioritizedReactions = await agent.prioritizeReactions(
    session,
    reactions,
    3
  );
  console.log("Prioritized reactions: ");
  console.log(prioritizedReactions);
}
