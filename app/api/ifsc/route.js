import fs from "fs";
import path from "path";
import { toSlug } from "@/lib/ifscUtils";

// In-memory cache
const fileCache = new Map();

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const mode = searchParams.get("mode"); // banks | states | cities | branches
    const bank = searchParams.get("bank"); // e.g. "SBIN"
    const state = searchParams.get("state");
    const city = searchParams.get("city");

    // Path to the /data folder
    const dataDir = path.join(process.cwd(), "data");

    // Helper function to read and cache files
    const getFileData = (filePath) => {
      if (fileCache.has(filePath)) {
        return fileCache.get(filePath);
      }

      if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, "utf-8");
        const parsedData = JSON.parse(rawData);
        fileCache.set(filePath, parsedData); // Cache the parsed data
        return parsedData;
      }

      return null;
    };

    // Decide which .json files to read
    let bankFiles = [];
    if (bank) {
      // If a specific bank code was provided, read only that file if it exists
      const filePath = path.join(dataDir, `${bank}.json`);
      if (fs.existsSync(filePath)) {
        bankFiles.push(filePath);
      }
    } else {
      // Otherwise, read all .json files
      bankFiles = fs
        .readdirSync(dataDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => path.join(dataDir, f));
    }

    // Combine all entries from the selected files
    let allEntries = [];
    for (const file of bankFiles) {
      const parsed = getFileData(file);
      if (parsed) {
        allEntries.push(...Object.values(parsed));
      }
    }

    // Optionally filter by state / city
    if (state) {
      allEntries = allEntries.filter((e) => e.STATE?.toLowerCase() === state.toLowerCase());
    }
    if (city) {
      allEntries = allEntries.filter((e) => e.CITY?.toLowerCase() === city.toLowerCase());
    }

    // Now respond according to the mode
    if (mode === "banks") {
      const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

      const bankList = [];

      for (const file of files) {
        const code = file.replace(".json", "");
        const parsed2 = getFileData(path.join(dataDir, file));
        if (!parsed2) continue;
        const entries = Object.values(parsed2);

        // Tally the most frequent bank name
        const nameCount = {};
        for (const rec of entries) {
          const bankName = rec.BANK || code;
          nameCount[bankName] = (nameCount[bankName] || 0) + 1;
        }

        let bestName = "";
        let bestCount = 0;
        for (const [bankName, cnt] of Object.entries(nameCount)) {
          if (cnt > bestCount) {
            bestName = bankName;
            bestCount = cnt;
          }
        }

        const slug = toSlug(bestName);
        bankList.push({ code, name: bestName, slug });
      }

      bankList.sort((a, b) => a.name.localeCompare(b.name));

      return new Response(JSON.stringify({ data: bankList }), { status: 200 });
    }

    if (mode === "states") {
      const states = Array.from(new Set(allEntries.map((e) => e.STATE))).filter(Boolean);
      states.sort((a, b) => a.localeCompare(b));
      return new Response(JSON.stringify({ data: states }), { status: 200 });
    }

    if (mode === "cities") {
      const cities = Array.from(new Set(allEntries.map((e) => e.CITY))).filter(Boolean);
      cities.sort((a, b) => a.localeCompare(b));
      return new Response(JSON.stringify({ data: cities }), { status: 200 });
    }

    if (mode === "branches") {
      const branches = Array.from(new Set(allEntries.map((e) => e.BRANCH))).filter(Boolean);
      branches.sort((a, b) => a.localeCompare(b));
      return new Response(JSON.stringify({ data: branches }), { status: 200 });
    }

    return new Response(JSON.stringify({ data: allEntries }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// import fs from "fs";
// import path from "path";
// import { toSlug } from "@/lib/ifscUtils";

// export async function GET(request) {
//   try {
//     const { searchParams } = request.nextUrl;
//     const mode = searchParams.get("mode"); // banks | states | cities | branches
//     const bank = searchParams.get("bank"); // e.g. "SBIN"
//     const state = searchParams.get("state");
//     const city = searchParams.get("city");

//     // Path to the /data folder
//     const dataDir = path.join(process.cwd(), "data");

//     // Decide which .json files to read
//     let bankFiles = [];
//     if (bank) {
//       // If a specific bank code was provided, read only that file if it exists
//       const filePath = path.join(dataDir, `${bank}.json`);
//       if (fs.existsSync(filePath)) {
//         bankFiles.push(filePath);
//       }
//     } else {
//       // Otherwise, read all .json files
//       bankFiles = fs
//         .readdirSync(dataDir)
//         .filter((f) => f.endsWith(".json"))
//         .map((f) => path.join(dataDir, f));
//     }

//     // Combine all entries from the selected files
//     let allEntries = [];
//     for (const file of bankFiles) {
//       const raw = fs.readFileSync(file, "utf-8");
//       const parsed = JSON.parse(raw);
//       allEntries.push(...Object.values(parsed));
//     }

//     // Optionally filter by state / city
//     if (state) {
//       allEntries = allEntries.filter((e) => e.STATE?.toLowerCase() === state.toLowerCase());
//     }
//     if (city) {
//       allEntries = allEntries.filter((e) => e.CITY?.toLowerCase() === city.toLowerCase());
//     }

//     // Now respond according to the mode
//     if (mode === "banks") {
//       // We want a list of all banks with code, name, and slug
//       // => We'll read all JSON files
//       const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

//       const bankList = [];

//       for (const file of files) {
//         // e.g. "SBIN.json" => code = "SBIN"
//         const code = file.replace(".json", "");
//         const raw2 = fs.readFileSync(path.join(dataDir, file), "utf-8");
//         const parsed2 = JSON.parse(raw2);
//         const entries = Object.values(parsed2);

//         // Tally the most frequent bank name
//         const nameCount = {};
//         for (const rec of entries) {
//           const bankName = rec.BANK || code;
//           nameCount[bankName] = (nameCount[bankName] || 0) + 1;
//         }

//         let bestName = "";
//         let bestCount = 0;
//         for (const [bankName, cnt] of Object.entries(nameCount)) {
//           if (cnt > bestCount) {
//             bestName = bankName;
//             bestCount = cnt;
//           }
//         }

//         // Convert bestName => a slug, e.g. "State Bank of India" => "state-bank-of-india"
//         const slug = toSlug(bestName);
//         bankList.push({ code, name: bestName, slug });
//       }

//       // Sort by name
//       bankList.sort((a, b) => a.name.localeCompare(b.name));

//       return new Response(JSON.stringify({ data: bankList }), { status: 200 });
//     }

//     if (mode === "states") {
//       // Unique states from filtered entries
//       const states = Array.from(new Set(allEntries.map((e) => e.STATE))).filter(Boolean);
//       states.sort((a, b) => a.localeCompare(b));
//       return new Response(JSON.stringify({ data: states }), { status: 200 });
//     }

//     if (mode === "cities") {
//       // Unique cities
//       const cities = Array.from(new Set(allEntries.map((e) => e.CITY))).filter(Boolean);
//       cities.sort((a, b) => a.localeCompare(b));
//       return new Response(JSON.stringify({ data: cities }), { status: 200 });
//     }

//     if (mode === "branches") {
//       // Unique branches
//       const branches = Array.from(new Set(allEntries.map((e) => e.BRANCH))).filter(Boolean);
//       branches.sort((a, b) => a.localeCompare(b));
//       return new Response(JSON.stringify({ data: branches }), { status: 200 });
//     }

//     // If no mode provided, return all the filtered entries
//     return new Response(JSON.stringify({ data: allEntries }), { status: 200 });
//   } catch (err) {
//     return new Response(JSON.stringify({ error: err.message }), { status: 500 });
//   }
// }

// import fs from "fs";
// import path from "path";
// import { getAllBanks, loadEntries, getMostFrequentBankName, toSlug } from "@/lib/ifscUtils";

// export async function GET(request) {
//   try {
//     const { searchParams } = request.nextUrl;
//     const mode = searchParams.get("mode"); // banks | states | cities | branches
//     const bank = searchParams.get("bank");
//     const state = searchParams.get("state");
//     const city = searchParams.get("city");

//     const dataDir = path.join(process.cwd(), "data");

//     // Figure out which files to read
//     let bankFiles = [];
//     if (bank) {
//       const filePath = path.join(dataDir, `${bank}.json`);
//       if (fs.existsSync(filePath)) {
//         bankFiles.push(filePath);
//       }
//     } else {
//       bankFiles = fs
//         .readdirSync(dataDir)
//         .filter((f) => f.endsWith(".json"))
//         .map((f) => path.join(dataDir, f));
//     }

//     // Combine all entries
//     let allEntries = [];
//     for (const file of bankFiles) {
//       const raw = fs.readFileSync(file, "utf-8");
//       const parsed = JSON.parse(raw);
//       allEntries.push(...Object.values(parsed));
//     }

//     // Filter if needed
//     if (state) {
//       allEntries = allEntries.filter(
//         (e) => e.STATE?.toLowerCase() === state.toLowerCase()
//       );
//     }
//     if (city) {
//       allEntries = allEntries.filter(
//         (e) => e.CITY?.toLowerCase() === city.toLowerCase()
//       );
//     }

//     // Return mode-based data
//     if (mode === "banks") {
//       // Return a list of { code, name }
//       // We'll read all JSON files because user wants to see all banks
//       const files = fs
//         .readdirSync(dataDir)
//         .filter((f) => f.endsWith(".json"));
//       const bankList = [];

//       for (const f of files) {
//         const code = f.replace(".json", "");
//         const raw2 = fs.readFileSync(path.join(dataDir, f), "utf-8");
//         const parsed2 = JSON.parse(raw2);
//         const entries = Object.values(parsed2);

//         // Find the most frequent BANK name
//         const nameCount = {};
//         for (const ent of entries) {
//           const bn = ent.BANK || code;
//           nameCount[bn] = (nameCount[bn] || 0) + 1;
//         }
//         let bestName = "";
//         let bestCount = 0;
//         for (const [k, cnt] of Object.entries(nameCount)) {
//           if (cnt > bestCount) {
//             bestName = k;
//             bestCount = cnt;
//           }
//         }
//         bankList.push({ code, name: bestName });
//       }
//       bankList.sort((a, b) => a.name.localeCompare(b.name));
//       return new Response(JSON.stringify({ data: bankList }), { status: 200 });
//     }

//     if (mode === "states") {
//       const states = Array.from(new Set(allEntries.map((e) => e.STATE))).filter(Boolean);
//       states.sort((a, b) => a.localeCompare(b));
//       return new Response(JSON.stringify({ data: states }), { status: 200 });
//     }

//     if (mode === "cities") {
//       const cities = Array.from(new Set(allEntries.map((e) => e.CITY))).filter(Boolean);
//       cities.sort((a, b) => a.localeCompare(b));
//       return new Response(JSON.stringify({ data: cities }), { status: 200 });
//     }

//     if (mode === "branches") {
//       const branches = Array.from(new Set(allEntries.map((e) => e.BRANCH))).filter(Boolean);
//       branches.sort((a, b) => a.localeCompare(b));
//       return new Response(JSON.stringify({ data: branches }), { status: 200 });
//     }

//     // Default: return everything
//     return new Response(JSON.stringify({ data: allEntries }), { status: 200 });
//   } catch (err) {
//     return new Response(
//       JSON.stringify({ error: err.message }),
//       { status: 500 }
//     );
//   }
// }

// import fs from 'fs';
// import path from 'path';

// export async function GET(request) {
//   try {
//     const { searchParams } = request.nextUrl;

//     const mode = searchParams.get("mode");    // "banks" | "states" | "cities" | "branches"
//     const bankCode = searchParams.get("bank");
//     const state = searchParams.get("state");
//     const city = searchParams.get("city");    // note: changed from "district" to "city"
//     const branch = searchParams.get("branch");

//     // Path to the /data folder
//     const dataDir = path.join(process.cwd(), 'data');

//     // 1) Figure out which files to read
//     let bankFiles = [];
//     if (bankCode) {
//       // If a bank code is given, read only that bank’s JSON (if it exists)
//       const specificFile = path.join(dataDir, `${bankCode}.json`);
//       if (fs.existsSync(specificFile)) {
//         bankFiles.push(specificFile);
//       }
//     } else {
//       // Otherwise, read all JSON files
//       bankFiles = fs
//         .readdirSync(dataDir)
//         .filter((file) => file.endsWith('.json'))
//         .map((file) => path.join(dataDir, file));
//     }

//     // 2) Combine all entries from selected files
//     let allEntries = [];
//     for (const file of bankFiles) {
//       const rawData = fs.readFileSync(file, 'utf-8');
//       const jsonData = JSON.parse(rawData);
//       allEntries = [...allEntries, ...Object.values(jsonData)];
//     }

//     // 3) Filter by state / city / branch if provided
//     let filteredEntries = allEntries.filter((item) => {
//       if (state && item.STATE?.toLowerCase() !== state.toLowerCase()) return false;
//       if (city && item.CITY?.toLowerCase() !== city.toLowerCase()) return false;
//       if (branch && item.BRANCH?.toLowerCase() !== branch.toLowerCase()) return false;
//       return true;
//     });

//     // 4) "mode" determines what data we return
//     if (mode === "banks") {
//       // Return a list of all possible { code, name } for each JSON file
//       // We'll parse each file fully to find the *most commonly used* bank name or confirm a single consistent name

//       // 4a) Read all .json files (not just filtered by bankCode)
//       const allDataFiles = fs
//         .readdirSync(dataDir)
//         .filter((f) => f.endsWith('.json'));

//       let bankList = [];

//       for (const file of allDataFiles) {
//         const code = file.replace('.json', ''); // e.g. "SBIN", "YESB", "ABHY"
//         const fullPath = path.join(dataDir, file);
//         const raw = fs.readFileSync(fullPath, 'utf-8');
//         const parsed = JSON.parse(raw);
//         const entries = Object.values(parsed);

//         // Collect all bank names in this file
//         const nameCount = {};
//         for (const entry of entries) {
//           const bankName = entry.BANK || code;
//           if (!nameCount[bankName]) {
//             nameCount[bankName] = 0;
//           }
//           nameCount[bankName]++;
//         }

//         // Find the most frequently used bank name
//         let bestName = "";
//         let bestCount = 0;
//         for (const [bn, cnt] of Object.entries(nameCount)) {
//           if (cnt > bestCount) {
//             bestName = bn;
//             bestCount = cnt;
//           }
//         }

//         bankList.push({ code, name: bestName });
//       }

//       // Sort alphabetically by `name`
//       bankList.sort((a, b) => a.name.localeCompare(b.name));

//       return new Response(JSON.stringify({ data: bankList }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (mode === "states") {
//       // Collect unique states from filteredEntries
//       let uniqueStates = Array.from(new Set(filteredEntries.map((item) => item.STATE))).filter(Boolean);
//       // Sort alphabetically
//       uniqueStates.sort((a, b) => a.localeCompare(b));
//       return new Response(JSON.stringify({ data: uniqueStates }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (mode === "cities") {
//       // Return unique CITY values from filteredEntries
//       let uniqueCities = Array.from(new Set(filteredEntries.map((item) => item.CITY))).filter(Boolean);
//       // Sort alphabetically
//       uniqueCities.sort((a, b) => a.localeCompare(b));
//       return new Response(JSON.stringify({ data: uniqueCities }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (mode === "branches") {
//       // Return unique BRANCH values
//       let uniqueBranches = Array.from(new Set(filteredEntries.map((item) => item.BRANCH))).filter(Boolean);
//       // Sort alphabetically
//       uniqueBranches.sort((a, b) => a.localeCompare(b));
//       return new Response(JSON.stringify({ data: uniqueBranches }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // If no "mode", return the fully filtered IFSC records themselves
//     return new Response(JSON.stringify({ data: filteredEntries }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     return new Response(
//       JSON.stringify({ error: error.message }),
//       {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
//   }
// }

// import fs from 'fs';
// import path from 'path';

// export async function GET(request) {
//   try {
//     const { searchParams } = request.nextUrl;

//     const mode = searchParams.get("mode");       // banks | states | districts | branches
//     const bankCode = searchParams.get("bank");   // e.g. SBIN, YESB
//     const state = searchParams.get("state");     // e.g. WEST BENGAL
//     const district = searchParams.get("district");
//     const branch = searchParams.get("branch");

//     // Path to the /data folder
//     const dataDir = path.join(process.cwd(), 'data');

//     // Gather list of JSON files to read:
//     let bankFiles = [];
//     if (bankCode) {
//       // If we have a specific bank code, read only that file if it exists
//       const specificFile = path.join(dataDir, `${bankCode}.json`);
//       if (fs.existsSync(specificFile)) {
//         bankFiles.push(specificFile);
//       }
//     } else {
//       // Otherwise, read all *.json files
//       bankFiles = fs
//         .readdirSync(dataDir)
//         .filter((file) => file.endsWith('.json'))
//         .map((file) => path.join(dataDir, file));
//     }

//     // Combine all entries from the relevant JSON files
//     let allEntries = [];
//     for (const file of bankFiles) {
//       const rawData = fs.readFileSync(file, 'utf-8');
//       const jsonData = JSON.parse(rawData);
//       allEntries = [...allEntries, ...Object.values(jsonData)];
//     }

//     // Filter the combined entries
//     // (We apply the same filter logic in each case, but might only partially apply them)
//     let filteredEntries = allEntries.filter((item) => {
//       if (state && item.STATE?.toLowerCase() !== state.toLowerCase()) return false;
//       if (district && item.DISTRICT?.toLowerCase() !== district.toLowerCase()) return false;
//       if (branch && item.BRANCH?.toLowerCase() !== branch.toLowerCase()) return false;
//       return true;
//     });

//     // If "mode" is specified, return unique items for that mode
//     if (mode === "banks") {
//       // Return all unique bank codes and the official bank name
//       // For example: [{ code: "SBIN", name: "State Bank of India" }, { code: "YESB", name: "Yes Bank" }, ...]
//       const allDataDir = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
//       const bankList = [];
//       for (const file of allDataDir) {
//         const code = file.replace('.json', ''); // e.g. "SBIN", "YESB"
//         // Read the first record inside that file to get the official bank name
//         const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
//         const parsed = JSON.parse(raw);
//         const firstKey = Object.keys(parsed)[0];
//         if (firstKey) {
//           bankList.push({
//             code,
//             name: parsed[firstKey].BANK ?? code,
//           });
//         }
//       }
//       // Sort by name or code if you wish
//       return new Response(JSON.stringify({ data: bankList }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (mode === "states") {
//       // Return unique states from filteredEntries
//       // If bankCode is provided, we've already read only that bank's file.
//       const uniqueStates = Array.from(
//         new Set(filteredEntries.map((item) => item.STATE))
//       ).filter(Boolean); // remove falsy values if any
//       return new Response(JSON.stringify({ data: uniqueStates }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (mode === "districts") {
//       const uniqueDistricts = Array.from(
//         new Set(filteredEntries.map((item) => item.DISTRICT))
//       ).filter(Boolean);
//       return new Response(JSON.stringify({ data: uniqueDistricts }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     if (mode === "branches") {
//       const uniqueBranches = Array.from(
//         new Set(filteredEntries.map((item) => item.BRANCH))
//       ).filter(Boolean);
//       return new Response(JSON.stringify({ data: uniqueBranches }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // If no "mode", return the fully filtered data
//     return new Response(JSON.stringify({ data: filteredEntries }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     return new Response(
//       JSON.stringify({ error: error.message }),
//       {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
//   }
// }
