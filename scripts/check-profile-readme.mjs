import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readmePath = path.join(root, "README.md");
const readme = fs.readFileSync(readmePath, "utf8");
const errors = [];

const requiredReferences = [
  "profile-3d-contrib/profile-night-yellow.svg",
  "dist/github-snake-yellow.svg",
  "dist/github-snake-yellow-dark.svg",
];

for (const reference of requiredReferences) {
  if (!readme.includes(reference)) {
    errors.push(`README is missing required contribution artwork reference: ${reference}`);
  }
}

const imageTags = readme.match(/<img\b[^>]*>/gi) ?? [];
if (imageTags.length === 0) {
  errors.push("README does not contain any image tags");
}

for (const [index, tag] of imageTags.entries()) {
  if (!/\balt\s*=\s*(["']).*?\1/i.test(tag)) {
    errors.push(`README image #${index + 1} has no alt attribute`);
  }

  const source = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
  if (!source || /^(?:https?:)?\/\//i.test(source) || source.startsWith("data:")) {
    continue;
  }

  const localPath = path.resolve(root, source.replace(/^\.\//, "").split(/[?#]/, 1)[0]);
  if (!localPath.startsWith(root + path.sep) || !fs.existsSync(localPath)) {
    errors.push(`README image #${index + 1} references a missing or unsafe local path: ${source}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Profile README checks passed (${imageTags.length} images, contribution artwork preserved).`);
}
