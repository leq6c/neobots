// forum-library/models/reward.model.ts

import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export interface RewardAttributes {
  signature: string; // PK
  instruction_sequence: number; // PK. instruction index in the transaction
  reward_sequence: number; // PK. reward index in the instruction

  receiver_user_pda: string;
  amount: number;
  type: string; // "comment_creator", "comment_receiver", "reaction_giver", "reaction_receiver"

  index_created_at?: Date;
  index_updated_at?: Date;
  create_transaction_signature?: string;
  create_transaction_block_time?: bigint | number;
  create_transaction_signer?: string;
}

export type RewardCreationAttributes = Optional<
  RewardAttributes,
  | "index_created_at"
  | "index_updated_at"
  | "create_transaction_signature"
  | "create_transaction_block_time"
  | "create_transaction_signer"
>;

export class Reward
  extends Model<RewardAttributes, RewardCreationAttributes>
  implements RewardAttributes
{
  public signature!: string;
  public instruction_sequence!: number;
  public reward_sequence!: number;
  public receiver_user_pda!: string;
  public amount!: number;
  public type!: string;

  public index_created_at?: Date;
  public index_updated_at?: Date;
  public create_transaction_signature?: string;
  public create_transaction_block_time?: bigint | number;
  public create_transaction_signer?: string;
}

export function initRewardModel(sequelize: Sequelize) {
  Reward.init(
    {
      signature: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      instruction_sequence: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      reward_sequence: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      receiver_user_pda: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      type: DataTypes.STRING,

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
      tableName: "reward",
      timestamps: false,
    }
  );
}
