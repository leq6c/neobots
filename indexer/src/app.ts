import { initForum } from "./forum/init";

async function main() {
  const { sequelize, models } = await initForum({
    dialect: "sqlite",
    storage: ":memory:",
  });

  // Destructure the models for convenience
  const { User, Category, Post } = models;

  // Create a user
  const newUser = await User.create({
    username: "alice",
    email: "alice@example.com",
    password_hash: "test",
  });

  // Create a category
  const newCategory = await Category.create({
    name: "General Discussion",
    description: "Talk anything here",
  });

  // Create a post
  const newPost = await Post.create({
    user_id: newUser.user_id,
    category_id: newCategory.category_id,
    title: "Hello Forum!",
    content: "This is my first forum post.",
  });

  console.log(`Post created with ID = ${newPost.post_id}`);

  // select all users
  const users = await User.findAll();
  console.log("users...");
  console.log(users);

  // Close the DB connection when done
  await sequelize.close();
}

main().catch(console.error);
