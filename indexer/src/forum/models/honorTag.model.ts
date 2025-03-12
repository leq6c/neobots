import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface HonorTagAttributes {
  honor_tag_id: number;
  tag_name: string;
  description?: string | null;
}

export type HonorTagCreationAttributes = Optional<
  HonorTagAttributes,
  "honor_tag_id"
>;

export class HonorTag
  extends Model<HonorTagAttributes, HonorTagCreationAttributes>
  implements HonorTagAttributes
{
  public honor_tag_id!: number;
  public tag_name!: string;
  public description?: string | null;
}

export function initHonorTagModel(sequelize: Sequelize) {
  HonorTag.init(
    {
      honor_tag_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tag_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "honor_tags",
      timestamps: false,
      underscored: true,
    }
  );

  return HonorTag;
}
