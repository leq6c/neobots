// forum-library/index.ts

import { Sequelize, Options as SequelizeOptions } from "sequelize";

import { initUserModel, User } from "./models/user.model";
import { initPostModel, Post } from "./models/post.model";
import { initCommentModel, Comment } from "./models/comment.model";
import {
  initCommentReactionModel,
  CommentReaction,
} from "./models/commentReaction.model";
import {
  IndexMetadata,
  initIndexMetadataModel,
} from "./models/indexMetadata.model";

/**
 * Aggregates all models in one interface
 */
export interface ForumModels {
  User: typeof User;
  Post: typeof Post;
  Comment: typeof Comment;
  CommentReaction: typeof CommentReaction;
  IndexMetadata: typeof IndexMetadata;
}

/**
 * Main initialization function
 * Creates a Sequelize instance, initializes all models, syncs with DB.
 */
export async function initForum(
  dbConfig: SequelizeOptions
): Promise<{ sequelize: Sequelize; models: ForumModels }> {
  // Create the sequelize instance
  const sequelize = new Sequelize(dbConfig);

  // Init each model with the same Sequelize instance
  initUserModel(sequelize);
  initPostModel(sequelize);
  initCommentModel(sequelize);
  initCommentReactionModel(sequelize);
  initIndexMetadataModel(sequelize);

  // If you'd like to define relationships, you can do so here:
  // Example:
  // User.hasMany(Post, {
  //   foreignKey: 'post_author_pda',
  //   sourceKey: 'user_pda',
  // });
  // Post.belongsTo(User, {
  //   foreignKey: 'post_author_pda',
  //   targetKey: 'user_pda',
  // });

  // Sync DB - creates tables if they do not exist
  // For production, you'd typically run migrations instead.
  await sequelize.sync();

  // Return the instance and the models
  const models: ForumModels = {
    User,
    Post,
    Comment,
    CommentReaction,
    IndexMetadata,
  };
  return { sequelize, models };
}
