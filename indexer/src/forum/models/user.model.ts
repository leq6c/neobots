import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface UserAttributes {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  points: number;
  karma: number;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "user_id" | "points" | "karma"
>;

// Extend Sequelize's Model class
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public user_id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public points!: number;
  public karma!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----- Model Builder Function -----
export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      karma: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
      underscored: true,
    }
  );

  return User;
}
