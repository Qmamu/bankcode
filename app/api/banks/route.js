import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Define the path to the data folder
    const dataFolder = path.join(process.cwd(), "data");
    const files = await fs.readdir(dataFolder);

    let allBanks = [];
    let ifscToFileMap = {}; // Map IFSC first 4 digits to their filename occurrences

    // Read all files in the data folder
    for (const file of files) {
      try {
        const filePath = path.join(dataFolder, file);
        const fileData = await fs.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileData);

        // Get file name without extension
        const fileKey = path.basename(file, ".json");

        Object.values(jsonData).forEach((entry) => {
          const ifscPrefix = entry.IFSC.slice(0, 4);
          allBanks.push({ ...entry, file: fileKey, ifscPrefix });

          // Count occurrences of IFSC prefixes per file
          if (!ifscToFileMap[ifscPrefix]) {
            ifscToFileMap[ifscPrefix] = {};
          }
          ifscToFileMap[ifscPrefix][fileKey] = (ifscToFileMap[ifscPrefix][fileKey] || 0) + 1;
        });
      } catch (err) {
        console.error(`Error reading or parsing file ${file}:`, err.message);
      }
    }

    if (allBanks.length === 0) {
      throw new Error("No valid bank data found.");
    }

    // Determine the most used name for each IFSC prefix
    const uniqueBanks = Object.entries(ifscToFileMap).map(([ifscPrefix, fileCounts]) => {
      // Find the file with the highest count for this IFSC prefix
      const mostUsedFile = Object.entries(fileCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

      // Get the first bank name from the most used file for this IFSC prefix
      const bankName = allBanks.find((entry) => entry.file === mostUsedFile && entry.ifscPrefix === ifscPrefix)?.BANK;

      return { ifscPrefix, bank: bankName, file: mostUsedFile };
    });

    // Return the unique banks with their most used names
    return NextResponse.json({ banks: uniqueBanks });
  } catch (error) {
    console.error("Error in GET /api/banks:", error.message);
    // Handle errors and return a failure response
    return NextResponse.json({ error: "Failed to load bank data" }, { status: 500 });
  }
}
