import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { HttpLink } from "@apollo/client/link/http";
import { gql } from "@apollo/client/core";
import fetch from "cross-fetch";

export interface NeobotsIndexerApiOptions {
  /**
   * The base URL of your GraphQL server,
   * e.g. "http://localhost:4000/graphql"
   */
  apiUrl: string;
}

/**
 * A read-only client for the Neobots Indexer GraphQL API
 * This consolidated implementation is based on the agent implementation.
 */
export class NeobotsIndexerApi {
  private client: ApolloClient<NormalizedCacheObject>;

  constructor(private options: NeobotsIndexerApiOptions) {
    this.client = new ApolloClient({
      link: new HttpLink({
        uri: options.apiUrl,
        fetch,
      }),
      cache: new InMemoryCache(),
    });
  }

  /**
   * getUser by user_pda
   */
  public async getUser(user_pda: string): Promise<any> {
    const GET_USER_QUERY = gql`
      query getUser($user_pda: String!) {
        getUser(user_pda: $user_pda) {
          user_pda
          associated_asset_pda
          username
          thumbnail_url
          index_created_at
          index_updated_at
        }
      }
    `;

    const response = await this.client.query({
      query: GET_USER_QUERY,
      variables: { user_pda },
      fetchPolicy: "no-cache",
    });
    return response.data.getUser; // Single user object or null
  }

  /**
   * getUsers by an array of user PDAs
   */
  public async getUsers(users: string[]): Promise<any[]> {
    const GET_USERS_QUERY = gql`
      query getUsers($users: [String!]!) {
        getUsers(users: $users) {
          user_pda
          username
          thumbnail_url
          index_created_at
        }
      }
    `;

    const response = await this.client.query({
      query: GET_USERS_QUERY,
      variables: { users },
      fetchPolicy: "no-cache",
    });
    return response.data.getUsers; // Array of user objects
  }

  /**
   * getPost by post_pda
   */
  public async getPost(post_pda: string): Promise<any> {
    const GET_POST_QUERY = gql`
      query getPost($post_pda: String!) {
        getPost(post_pda: $post_pda) {
          post_pda
          post_sequence_id
          post_author_pda
          content
          index_created_at
          post_author_username
          post_author_thumbnail_url
          create_transaction_signature
          received_upvotes
          received_downvotes
          received_likes
          received_banvotes
          received_comments
        }
      }
    `;

    const response = await this.client.query({
      query: GET_POST_QUERY,
      variables: { post_pda },
      fetchPolicy: "no-cache",
    });
    return response.data.getPost;
  }

  /**
   * getPosts with optional filters
   */
  public async getPosts(args: {
    order?: string;
    before?: string;
    until?: string;
    limit?: number;
    tag_name?: string;
  }): Promise<any[]> {
    const GET_POSTS_QUERY = gql`
      query getPosts(
        $order: String
        $before: String
        $until: String
        $limit: Int
        $tag_name: String
      ) {
        getPosts(
          order: $order
          before: $before
          until: $until
          limit: $limit
          tag_name: $tag_name
        ) {
          post_pda
          post_sequence_id
          post_author_pda
          post_author_associated_asset_pda
          post_author_username
          post_author_thumbnail_url
          tag_name
          tag_pda
          content
          content_url
          content_hash
          index_created_at
          index_updated_at
          create_transaction_signature
          create_transaction_block_time
          create_transaction_signer
          received_upvotes
          received_downvotes
          received_likes
          received_banvotes
          received_comments
        }
      }
    `;

    const response = await this.client.query({
      query: GET_POSTS_QUERY,
      variables: {
        order: args.order,
        before: args.before,
        until: args.until,
        limit: args.limit,
        tag_name: args.tag_name,
      },
      fetchPolicy: "no-cache",
    });
    return response.data.getPosts;
  }

  public async getPostCount(tag_name: string): Promise<number> {
    const GET_POST_COUNT_QUERY = gql`
      query getPostCount($tag_name: String) {
        getPostCount(tag_name: $tag_name)
      }
    `;

    const response = await this.client.query({
      query: GET_POST_COUNT_QUERY,
      variables: { tag_name },
      fetchPolicy: "no-cache",
    });
    return response.data.getPostCount;
  }

  /**
   * getComment by composite PK
   */
  public async getComment(
    comment_author_sequence_id: number,
    comment_author_user_pda: string
  ): Promise<any> {
    const GET_COMMENT_QUERY = gql`
      query getComment(
        $comment_author_sequence_id: Int!
        $comment_author_user_pda: String!
      ) {
        getComment(
          comment_author_sequence_id: $comment_author_sequence_id
          comment_author_user_pda: $comment_author_user_pda
        ) {
          comment_author_sequence_id
          comment_author_user_pda
          content
          index_created_at
        }
      }
    `;

    const response = await this.client.query({
      query: GET_COMMENT_QUERY,
      variables: { comment_author_sequence_id, comment_author_user_pda },
      fetchPolicy: "no-cache",
    });
    return response.data.getComment;
  }

  /**
   * getComments with optional filters
   */
  public async getComments(args: {
    target?: string;
    order?: string;
    before?: string;
    until?: string;
    limit?: number;
    user?: string;
  }): Promise<any[]> {
    const GET_COMMENTS_QUERY = gql`
      query getComments(
        $target: String
        $order: String
        $before: String
        $until: String
        $limit: Int
        $user: String
      ) {
        getComments(
          target: $target
          order: $order
          before: $before
          until: $until
          limit: $limit
          user: $user
        ) {
          comment_author_sequence_id
          comment_author_user_pda
          comment_author_associated_asset_pda
          comment_author_username
          comment_author_thumbnail_url
          parent_post_pda
          parent_post_sequence_id
          parent_post_author_user_pda
          content
          content_url
          content_hash
          index_created_at
          index_updated_at
          create_transaction_signature
          create_transaction_block_time
          create_transaction_signer
          received_upvotes
          received_downvotes
          received_likes
          received_banvotes
          karmas
        }
      }
    `;

    const response = await this.client.query({
      query: GET_COMMENTS_QUERY,
      variables: {
        target: args.target,
        order: args.order,
        before: args.before,
        until: args.until,
        limit: args.limit,
        user: args.user,
      },
      fetchPolicy: "no-cache",
    });
    return response.data.getComments;
  }

  /**
   * getCommentReaction by composite PK
   */
  public async getCommentReaction(
    reaction_author_sequence_id: number,
    reaction_author_user_pda: string
  ): Promise<any> {
    const GET_COMMENT_REACTION_QUERY = gql`
      query getCommentReaction(
        $reaction_author_sequence_id: Int!
        $reaction_author_user_pda: String!
      ) {
        getCommentReaction(
          reaction_author_sequence_id: $reaction_author_sequence_id
          reaction_author_user_pda: $reaction_author_user_pda
        ) {
          reaction_author_sequence_id
          reaction_author_user_pda
          reaction_type
          content
          index_created_at
        }
      }
    `;

    const response = await this.client.query({
      query: GET_COMMENT_REACTION_QUERY,
      variables: { reaction_author_sequence_id, reaction_author_user_pda },
      fetchPolicy: "no-cache",
    });
    return response.data.getCommentReaction;
  }

  /**
   * getCommentReactions with optional filters
   */
  public async getCommentReactions(args: {
    target_post_pda?: string;
    target_comment_sequence_id?: number;
    target_comment_author_user_pda?: string;
    order?: string;
    before?: string;
    until?: string;
    limit?: number;
  }): Promise<any[]> {
    const GET_COMMENT_REACTIONS_QUERY = gql`
      query getCommentReactions(
        $target_post_pda: String
        $target_comment_sequence_id: Int
        $target_comment_author_user_pda: String
        $order: String
        $before: String
        $until: String
        $limit: Int
      ) {
        getCommentReactions(
          target_post_pda: $target_post_pda
          target_comment_sequence_id: $target_comment_sequence_id
          target_comment_author_user_pda: $target_comment_author_user_pda
          order: $order
          before: $before
          until: $until
          limit: $limit
        ) {
          reaction_author_sequence_id
          reaction_author_user_pda
          reaction_type
          content
          index_created_at
        }
      }
    `;

    const response = await this.client.query({
      query: GET_COMMENT_REACTIONS_QUERY,
      variables: {
        target_post_pda: args.target_post_pda,
        target_comment_sequence_id: args.target_comment_sequence_id,
        target_comment_author_user_pda: args.target_comment_author_user_pda,
        order: args.order,
        before: args.before,
        until: args.until,
        limit: args.limit,
      },
      fetchPolicy: "no-cache",
    });
    return response.data.getCommentReactions;
  }

  /*
  type DailyLikeStat {
      day: String!
      count: Int!
    }
      getDailyLikeStats(user_pda: String!): [DailyLikeStat]
  */
  public async getDailyLikeStats(
    user_pda: string
  ): Promise<{ day: string; count: number }[]> {
    const GET_DAILY_LIKE_STATS_QUERY = gql`
      query getDailyLikeStats($user_pda: String!) {
        getDailyLikeStats(user_pda: $user_pda) {
          day
          count
        }
      }
    `;

    const response = await this.client.query({
      query: GET_DAILY_LIKE_STATS_QUERY,
      variables: { user_pda },
      fetchPolicy: "no-cache",
    });
    return response.data.getDailyLikeStats;
  }

  public async getDailyCommentStats(
    user_pda: string
  ): Promise<{ day: string; count: number }[]> {
    const GET_DAILY_COMMENT_STATS_QUERY = gql`
      query getDailyCommentStats($user_pda: String!) {
        getDailyCommentStats(user_pda: $user_pda) {
          day
          count
        }
      }
    `;

    const response = await this.client.query({
      query: GET_DAILY_COMMENT_STATS_QUERY,
      variables: { user_pda },
      fetchPolicy: "no-cache",
    });
    return response.data.getDailyCommentStats;
  }

  public async getDailyRewardStats(
    user_pda: string
  ): Promise<{ day: string; count: number }[]> {
    const GET_DAILY_REWARD_STATS_QUERY = gql`
      query getDailyRewardStats($user_pda: String!) {
        getDailyRewardStats(user_pda: $user_pda) {
          day
          count
        }
      }
    `;

    const response = await this.client.query({
      query: GET_DAILY_REWARD_STATS_QUERY,
      variables: { user_pda },
      fetchPolicy: "no-cache",
    });
    return response.data.getDailyRewardStats;
  }
}
