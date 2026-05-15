import {
  type CommandsRegistry,
  handlerAddFeed,
  handlerAgg,
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
  registerCommand,
  runCommand,
} from "./commands.js";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "addfeed", handlerAddFeed);

  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("error: not enough arguments. usage: <command> [args...]");
    process.exit(1);
  }

  const [cmdName, ...cmdArgs] = args;
  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    console.error(`error: ${(err as Error).message}`);
    process.exit(1);
  }
  process.exit(0);
}

main();
