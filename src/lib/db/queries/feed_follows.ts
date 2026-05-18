import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { feedFollows, feeds, users } from "../schema.js";
import { getFeedByUrl } from "./feeds.js";

export async function createFeedFollow(userId: string, feedId: string) {
  const [newRow] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .returning();

  const [enriched] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newRow.id));

  return enriched;
}

export async function deleteFeedFollow(userId: string, url: string) {
  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error(`feed not found for url ${url}`);
  }
  const deleted = await db
    .delete(feedFollows)
    .where(
      and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)),
    )
    .returning();
  if (deleted.length === 0) {
    throw new Error(`not following ${url}`);
  }
  return deleted[0];
}

export async function getFeedFollowsForUser(userId: string) {
  return db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.userId, userId));
}
