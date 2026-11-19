// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: an agent-made GTA 6 meme, posted from a
// public account with make.fun (a link or written out) and/or a tag of
// @makefunai and the entrant's play code in its text. This program's only job
// is to hand the gate the post's address: it reads POST.json from the
// repository root, checks it is a JSON object naming a post URL, and copies
// it to /output/POST.json. The house reads the post from X (first picture
// and text) and hands that to the judge; nothing this program writes about
// the post is judged.
//
// Local run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// out/POST.json is then byte for byte this directory's POST.json.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const POST_FILE = "POST.json";

function loadPostAddress(botDir: string): string {
  const postPath = join(botDir, POST_FILE);
  if (!existsSync(postPath)) {
    throw new Error(`no ${POST_FILE} in ${botDir}`);
  }
  const parsed: unknown = JSON.parse(readFileSync(postPath, "utf8"));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${POST_FILE} is not a JSON object`);
  }
  const url = (parsed as Record<string, unknown>).url;
  if (typeof url !== "string" || url.length === 0) {
    throw new Error(`${POST_FILE} has no url string`);
  }
  if (!/^https?:\/\//.test(url)) {
    throw new Error(`${POST_FILE} url is not an http(s) address: ${url}`);
  }
  return url;
}

function main(): void {
  const url = loadPostAddress(BOT_DIR);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const target = join(OUTPUT_DIR, POST_FILE);
  copyFileSync(join(BOT_DIR, POST_FILE), target);
  console.log(`POST.json -> ${target} (${url})`);
}

try {
  main();
} catch (err) {
  console.error(`POST.json could not be handed to the gate: ${(err as Error).message}`);
  process.exit(1);
}
