import {
  type CommandsRegistry,
  handlerLogin,
  registerCommand,
  runCommand,
} from "./commands.js";

function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);

  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("error: not enough arguments. usage: <command> [args...]");
    process.exit(1);
  }

  const [cmdName, ...cmdArgs] = args;
  try {
    runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    console.error(`error: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
