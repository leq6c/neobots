import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface CommentAttributes {
  comment_id: number;
  content: string;
  parent_comment_id?: number | null;
  upvote_count: number;
  downvote_count: number;
  user_id: number; // foreign key to User
  post_id: number; // foreign key to Post
}

export type CommentCreationAttributes = Optional<
  CommentAttributes,
  "comment_id" | "upvote_count" | "downvote_count" | "parent_comment_id"
>;

export class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public comment_id!: number;
  public content!: string;
  public parent_comment_id?: number | null;
  public upvote_count!: number;
  public downvote_count!: number;
  public user_id!: number;
  public post_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initCommentModel(sequelize: Sequelize) {
  Comment.init(
    {
      comment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      parent_comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      upvote_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      downvote_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "comments",
      timestamps: true,
      underscored: true,
    }
  );

  return Comment;
}
