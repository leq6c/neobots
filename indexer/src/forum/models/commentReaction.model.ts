// forum-library/models/commentReaction.model.ts

import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export interface CommentReactionAttributes {
  reaction_author_sequence_id: number; // PK (part 1)
  reaction_author_user_pda: string; // PK (part 2)

  reaction_author_associated_asset_pda?: string;
  __reaction_author_username?: string;

  parent_post_pda?: string;
  parent_post_sequence_id?: number;
  parent_post_author_user_pda?: string;

  parent_comment_sequence_id?: number;
  parent_comment_author_user_pda?: string;
  parent_comment_author_associated_asset_pda?: string;

  reaction_type?: string; // "like", "upvote", "downvote", "emoji", etc.
  content?: string; // if reaction_type = "emoji"

  index_created_at?: Date;
  index_updated_at?: Date;
  create_transaction_signature?: string;
  create_transaction_block_time?: bigint | number;
  create_transaction_signer?: string;
}

export type CommentReactionCreationAttributes = Optional<
  CommentReactionAttributes,
  | "reaction_author_associated_asset_pda"
  | "__reaction_author_username"
  | "parent_post_pda"
  | "parent_post_sequence_id"
  | "parent_post_author_user_pda"
  | "parent_comment_sequence_id"
  | "parent_comment_author_user_pda"
  | "parent_comment_author_associated_asset_pda"
  | "reaction_type"
  | "content"
  | "index_created_at"
  | "index_updated_at"
  | "create_transaction_signature"
  | "create_transaction_block_time"
  | "create_transaction_signer"
>;

export class CommentReaction
  extends Model<CommentReactionAttributes, CommentReactionCreationAttributes>
  implements CommentReactionAttributes
{
  public reaction_author_sequence_id!: number;
  public reaction_author_user_pda!: string;

  public reaction_author_associated_asset_pda?: string;
  public __reaction_author_username?: string;

  public parent_post_pda?: string;
  public parent_post_sequence_id?: number;
  public parent_post_author_user_pda?: string;

  public parent_comment_sequence_id?: number;
  public parent_comment_author_user_pda?: string;
  public parent_comment_author_associated_asset_pda?: string;

  public reaction_type?: string;
  public content?: string;

  public index_created_at?: Date;
  public index_updated_at?: Date;
  public create_transaction_signature?: string;
  public create_transaction_block_time?: bigint | number;
  public create_transaction_signer?: string;
}

export function initCommentReactionModel(sequelize: Sequelize) {
  CommentReaction.init(
    {
      reaction_author_sequence_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      reaction_author_user_pda: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      reaction_author_associated_asset_pda: DataTypes.STRING,
      __reaction_author_username: DataTypes.STRING,

      parent_post_pda: DataTypes.STRING,
      parent_post_sequence_id: DataTypes.INTEGER,
      parent_post_author_user_pda: DataTypes.STRING,

      parent_comment_sequence_id: DataTypes.INTEGER,
      parent_comment_author_user_pda: DataTypes.STRING,
      parent_comment_author_associated_asset_pda: DataTypes.STRING,

      reaction_type: DataTypes.STRING, // "like", "upvote", "downvote", "emoji"
      content: DataTypes.STRING, // e.g. emoji code

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
      tableName: "comment_reaction",
      timestamps: false,
    }
  );
}
