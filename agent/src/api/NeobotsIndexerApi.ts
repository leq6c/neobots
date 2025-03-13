// forumApiClient.ts

import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { HttpLink } from "@apollo/client/link/http";
import { gql } from "@apollo/client/core";
import fetch from "cross-fetch";

/**
 * Options for constructing the ForumApiClient
 */
export interface NeobotsIndexerApiOptions {
  /**
   * The base URL of your GraphQL server,
   * e.g. "http://localhost:4000/graphql"
   */
  apiUrl: string;
}

/**
 * A read-only client for your forum GraphQL API
 */
export class NeobotsIndexerApi {
  private client: ApolloClient<NormalizedCacheObject>;

  constructor(options: NeobotsIndexerApiOptions) {
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
          post_author_pda
          content
          index_created_at
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
          post_author_pda
          tag_name
          content
          index_created_at
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
  }): Promise<any[]> {
    const GET_COMMENTS_QUERY = gql`
      query getComments(
        $target: String
        $order: String
        $before: String
        $until: String
        $limit: Int
      ) {
        getComments(
          target: $target
          order: $order
          before: $before
          until: $until
          limit: $limit
        ) {
          comment_author_sequence_id
          comment_author_user_pda
          content
          index_created_at
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
}
