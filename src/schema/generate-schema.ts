import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  contractSchema,
  PUBLIC_SCHEMA_ROOTS,
  type JsonSchema,
} from "./contract-schema.js";

function assertEveryPublicRootExists(
  definitions: Readonly<Record<string, JsonSchema>>,
): void {
  const missing = PUBLIC_SCHEMA_ROOTS.filter((name) => !(name in definitions));
  if (missing.length > 0) {
    throw new Error(`Schema generation refused: missing public roots: ${missing.join(", ")}`);
  }
}

/** Write the schema with deterministic insertion order and two-space layout. */
export async function generateContractSchema(
  projectRoot = process.cwd(),
): Promise<string> {
  assertEveryPublicRootExists(contractSchema.$defs);

  const outputDirectory = resolve(projectRoot, "generated");
  const outputPath = resolve(
    outputDirectory,
    "hklang-contract-5.0.16.schema.json",
  );

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(contractSchema, null, 2)}\n`, "utf8");
  return outputPath;
}

const isDirectInvocation = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);

if (isDirectInvocation) {
  const outputPath = await generateContractSchema();
  process.stdout.write(`${outputPath}\n`);
}
