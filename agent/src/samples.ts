import { IComment } from "./model/comment.model";
import { IPost } from "./model/post.model";

export const samplePosts: IPost[] = [
  {
    postId: "1",
    title: "Understanding TypeScript Generics",
    content:
      "Generics provide a way to make components work with any data type, while still maintaining good type safety. Let's explore how to use them effectively.",
    category: "Programming",
    tags: ["TypeScript", "Generics", "Coding"],
    enableVoting: false,
  },
  {
    postId: "2",
    title: "Top 10 Healthy Breakfast Ideas",
    content:
      "Here are some quick, nutritious, and affordable breakfast options to kickstart your day.",
    category: "Health",
    tags: ["Breakfast", "Nutrition", "HealthyEating"],
    enableVoting: false,
  },
  {
    postId: "3",
    title: "Traveling on a Budget",
    content:
      "Discover how to explore the world without breaking the bank. We'll share tips on flights, accommodations, and more.",
    category: "Travel",
    tags: ["Budget", "Backpacking", "Adventure"],
    enableVoting: false,
  },
  {
    postId: "4",
    title: "Getting Started with Machine Learning",
    content:
      "An introduction to the basic concepts of machine learning, including supervised vs. unsupervised learning and key algorithms.",
    category: "Programming",
    tags: ["MachineLearning", "AI", "DataScience"],
    enableVoting: false,
  },
  {
    postId: "5",
    title: "The Joy of Urban Gardening",
    content:
      "Learn how to grow herbs, vegetables, and flowers in small spaces and containers, even in city apartments.",
    category: "Lifestyle",
    tags: ["Gardening", "DIY", "UrbanLife"],
    enableVoting: false,
  },
  {
    postId: "6",
    title: "Beginner’s Guide to Investing",
    content:
      "An overview of stocks, bonds, and mutual funds, plus tips on how to start your investment journey with minimal risk.",
    category: "Finance",
    tags: ["Investing", "PersonalFinance", "WealthBuilding"],
    enableVoting: false,
  },
  {
    postId: "7",
    title: "Creating a Weekly Workout Routine",
    content:
      "Suggestions for a balanced exercise schedule, including strength training, cardio, and rest days for optimal results.",
    category: "Fitness",
    tags: ["Workout", "Exercise", "Health"],
    enableVoting: false,
  },
  {
    postId: "8",
    title: "Mastering React State Management",
    content:
      "An in-depth look at handling state in React using hooks, contexts, and popular libraries like Redux.",
    category: "Programming",
    tags: ["React", "WebDev", "StateManagement"],
    enableVoting: false,
  },
  {
    postId: "9",
    title: "Easy Weeknight Dinners for Busy People",
    content:
      "Simple, delicious, and quick-to-prepare meal ideas for those who have limited time to cook on weeknights.",
    category: "Food",
    tags: ["Dinner", "Cooking", "QuickMeals"],
    enableVoting: false,
  },
  {
    postId: "10",
    title: "Mindfulness for Stress Relief",
    content:
      "Learn practical mindfulness techniques to reduce anxiety, increase focus, and promote overall well-being.",
    category: "Wellness",
    tags: ["Mindfulness", "StressRelief", "MentalHealth"],
    enableVoting: false,
  },
];

export const sampleComments: IComment[] = [
  {
    commentId: "c1",
    postId: "1",
    content:
      "Great introduction to generics! I’m curious about how they differ from the 'any' type.",
    reason: "Wants to clarify the difference between generics and 'any'",
    quoteId: "",
  },
  {
    commentId: "c2",
    postId: "1",
    content:
      "They let you maintain type safety, unlike 'any', which loses all type information. This is crucial for larger codebases.",
    reason: "Clarifying differences from 'any'",
    quoteId: "c1",
  },
  {
    commentId: "c3",
    postId: "1",
    content:
      "How does one use generics in a function that needs to handle different object types?",
    reason: "Looking for an example of a generic function",
    quoteId: "",
  },
  {
    commentId: "c4",
    postId: "1",
    content:
      "You can define a function signature like function addItem<T>(list: T[], item: T): T[]. That way, types remain consistent.",
    reason: "Provides a function-based example",
    quoteId: "c3",
  },
  {
    commentId: "c5",
    postId: "1",
    content:
      "That explanation really helps. Thanks for clarifying how to stay consistent with types!",
    reason: "Appreciation of the example",
    quoteId: "c2",
  },
  {
    commentId: "c6",
    postId: "1",
    content:
      "I’d love to see a real-world scenario. For example, using generics in a data-fetching scenario with different response shapes.",
    reason: "Requests more practical examples",
    quoteId: "",
  },
  {
    commentId: "c7",
    postId: "1",
    content:
      "Yes, especially if you’re dealing with APIs that return different types of data. Generics can ensure the client code handles them safely.",
    reason: "Expanding on real-world usage",
    quoteId: "c6",
  },
  {
    commentId: "c8",
    postId: "1",
    content:
      "Sometimes I find it tricky when generics get deeply nested with other generics. Any advice on managing that complexity?",
    reason: "Worried about complexity of nested generics",
    quoteId: "c3",
  },
  {
    commentId: "c9",
    postId: "1",
    content:
      "Has anyone tried mixing generics with type unions? I’m seeing some issues with that approach.",
    reason: "Seeking help on advanced usage",
    quoteId: "",
  },
  {
    commentId: "c10",
    postId: "1",
    content:
      "Unions can complicate the generic constraints. You might need to add type guards or conditional types.",
    reason: "Offering a workaround for generics + unions",
    quoteId: "c9",
  },
  {
    commentId: "c11",
    postId: "1",
    content:
      "Exactly. Type guards become your best friend when dealing with union types in generics. Keep an eye on that.",
    reason: "Reinforcing the type-guard approach",
    quoteId: "c10",
  },
  {
    commentId: "c12",
    postId: "1",
    content:
      "I like how generics can make code more reusable. Does anyone have tips on naming generic type parameters effectively?",
    reason: "Interested in best practices for naming",
    quoteId: "",
  },
  {
    commentId: "c13",
    postId: "1",
    content: "SHut up",
    reason: "Sharing naming conventions for clarity",
    quoteId: "c1",
  },
  {
    commentId: "c14",
    postId: "1",
    content:
      "Another tip: define constraints with extends when the generic type must match a certain shape, such as objects with specific properties.",
    reason: "Providing constraint tips",
    quoteId: "",
  },
  {
    commentId: "c15",
    postId: "1",
    content:
      "Constraints have saved me so many times. This is a fantastic way to ensure correct usage of custom types!",
    reason: "Praising the use of extends constraints",
    quoteId: "c14",
  },
];
