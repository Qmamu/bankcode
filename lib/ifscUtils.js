// lib/ifscUtils.js
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

/** Return all bank codes (file names minus .json). e.g. ["SBIN", "YESB"] */
export function getAllBanks() {
  return fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

/** Load all IFSC entries for a given bankCode. Returns [] if file doesn't exist. */
export function loadEntries(bankCode = null) {
  let files = [];
  if (bankCode) {
    const filePath = path.join(dataDir, `${bankCode}.json`);
    if (fs.existsSync(filePath)) {
      files.push(filePath);
    }
  } else {
    // load all
    files = fs
      .readdirSync(dataDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(dataDir, f));
  }

  let allEntries = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw);
    allEntries.push(...Object.values(parsed));
  }
  return allEntries;
}

/** Find the most frequent BANK name among entries, fallback to bankCode if uncertain. */
export function getMostFrequentBankName(entries, bankCode) {
  const map = {};
  for (const e of entries) {
    const name = e.BANK || bankCode; // e.g. "State Bank of India"
    map[name] = (map[name] || 0) + 1;
  }
  let bestName = "";
  let bestCount = 0;
  for (const [k, cnt] of Object.entries(map)) {
    if (cnt > bestCount) {
      bestName = k;
      bestCount = cnt;
    }
  }
  return bestName || bankCode; // fallback
}

/** Convert "State Bank of India" -> "state-bank-of-india" (remove spaces, lowercase). */
export function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[()]/g, ""); // remove parentheses, etc. if needed
}

/** Optionally convert "state-bank-of-india" -> "State Bank Of India" or similar. */
export function fromSlug(slug) {
  // For a simple approach:
  return slug.replace(/-/g, " ").toLowerCase();
}

/** Return array of { code, name, slug }, one for each bank. 
    e.g. { code: "SBIN", name: "State Bank of India", slug: "state-bank-of-india" } */
export function getAllBankSlugs() {
  const codes = getAllBanks(); // e.g. ["SBIN", "YESB"]
  const results = [];

  for (const c of codes) {
    const entries = loadEntries(c);
    const freqName = getMostFrequentBankName(entries, c); // e.g. "State Bank of India"
    const slug = toSlug(freqName); // e.g. "state-bank-of-india"
    results.push({ code: c, name: freqName, slug });
  }

  return results;
}
