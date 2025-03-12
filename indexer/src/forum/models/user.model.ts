// forum-library/models/user.model.ts

import { Model, DataTypes, Optional, Sequelize } from "sequelize";

/**
 * 1. Define the Attributes interface
 */
export interface UserAttributes {
  user_pda: string; // PK
  associated_asset_pda?: string; // unique
  username?: string;
  thumbnail_url?: string;
  index_created_at?: Date;
  index_updated_at?: Date;
  create_transaction_signature?: string;
  create_transaction_block_time?: bigint | number;
  create_transaction_signer?: string;
}

/**
 * 2. Define the CreationAttributes type
 *    Fields we can omit when creating a new User
 */
export type UserCreationAttributes = Optional<
  UserAttributes,
  | "associated_asset_pda"
  | "username"
  | "thumbnail_url"
  | "index_created_at"
  | "index_updated_at"
  | "create_transaction_signature"
  | "create_transaction_block_time"
  | "create_transaction_signer"
>;

/**
 * 3. Define the actual Model class
 */
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public user_pda!: string; // PK
  public associated_asset_pda?: string;
  public username?: string;
  public thumbnail_url?: string;
  public index_created_at?: Date;
  public index_updated_at?: Date;
  public create_transaction_signature?: string;
  public create_transaction_block_time?: bigint | number;
  public create_transaction_signer?: string;
}

/**
 * 4. Export an init function to define the model
 *    in the context of a given Sequelize instance
 */
export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      user_pda: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      associated_asset_pda: {
        type: DataTypes.STRING,
        unique: true,
      },
      username: DataTypes.STRING,
      thumbnail_url: DataTypes.STRING,
      index_created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      index_updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      create_transaction_signature: DataTypes.STRING,
      create_transaction_block_time: DataTypes.BIGINT, // i64
      create_transaction_signer: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: "user",
      timestamps: false, // We'll rely on index_* columns manually
    }
  );
}
