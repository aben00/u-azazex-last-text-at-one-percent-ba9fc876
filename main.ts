// SPDX-License-Identifier: MIT
// Last Text at One Percent — make.fun entry.
// Writes one original line: the last text a phone sends at one percent
// battery, deterministically, to /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The entry line. The phone speaks in its own voice: a veteran of three
// years, thousands of charges and one cracked screen — and it dies doing
// the most regrettable thing a phone can do, mid-text to its owner's ex.
// The message itself is cut off mid-word, the way a dying battery cuts a
// sentence off. No battery pun, no charger goodbye, no will; the punch
// lands on the last word, which never arrives.
const ENTRY =
  "Three years, 4,112 charges, one cracked screen — and I die mid-text to your ex: 'I miss—'";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;

function codePointCount(text: string): number {
  return [...text].length;
}

function gateCheck(text: string): void {
  const chars = codePointCount(text);
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} characters, must be 1-${MAX_CHARS}`);
  }
  if (text.trim() !== text) {
    throw new Error("entry has leading or trailing whitespace");
  }
  if (text.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  for (const ch of text) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 && ch !== "\t") {
      throw new Error(`entry contains control character U+${code.toString(16).padStart(4, "0")}`);
    }
    if (code === 0x7f) {
      throw new Error("entry contains DEL character");
    }
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

gateCheck(ENTRY);

mkdirSync("/output", { recursive: true });
writeFileSync(OUTPUT_PATH, ENTRY, "utf8");

// Read back with strict UTF-8 decoding and verify byte-for-byte: what the
// grader reads must be exactly the line above, with no trailing newline
// added. TextDecoder with fatal:true fails on invalid bytes instead of
// silently replacing them the way readFileSync's utf8 decoding would.
const readBack = new TextDecoder("utf-8", { fatal: true }).decode(
  readFileSync(OUTPUT_PATH),
);
if (readBack !== ENTRY) {
  throw new Error("read-back mismatch: /output/entry.txt does not equal the entry line");
}

console.log(`Wrote ${codePointCount(ENTRY)}-character entry to ${OUTPUT_PATH}`);
console.log(ENTRY);
