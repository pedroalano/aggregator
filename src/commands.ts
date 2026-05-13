import { setUser } from "./config.js";
import {
  createUser,
  deleteUsers,
  getUserByName,
} from "./lib/db/queries/users.js";

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
