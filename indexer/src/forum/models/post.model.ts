import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface PostAttributes {
  post_id: number;
  title: string;
  content: string;
  upvote_count: number;
  downvote_count: number;
  user_id: number; // foreign key to User
  category_id: number; // foreign key to Category
}

export type PostCreationAttributes = Optional<
  PostAttributes,
  "post_id" | "upvote_count" | "downvote_count"
>;

export class Post
  extends Model<PostAttributes, PostCreationAttributes>
  implements PostAttributes
{
  public post_id!: number;
  public title!: string;
  public content!: string;
  public upvote_count!: number;
  public downvote_count!: number;
  public user_id!: number;
  public category_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initPostModel(sequelize: Sequelize) {
  Post.init(
    {
      post_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "posts",
      timestamps: true,
      underscored: true,
    }
  );

  return Post;
}
