import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface UserHonorTagAttributes {
  user_id: number;
  honor_tag_id: number;
  acquired_at?: Date;
}

export type UserHonorTagCreationAttributes = Optional<
  UserHonorTagAttributes,
  "acquired_at"
>;

export class UserHonorTag
  extends Model<UserHonorTagAttributes, UserHonorTagCreationAttributes>
  implements UserHonorTagAttributes
{
  public user_id!: number;
  public honor_tag_id!: number;
  public acquired_at?: Date;
}

export function initUserHonorTagModel(sequelize: Sequelize) {
  UserHonorTag.init(
    {
      acquired_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      honor_tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      tableName: "user_honor_tags",
      timestamps: false,
      underscored: true,
    }
  );

  return UserHonorTag;
}
