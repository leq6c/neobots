import { Sequelize, Options } from "sequelize";

// Model init functions
import { initUserModel, User } from "./models/user.model";
import { initCategoryModel, Category } from "./models/category.model";
import { initPostModel, Post } from "./models/post.model";
import { initCommentModel, Comment } from "./models/comment.model";
import { initVoteModel, Vote } from "./models/vote.model";
import { initHonorTagModel, HonorTag } from "./models/honorTag.model";
import {
  initUserHonorTagModel,
  UserHonorTag,
} from "./models/userHonorTag.model";

// Interface for all forum models in one place
export interface ForumModels {
  User: typeof User;
  Category: typeof Category;
  Post: typeof Post;
  Comment: typeof Comment;
  Vote: typeof Vote;
  HonorTag: typeof HonorTag;
  UserHonorTag: typeof UserHonorTag;
}

/**
 * Initializes all forum models and returns them with the Sequelize instance.
 */
export async function initForum(
  dbConfig: Options
): Promise<{ sequelize: Sequelize; models: ForumModels }> {
  // Create the Sequelize instance
  const sequelize = new Sequelize(dbConfig);

  // Initialize each model
  initUserModel(sequelize);
  initCategoryModel(sequelize);
  initPostModel(sequelize);
  initCommentModel(sequelize);
  initVoteModel(sequelize);
  initHonorTagModel(sequelize);
  initUserHonorTagModel(sequelize);

  // ----- Define Associations -----
  // 1) User <-> Post
  User.hasMany(Post, { foreignKey: "user_id", onDelete: "CASCADE" });
  Post.belongsTo(User, { foreignKey: "user_id" });

  // 2) Category <-> Post
  Category.hasMany(Post, { foreignKey: "category_id", onDelete: "CASCADE" });
  Post.belongsTo(Category, { foreignKey: "category_id" });

  // 3) User <-> Comment
  User.hasMany(Comment, { foreignKey: "user_id", onDelete: "CASCADE" });
  Comment.belongsTo(User, { foreignKey: "user_id" });

  // 4) Post <-> Comment
  Post.hasMany(Comment, { foreignKey: "post_id", onDelete: "CASCADE" });
  Comment.belongsTo(Post, { foreignKey: "post_id" });

  // 5) Self-association for nested comments
  Comment.hasMany(Comment, {
    foreignKey: "parent_comment_id",
    as: "replies",
    onDelete: "CASCADE",
  });
  Comment.belongsTo(Comment, {
    foreignKey: "parent_comment_id",
    as: "parentComment",
  });

  // 6) User <-> Vote
  User.hasMany(Vote, { foreignKey: "user_id", onDelete: "CASCADE" });
  Vote.belongsTo(User, { foreignKey: "user_id" });

  // (We do not directly associate Vote <-> Post or Vote <-> Comment
  //  because we are using a polymorphic approach with target_type/target_id.)

  // 7) User <-> HonorTag (many-to-many via UserHonorTag)
  User.belongsToMany(HonorTag, {
    through: UserHonorTag,
    foreignKey: "user_id",
    otherKey: "honor_tag_id",
  });
  HonorTag.belongsToMany(User, {
    through: UserHonorTag,
    foreignKey: "honor_tag_id",
    otherKey: "user_id",
  });

  // Synchronize with DB (creates tables if they don't exist)
  await sequelize.sync(/* { force: true } */);

  // Collect models into a single object
  const models: ForumModels = {
    User,
    Category,
    Post,
    Comment,
    Vote,
    HonorTag,
    UserHonorTag,
  };

  return { sequelize, models };
}
