import { readConfig, setUser } from "./config.js";
import {
  createUser,
  deleteUsers,
  getUserByName,
  getUsers,
} from "./lib/db/queries/users.js";
import {
  createFeed,
  getFeedByUrl,
  getFeedsWithUser,
} from "./lib/db/queries/feeds.js";
import {
  createFeedFollow,
  getFeedFollowsForUser,
} from "./lib/db/queries/feed_follows.js";
import type { Feed, User } from "./lib/db/schema.js";
import { fetchFeed } from "./lib/rss/feed.js";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }
  await handler(cmdName, ...args);
}

export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`usage: ${cmdName} <username>`);
  }
  const userName = args[0];
  const existing = await getUserByName(userName);
  if (!existing) {
    throw new Error(`user ${userName} does not exist`);
  }
  setUser(userName);
  console.log(`user set to ${userName}`);
}

export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`usage: ${cmdName} <username>`);
  }
  const name = args[0];
  const existing = await getUserByName(name);
  if (existing) {
    throw new Error(`user ${name} already exists`);
  }
  const created = await createUser(name);
  setUser(name);
  console.log(`user ${name} created`);
  console.log(created);
}

export async function handlerReset(
  _cmdName: string,
  ..._args: string[]
): Promise<void> {
  await deleteUsers();
  console.log("users table reset");
}

export function printFeed(feed: Feed, user: User): void {
  console.log(`* id:          ${feed.id}`);
  console.log(`* created_at:  ${feed.createdAt.toISOString()}`);
  console.log(`* updated_at:  ${feed.updatedAt.toISOString()}`);
  console.log(`* name:        ${feed.name}`);
  console.log(`* url:         ${feed.url}`);
  console.log(`* user_id:     ${feed.userId}`);
  console.log(`* user:        ${user.name}`);
}

async function getCurrentUser(): Promise<User> {
  const cfg = readConfig();
  if (!cfg.currentUserName) {
    throw new Error("no current user set; run `login <name>` first");
  }
  const user = await getUserByName(cfg.currentUserName);
  if (!user) {
    throw new Error(`current user ${cfg.currentUserName} not found`);
  }
  return user;
}

export async function handlerAddFeed(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length < 2) {
    throw new Error(`usage: ${cmdName} <name> <url>`);
  }
  const [name, url] = args;
  const user = await getCurrentUser();
  const feed = await createFeed(name, url, user.id);
  printFeed(feed, user);
  const follow = await createFeedFollow(user.id, feed.id);
  console.log(`feed: ${follow.feedName}`);
  console.log(`user: ${follow.userName}`);
}

export async function handlerFollow(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`usage: ${cmdName} <url>`);
  }
  const url = args[0];
  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error(`feed not found for url ${url}`);
  }
  const user = await getCurrentUser();
  const follow = await createFeedFollow(user.id, feed.id);
  console.log(`feed: ${follow.feedName}`);
  console.log(`user: ${follow.userName}`);
}

export async function handlerFollowing(
  _cmdName: string,
  ..._args: string[]
): Promise<void> {
  const user = await getCurrentUser();
  const rows = await getFeedFollowsForUser(user.id);
  for (const r of rows) {
    console.log(`* ${r.feedName}`);
  }
}

export async function handlerAgg(
  _cmdName: string,
  ..._args: string[]
): Promise<void> {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.log(JSON.stringify(feed, null, 2));
}

export async function handlerFeeds(
  _cmdName: string,
  ..._args: string[]
): Promise<void> {
  const rows = await getFeedsWithUser();
  for (const f of rows) {
    console.log(`* ${f.name}`);
    console.log(`  url:  ${f.url}`);
    console.log(`  user: ${f.userName}`);
  }
}

export async function handlerUsers(
  _cmdName: string,
  ..._args: string[]
): Promise<void> {
  const cfg = readConfig();
  const rows = await getUsers();
  for (const u of rows) {
    const suffix = u.name === cfg.currentUserName ? " (current)" : "";
    console.log(`* ${u.name}${suffix}`);
  }
}
