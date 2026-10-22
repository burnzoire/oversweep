import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const outputDirectory = fileURLToPath(new URL("../dist/", import.meta.url));
const forbidden = [
  "experience.case-three-tomcat",
  "manual.case-three-tomcat",
  "case-three-tomcat",
  "CaseThreePractice",
  "synthetic-turn-clock-v1",
  "Local synthetic exercise — not Case III guidance",
];
const outputInfo = await stat(outputDirectory).catch(() => null);

if (!outputInfo?.isDirectory()) {
  throw new Error("Production output is missing; run `npm run build` first.");
}

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(path) : [path];
    }),
  );
  return nested.flat();
}

const files = await filesUnder(outputDirectory);
const leaks = [];
for (const file of files) {
  const relativePath = relative(outputDirectory, file);
  if (relativePath.includes("case-three-tomcat")) {
    leaks.push(`${relativePath}: excluded route or asset`);
  }
  const contents = await readFile(file, "utf8");
  for (const token of forbidden) {
    if (contents.includes(token)) leaks.push(`${relativePath}: ${token}`);
  }
}

if (leaks.length > 0) {
  throw new Error(
    `Excluded Case III content was emitted:\n${leaks.join("\n")}`,
  );
}

console.log(`Publication exclusion passed: scanned ${files.length} emitted files.`);
