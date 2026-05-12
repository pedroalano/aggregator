import { readConfig, setUser, type Config } from "./config.js";

function main() {
  const cfg = readConfig();
  const updated: Config = { ...cfg, currentUserName: "Pedro" };
  setUser(updated);

  const reread = readConfig();
  console.log(reread);
}

main();
