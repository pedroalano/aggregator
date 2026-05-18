import { desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { feedFollows, posts } from "../schema.js";

type NewPost = {
  title: string;
  url: string;
  description: string | null;
  publishedAt: Date | null;
  feedId: string;
};

export async function createPost(values: NewPost) {
  const [row] = await db
    .insert(posts)
    .values(values)
    .onConflictDoNothing({ target: posts.url })
    .returning();
  return row;
}

export async function getPostsForUser(userId: string, limit: number) {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
    })
    .from(posts)
    .innerJoin(feedFollows, eq(feedFollows.feedId, posts.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .limit(limit);
}
