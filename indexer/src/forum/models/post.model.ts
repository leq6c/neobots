// forum-library/models/post.model.ts

import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export interface PostAttributes {
  post_pda: string; // PK
  post_sequence_id?: number;
  post_author_pda?: string;
  post_author_associated_asset_pda?: string;
  post_author_username?: string;
  post_author_thumbnail_url?: string;
  tag_name?: string;
  tag_pda?: string;
  content?: string; // cached text
  content_url?: string; // off-chain URL
  content_hash?: string; // off-chain content hash
  /* parsed data */
  content_parsed_title?: string;
  content_parsed_body?: string;
  content_parsed_enable_voting?: boolean;
  content_parsed_vote_options?: string;
  content_parsed_vote_title?: string;
  /* === */
  index_created_at?: Date;
  index_updated_at?: Date;
  create_transaction_signature?: string;
  create_transaction_block_time?: bigint | number;
  create_transaction_signer?: string;
  received_upvotes?: number;
  received_downvotes?: number;
  received_likes?: number;
  received_banvotes?: number;
  received_comments?: number;
}

export type PostCreationAttributes = Optional<
  PostAttributes,
  | "post_sequence_id"
  | "post_author_pda"
  | "post_author_associated_asset_pda"
  | "post_author_username"
  | "post_author_thumbnail_url"
  | "tag_name"
  | "tag_pda"
  | "content"
  | "content_url"
  | "content_hash"
  | "content_parsed_title"
  | "content_parsed_body"
  | "content_parsed_enable_voting"
  | "content_parsed_vote_options"
  | "content_parsed_vote_title"
  | "index_created_at"
  | "index_updated_at"
  | "create_transaction_signature"
  | "create_transaction_block_time"
  | "create_transaction_signer"
  | "received_upvotes"
  | "received_downvotes"
  | "received_likes"
  | "received_banvotes"
  | "received_comments"
>;

export class Post
  extends Model<PostAttributes, PostCreationAttributes>
  implements PostAttributes
{
  public post_pda!: string;
  public post_sequence_id?: number;
  public post_author_pda?: string;
  public post_author_associated_asset_pda?: string;
  public post_author_username?: string;
  public post_author_thumbnail_url?: string;
  public tag_name?: string;
  public tag_pda?: string;
  public content?: string;
  public content_url?: string;
  public content_hash?: string;
  public content_parsed_title?: string;
  public content_parsed_body?: string;
  public content_parsed_enable_voting?: boolean;
  public content_parsed_vote_options?: string;
  public content_parsed_vote_title?: string;
  public index_created_at?: Date;
  public index_updated_at?: Date;
  public create_transaction_signature?: string;
  public create_transaction_block_time?: bigint | number;
  public create_transaction_signer?: string;
  public received_upvotes?: number;
  public received_downvotes?: number;
  public received_likes?: number;
  public received_banvotes?: number;
  public received_comments?: number;
}

export function initPostModel(sequelize: Sequelize) {
  Post.init(
    {
      post_pda: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      post_sequence_id: DataTypes.INTEGER,
      post_author_pda: DataTypes.STRING,
      post_author_associated_asset_pda: DataTypes.STRING,
      post_author_username: DataTypes.STRING,
      post_author_thumbnail_url: DataTypes.STRING,
      tag_name: DataTypes.STRING,
      tag_pda: DataTypes.STRING,
      content: DataTypes.TEXT,
      content_url: DataTypes.STRING,
      content_hash: DataTypes.STRING,
      content_parsed_title: DataTypes.STRING,
      content_parsed_body: DataTypes.TEXT,
      content_parsed_enable_voting: DataTypes.BOOLEAN,
      content_parsed_vote_options: DataTypes.TEXT,
      content_parsed_vote_title: DataTypes.STRING,
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
      received_comments: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "post",
      timestamps: false,
    }
  );
}
