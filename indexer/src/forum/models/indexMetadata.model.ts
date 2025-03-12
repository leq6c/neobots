// indexMetadata.model.ts

import { Model, DataTypes, Optional, Sequelize } from "sequelize";

export interface IndexMetadataAttributes {
  meta_key: string;
  meta_value: string;
  updated_at?: Date;
}

export type IndexMetadataCreationAttributes = Optional<
  IndexMetadataAttributes,
  "updated_at"
>;

export class IndexMetadata
  extends Model<IndexMetadataAttributes, IndexMetadataCreationAttributes>
  implements IndexMetadataAttributes
{
  public meta_key!: string;
  public meta_value!: string;
  public updated_at?: Date;
}

export function initIndexMetadataModel(sequelize: Sequelize) {
  IndexMetadata.init(
    {
      meta_key: {
        type: DataTypes.STRING(255),
        primaryKey: true,
      },
      meta_value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "index_metadata",
      timestamps: false, // we manage updated_at ourselves if needed
    }
  );
}
