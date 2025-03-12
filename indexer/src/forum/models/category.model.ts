import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface CategoryAttributes {
  category_id: number;
  name: string;
  description?: string | null;
}

export type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  "category_id"
>;

export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public category_id!: number;
  public name!: string;
  public description?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initCategoryModel(sequelize: Sequelize) {
  Category.init(
    {
      category_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
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
      tableName: "categories",
      timestamps: true,
      underscored: true,
    }
  );

  return Category;
}
