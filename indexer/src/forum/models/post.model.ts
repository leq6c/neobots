// forum-library/models/post.model.ts

import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export interface PostAttributes {
  post_pda: string; // PK
  post_author_pda?: string;
  post_author_associated_asset_pda?: string;
  __post_author_username?: string;
  tag_name?: string;
  tag_pda?: string;
  content?: string; // cached text
  content_url?: string; // off-chain URL
  content_hash?: string; // off-chain content hash
  index_created_at?: Date;
  index_updated_at?: Date;
  create_transaction_signature?: string;
  create_transaction_block_time?: bigint | number;
  create_transaction_signer?: string;
}

export type PostCreationAttributes = Optional<
  PostAttributes,
  | "post_author_pda"
  | "post_author_associated_asset_pda"
  | "__post_author_username"
  | "tag_name"
  | "tag_pda"
  | "content"
  | "content_url"
  | "content_hash"
  | "index_created_at"
  | "index_updated_at"
  | "create_transaction_signature"
  | "create_transaction_block_time"
  | "create_transaction_signer"
>;

export class Post
  extends Model<PostAttributes, PostCreationAttributes>
  implements PostAttributes
{
  public post_pda!: string;
  public post_author_pda?: string;
  public post_author_associated_asset_pda?: string;
  public __post_author_username?: string;
  public tag_name?: string;
  public tag_pda?: string;
  public content?: string;
  public content_url?: string;
  public content_hash?: string;
  public index_created_at?: Date;
  public index_updated_at?: Date;
  public create_transaction_signature?: string;
  public create_transaction_block_time?: bigint | number;
  public create_transaction_signer?: string;
}

export function initPostModel(sequelize: Sequelize) {
  Post.init(
    {
      post_pda: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      post_author_pda: DataTypes.STRING,
      post_author_associated_asset_pda: DataTypes.STRING,
      __post_author_username: DataTypes.STRING,
      tag_name: DataTypes.STRING,
      tag_pda: DataTypes.STRING,
      content: DataTypes.TEXT,
      content_url: DataTypes.STRING,
      content_hash: DataTypes.STRING,
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
    },
    {
      sequelize,
      tableName: "post",
      timestamps: false,
    }
  );
}
