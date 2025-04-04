// forum-library/models/comment.model.ts

import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export interface CommentAttributes {
  comment_author_sequence_id: number; // PK (part 1)
  comment_author_user_pda: string; // PK (part 2)

  comment_author_associated_asset_pda?: string;
  comment_author_username?: string;
  comment_author_thumbnail_url?: string;
  parent_post_pda?: string;
  parent_post_sequence_id?: number;
  parent_post_author_user_pda?: string;

  // content fields
  content?: string;
  content_url?: string;
  content_hash?: string;
  content_parsed_body?: string;
  content_parsed_vote_to?: string;

  index_created_at?: Date;
  index_updated_at?: Date;
  create_transaction_signature?: string;
  create_transaction_block_time?: bigint | number;
  create_transaction_signer?: string;

  received_upvotes?: number;
  received_downvotes?: number;
  received_likes?: number;
  received_banvotes?: number;
  karmas?: number;
}

export type CommentCreationAttributes = Optional<
  CommentAttributes,
  | "comment_author_associated_asset_pda"
  | "comment_author_username"
  | "comment_author_thumbnail_url"
  | "parent_post_pda"
  | "parent_post_sequence_id"
  | "parent_post_author_user_pda"
  | "content"
  | "content_url"
  | "content_hash"
  | "content_parsed_body"
  | "content_parsed_vote_to"
  | "index_created_at"
  | "index_updated_at"
  | "create_transaction_signature"
  | "create_transaction_block_time"
  | "create_transaction_signer"
  | "received_upvotes"
  | "received_downvotes"
  | "received_likes"
  | "received_banvotes"
  | "karmas"
>;

export class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public comment_author_sequence_id!: number;
  public comment_author_user_pda!: string;

  public comment_author_associated_asset_pda?: string;
  public comment_author_username?: string;
  public comment_author_thumbnail_url?: string;
  public parent_post_pda?: string;
  public parent_post_sequence_id?: number;
  public parent_post_author_user_pda?: string;

  public content?: string;
  public content_url?: string;
  public content_hash?: string;
  public content_parsed_body?: string;
  public content_parsed_vote_to?: string;

  public index_created_at?: Date;
  public index_updated_at?: Date;
  public create_transaction_signature?: string;
  public create_transaction_block_time?: bigint | number;
  public create_transaction_signer?: string;

  public received_upvotes?: number;
  public received_downvotes?: number;
  public received_likes?: number;
  public received_banvotes?: number;
  public karmas?: number;
}

export function initCommentModel(sequelize: Sequelize) {
  Comment.init(
    {
      comment_author_sequence_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      comment_author_user_pda: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      comment_author_associated_asset_pda: DataTypes.STRING,
      comment_author_username: DataTypes.STRING,
      comment_author_thumbnail_url: DataTypes.STRING,
      parent_post_pda: DataTypes.STRING,
      parent_post_sequence_id: DataTypes.INTEGER,
      parent_post_author_user_pda: DataTypes.STRING,

      content: DataTypes.TEXT,
      content_url: DataTypes.STRING,
      content_hash: DataTypes.STRING,
      content_parsed_body: DataTypes.TEXT,
      content_parsed_vote_to: DataTypes.STRING,

      index_created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      index_updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      create_transaction_signature: DataTypes.STRING,
      create_transaction_block_time: DataTypes.BIGINT,
      create_transaction_signer: DataTypes.STRING,

      received_upvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      received_downvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      received_likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      received_banvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      karmas: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "comment",
      timestamps: false,
    }
  );
}
