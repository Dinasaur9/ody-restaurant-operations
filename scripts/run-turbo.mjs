import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const shimDirectory = join(root, "tools", "bin");
const turboEntry = join(root, "node_modules", "turbo", "bin", "turbo");
const task = process.argv[2];

if (!task) {
  console.error("Usage: node scripts/run-turbo.mjs <task>");
  process.exit(1);
}

const pathKey = Object.keys(process.env).find(
  (key) => key.toLowerCase() === "path",
) ?? "PATH";
const env = { ...process.env };

// Corepack can run pnpm without installing a global shim, but Turbo still
// needs a discoverable package-manager binary on Windows.
if (process.platform === "win32") {
  env[pathKey] = `${shimDirectory};${process.env[pathKey] ?? ""}`;
}

const result = spawnSync(process.execPath, [turboEntry, "run", task], {
  cwd: root,
  env,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
