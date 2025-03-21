// server.ts

import { ApolloServer, gql } from "apollo-server";
import { Op, Sequelize } from "sequelize";
import { ForumModels } from "../forum/init";
import { getDailyLikeStats } from "../analytics/get_daily_like_stats";
import { getDailyCommentStats } from "../analytics/get_daily_comment_stats";
import { getDailyRewardStats } from "../analytics/get_daily_reward_stats";

interface ServerConfig {
  models: ForumModels; // { User, Post, Comment, CommentReaction }
  port?: number;
  sequelize?: Sequelize;
}

export async function startServer(config: ServerConfig) {
  const { models, sequelize } = config;

  // 2. Define your GraphQL schema
  const typeDefs = gql`
    """
    Daily like statistics
    """
    type DailyLikeStat {
      day: String!
      count: Int!
    }

    """
    Daily comment statistics
    """
    type DailyCommentStat {
      day: String!
      count: Int!
    }

    """
    Daily reward statistics
    """
    type DailyRewardStat {
      day: String!
      count: Int!
    }

    """
    User model
    """
    type User {
      user_pda: String!
      associated_asset_pda: String
      username: String
      thumbnail_url: String
      index_created_at: String
      index_updated_at: String
      create_transaction_signature: String
      create_transaction_block_time: String
      create_transaction_signer: String
    }

    """
    Post model
    """
    type Post {
      post_pda: String!
      post_sequence_id: Int
      post_author_pda: String
      post_author_associated_asset_pda: String
      post_author_username: String
      post_author_thumbnail_url: String
      tag_name: String
      tag_pda: String
      content: String
      content_url: String
      content_hash: String
      index_created_at: String
      index_updated_at: String
      create_transaction_signature: String
      create_transaction_block_time: String
      create_transaction_signer: String
      received_upvotes: Int
      received_downvotes: Int
      received_likes: Int
      received_banvotes: Int
      received_comments: Int
    }

    """
    Comment model
    """
    type Comment {
      comment_author_sequence_id: Int!
      comment_author_user_pda: String!
      comment_author_associated_asset_pda: String
      comment_author_username: String
      comment_author_thumbnail_url: String
      parent_post_pda: String
      parent_post_sequence_id: Int
      parent_post_author_user_pda: String
      content: String
      content_url: String
      content_hash: String
      index_created_at: String
      index_updated_at: String
      create_transaction_signature: String
      create_transaction_block_time: String
      create_transaction_signer: String
      received_upvotes: Int
      received_downvotes: Int
      received_likes: Int
      received_banvotes: Int
      karmas: Int
    }

    """
    CommentReaction model
    (Composite PK: reaction_author_sequence_id + reaction_author_user_pda)
    """
    type CommentReaction {
      reaction_author_sequence_id: Int!
      reaction_author_user_pda: String!
      reaction_author_associated_asset_pda: String
      reaction_author_username: String
      reaction_author_thumbnail_url: String
      parent_post_pda: String
      parent_post_sequence_id: Int
      parent_post_author_user_pda: String
      parent_comment_sequence_id: Int
      parent_comment_author_user_pda: String
      parent_comment_author_associated_asset_pda: String
      reaction_type: String # e.g. "like", "upvote", "downvote", "emoji"
      content: String # used if reaction_type = "emoji"
      index_created_at: String
      index_updated_at: String
      create_transaction_signature: String
      create_transaction_block_time: String
      create_transaction_signer: String
    }

    """
    Only queries; no mutations are needed,
    because it's a read-only API.
    """
    type Query {
      # =========================
      #        USER QUERIES
      # =========================

      """
      Return a single user by user_pda
      """
      getUser(user_pda: String!): User

      """
      Return an array of users based on their user_pda array.
      e.g. getUsers(users: ["UserPDA_1", "UserPDA_2"])
      """
      getUsers(users: [String!]!): [User]

      # =========================
      #        POST QUERIES
      # =========================

      """
      Return a single post by its post_pda
      """
      getPost(post_pda: String!): Post

      """
      Return a list of posts, optionally filtered
      by tag_name and date range, sorted by index_created_at.
      order can be "ASC" or "DESC".
      before => fetch posts created strictly before this date
      until  => fetch posts created strictly after this date
      """
      getPosts(
        order: String
        before: String
        until: String
        limit: Int
        tag_name: String
      ): [Post]

      """
      Return the total number of posts, optionally filtered by tag_name
      """
      getPostCount(tag_name: String): Int

      # =========================
      #      COMMENT QUERIES
      # =========================

      """
      Return a single comment by composite PK:
      (comment_author_sequence_id + comment_author_user_pda)
      """
      getComment(
        comment_author_sequence_id: Int!
        comment_author_user_pda: String!
      ): Comment

      """
      Return a list of comments, optionally filtered
      by 'target' (interpreted as parent_post_pda),
      date range, order, etc.
      """
      getComments(
        target: String
        order: String
        before: String
        until: String
        limit: Int
        user: String
      ): [Comment]

      # =========================
      #  COMMENT REACTION QUERIES
      # =========================

      """
      Return a single comment reaction by composite PK:
      (reaction_author_sequence_id + reaction_author_user_pda)
      """
      getCommentReaction(
        reaction_author_sequence_id: Int!
        reaction_author_user_pda: String!
      ): CommentReaction

      """
      Return a list of comment reactions, optionally filtered
      by the parent post or parent comment.
      example usage:
        getCommentReactions(
          target_post_pda: "...",
          target_comment_sequence_id: 7,
          target_comment_author_user_pda: "...",
          order: "DESC"
        )
      """
      getCommentReactions(
        target_post_pda: String
        target_comment_sequence_id: Int
        target_comment_author_user_pda: String
        order: String
        before: String
        until: String
        limit: Int
      ): [CommentReaction]

      """
      Return daily like statistics for a user over the past 7 days
      """
      getDailyLikeStats(user_pda: String!): [DailyLikeStat]

      """
      Return daily comment statistics for a user over the past 7 days
      """
      getDailyCommentStats(user_pda: String!): [DailyCommentStat]

      """
      Return daily reward statistics for a user over the past 7 days
      """
      getDailyRewardStats(user_pda: String!): [DailyRewardStat]
    }
  `;

  // 3. Define resolvers for each Query
  const resolvers = {
    Query: {
      // =========================
      //        USER QUERIES
      // =========================
      getUser: async (_parent: any, args: { user_pda: string }) => {
        return models.User.findByPk(args.user_pda);
      },
      getUsers: async (_parent: any, args: { users: string[] }) => {
        return models.User.findAll({
          where: { user_pda: args.users },
        });
      },

      // =========================
      //        POST QUERIES
      // =========================
      getPost: async (_parent: any, args: { post_pda: string }) => {
        return models.Post.findByPk(args.post_pda);
      },
      getPosts: async (
        _parent: any,
        args: {
          order?: string;
          before?: string;
          until?: string;
          limit?: number;
          tag_name?: string;
        }
      ) => {
        const { order, before, until, limit, tag_name } = args;
        const whereClause: any = {};

        // If tag_name is provided
        if (tag_name) {
          whereClause.tag_name = tag_name;
        }
        // For date filters
        if (before || until) {
          whereClause.index_created_at = {};
          if (before) {
            whereClause.index_created_at[Op.lt] = new Date(parseInt(before));
          }
          if (until) {
            whereClause.index_created_at[Op.gt] = new Date(parseInt(until));
          }
        }
        const sortOrder = order === "DESC" ? "DESC" : "ASC";

        return models.Post.findAll({
          where: whereClause,
          order: [["index_created_at", sortOrder]],
          limit: limit || 50,
        });
      },
      getPostCount: async (_parent: any, args: { tag_name?: string }) => {
        const { tag_name } = args;
        const whereClause: any = {};

        // If tag_name is provided, filter by tag
        if (tag_name) {
          whereClause.tag_name = tag_name;
        }

        return models.Post.count({
          where: whereClause,
        });
      },

      // =========================
      //      COMMENT QUERIES
      // =========================
      getComment: async (
        _parent: any,
        args: {
          comment_author_sequence_id: number;
          comment_author_user_pda: string;
        }
      ) => {
        return models.Comment.findOne({
          where: {
            comment_author_sequence_id: args.comment_author_sequence_id,
            comment_author_user_pda: args.comment_author_user_pda,
          },
        });
      },
      getComments: async (
        _parent: any,
        args: {
          target?: string;
          order?: string;
          before?: string;
          until?: string;
          limit?: number;
          user?: string;
        }
      ) => {
        const { target, order, before, until, limit, user } = args;
        const whereClause: any = {};

        if (target) {
          whereClause.parent_post_pda = target;
        }
        if (user) {
          whereClause.comment_author_user_pda = user;
        }
        if (before || until) {
          whereClause.index_created_at = {};
          if (before) {
            whereClause.index_created_at[Op.lt] = new Date(before);
          }
          if (until) {
            whereClause.index_created_at[Op.gt] = new Date(until);
          }
        }
        const sortOrder = order === "DESC" ? "DESC" : "ASC";

        return models.Comment.findAll({
          where: whereClause,
          order: [["index_created_at", sortOrder]],
          limit: limit || 50,
        });
      },

      // =========================
      //  COMMENT REACTION QUERIES
      // =========================
      getCommentReaction: async (
        _parent: any,
        args: {
          reaction_author_sequence_id: number;
          reaction_author_user_pda: string;
        }
      ) => {
        return models.CommentReaction.findOne({
          where: {
            reaction_author_sequence_id: args.reaction_author_sequence_id,
            reaction_author_user_pda: args.reaction_author_user_pda,
          },
        });
      },
      getCommentReactions: async (
        _parent: any,
        args: {
          target_post_pda?: string;
          target_comment_sequence_id?: number;
          target_comment_author_user_pda?: string;
          order?: string;
          before?: string;
          until?: string;
          limit?: number;
        }
      ) => {
        const {
          target_post_pda,
          target_comment_sequence_id,
          target_comment_author_user_pda,
          order,
          before,
          until,
          limit,
        } = args;
        const whereClause: any = {};

        if (target_post_pda) {
          whereClause.parent_post_pda = target_post_pda;
        }
        if (target_comment_sequence_id !== undefined) {
          whereClause.parent_comment_sequence_id = target_comment_sequence_id;
        }
        if (target_comment_author_user_pda) {
          whereClause.parent_comment_author_user_pda =
            target_comment_author_user_pda;
        }
        if (before || until) {
          whereClause.index_created_at = {};
          if (before) {
            whereClause.index_created_at[Op.lt] = new Date(before);
          }
          if (until) {
            whereClause.index_created_at[Op.gt] = new Date(until);
          }
        }
        const sortOrder = order === "DESC" ? "DESC" : "ASC";

        return models.CommentReaction.findAll({
          where: whereClause,
          order: [["index_created_at", sortOrder]],
          limit: limit || 50,
        });
      },

      // =========================
      //  ANALYTICS QUERIES
      // =========================
      getDailyLikeStats: async (_parent: any, args: { user_pda: string }) => {
        if (!sequelize) {
          throw new Error("Sequelize instance not available");
        }

        const stats = await getDailyLikeStats(sequelize, args.user_pda);

        // Convert string counts to integers
        return stats.map((stat: any) => ({
          day: stat.day,
          count: parseInt(stat.count, 10),
        }));
      },
      getDailyCommentStats: async (
        _parent: any,
        args: { user_pda: string }
      ) => {
        if (!sequelize) {
          throw new Error("Sequelize instance not available");
        }

        const stats = await getDailyCommentStats(sequelize, args.user_pda);

        // Convert string counts to integers
        return stats.map((stat: any) => ({
          day: stat.day,
          count: parseInt(stat.count, 10),
        }));
      },
      getDailyRewardStats: async (_parent: any, args: { user_pda: string }) => {
        if (!sequelize) {
          throw new Error("Sequelize instance not available");
        }

        const stats = await getDailyRewardStats(sequelize, args.user_pda);

        // Convert string counts to integers
        return stats.map((stat: any) => ({
          day: stat.day,
          count: parseInt(stat.count, 10),
        }));
      },
    },
  };

  // 4. Create and start Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    nodeEnv: "development",
    cors: {
      origin: "*",
      credentials: false,
    },
  });

  const { url } = await server.listen({ port: config.port || 4000 });
  console.log(`GraphQL server ready at ${url}`);
}
