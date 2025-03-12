import { DataTypes, Model, Optional, Sequelize } from "sequelize";

type VoteTargetType = "post" | "comment";

export interface VoteAttributes {
  vote_id: number;
  target_type: VoteTargetType; // "post" or "comment"
  target_id: number; // references post_id or comment_id
  vote_type: string; // "upvote", "downvote", etc.
  user_id: number; // foreign key to User
}

export type VoteCreationAttributes = Optional<VoteAttributes, "vote_id">;

export class Vote
  extends Model<VoteAttributes, VoteCreationAttributes>
  implements VoteAttributes
{
  public vote_id!: number;
  public target_type!: VoteTargetType;
  public target_id!: number;
  public vote_type!: string;
  public user_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initVoteModel(sequelize: Sequelize) {
  Vote.init(
    {
      vote_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      target_type: {
        type: DataTypes.ENUM("post", "comment"),
        allowNull: false,
      },
      target_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vote_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "votes",
      timestamps: true,
      underscored: true,
    }
  );

  return Vote;
}
