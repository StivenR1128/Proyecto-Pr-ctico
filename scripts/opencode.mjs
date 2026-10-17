import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const env = { ...process.env };
for (const [name, folder] of Object.entries({
  XDG_DATA_HOME: "data",
  XDG_STATE_HOME: "state",
  XDG_CACHE_HOME: "cache",
  XDG_CONFIG_HOME: "config",
})) {
  env[name] = path.join(root, ".local", "opencode", folder);
  mkdirSync(env[name], { recursive: true });
}
const binary = path.join(
  root,
  "node_modules",
  "opencode-ai",
  "bin",
  process.platform === "win32" ? "opencode.exe" : "opencode",
);
const child = spawn(binary, process.argv.slice(2), {
  cwd: root,
  env,
  stdio: "inherit",
});
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
