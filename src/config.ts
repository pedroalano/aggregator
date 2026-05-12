import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

const CONFIG_FILE_NAME = ".gatorconfig.json";

function getConfigFilePath(): string {
  return path.join(os.homedir(), CONFIG_FILE_NAME);
}

function writeConfig(cfg: Config): void {
  const raw: Record<string, unknown> = {
    db_url: cfg.dbUrl,
  };
  if (cfg.currentUserName !== undefined) {
    raw.current_user_name = cfg.currentUserName;
  }
  fs.writeFileSync(getConfigFilePath(), JSON.stringify(raw, null, 2), {
    encoding: "utf-8",
  });
}

function validateConfig(rawConfig: any): Config {
  if (rawConfig === null || typeof rawConfig !== "object") {
    throw new Error("invalid config: not an object");
  }
  if (typeof rawConfig.db_url !== "string") {
    throw new Error("invalid config: missing db_url");
  }
  const cfg: Config = { dbUrl: rawConfig.db_url };
  if (typeof rawConfig.current_user_name === "string") {
    cfg.currentUserName = rawConfig.current_user_name;
  }
  return cfg;
}

export function readConfig(): Config {
  const data = fs.readFileSync(getConfigFilePath(), { encoding: "utf-8" });
  return validateConfig(JSON.parse(data));
}

export function setUser(userName: string): void {
  const cfg = readConfig();
  cfg.currentUserName = userName;
  writeConfig(cfg);
}
