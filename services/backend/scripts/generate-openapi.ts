import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "../src/app";
import type { Database } from "../src/db/client";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(
  currentDirectory,
  "../../../packages/api-client/openapi.json",
);

// Contract generation only requests /openapi.json; no database operation runs.
const contractOnlyDatabase = {} as Database;
const response = await createApp(contractOnlyDatabase).request("/openapi.json");

if (!response.ok) {
  throw new Error(`OpenAPI generation failed with ${response.status}`);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(await response.json(), null, 2));

console.log(`Generated OpenAPI contract at ${outputPath}`);
