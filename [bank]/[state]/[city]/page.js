// app/[bank]/[state]/[city]/page.js
import {
  loadEntries,
  getAllBanks,
  getMostFrequentBankName,
  toSlug,
  fromSlug,
} from "@/lib/ifscUtils";
import { redirect, notFound } from "next/navigation";

export async function generateStaticParams() {
  const banks = getAllBanks();
  const paramsArr = [];

  for (const b of banks) {
    const entries = loadEntries(b);

    // group by states
    const uniqueStates = Array.from(new Set(entries.map((e) => e.STATE))).filter(Boolean);
    for (const st of uniqueStates) {
      const inState = entries.filter((e) => e.STATE === st);
      // group by cities
      const uniqueCities = Array.from(new Set(inState.map((x) => x.CITY))).filter(Boolean);

      for (const ci of uniqueCities) {
        paramsArr.push({
          bank: b,
          state: toSlug(st),
          city: toSlug(ci),
        });
      }
    }
  }
  return paramsArr;
}

export default function CityPage({ params }) {
  const { bank, state, city } = params;
  const all = loadEntries(bank);

  if (!all.length) {
    redirect("/");
  }

  const realState = fromSlug(state);
  const realCity = fromSlug(city);

  const filtered = all.filter(
    (e) =>
      e.STATE?.toLowerCase() === realState.toLowerCase() &&
      e.CITY?.toLowerCase() === realCity.toLowerCase()
  );
  if (!filtered.length) {
    notFound();
  }

  const bankName = getMostFrequentBankName(all, bank);
  const branches = Array.from(new Set(filtered.map((f) => f.BRANCH))).filter(Boolean);

  return (
    <main className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {bankName} ({bank}) - {realState} / {realCity}
      </h2>
      <h3 className="font-semibold mb-2">Branches in {realCity}:</h3>
      <ul className="list-disc list-inside">
        {branches.map((br) => {
          const brSlug = toSlug(br);
          return (
            <li key={br}>
              <a
                href={`/${bank}/${state}/${city}/${brSlug}`}
                className="text-blue-600 underline"
              >
                {br}
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export async function generateMetadata({ params }) {
  const { bank, state, city } = params;
  const realState = fromSlug(state);
  const realCity = fromSlug(city);

  return {
    title: `Bank: ${bank} | State: ${realState} | City: ${realCity}`,
    description: `Select a branch for ${bank} in ${realCity}, ${realState}.`,
  };
}


// import { loadEntries, getMostFrequentBankName } from "@/lib/ifscUtils";
// import { redirect, notFound } from "next/navigation";

// export default function CityPage({ params }) {
//   const { bank, state, city } = params;

//   // 1) Load all entries for the given bank
//   const allEntries = loadEntries(bank);

//   // 2) If the bank file doesn't exist (empty array), redirect home or 404
//   if (allEntries.length === 0) {
//     // Option A: Redirect to home
//     redirect("/");
//     // Option B: Show a 404 page
//     // notFound();
//   }

//   // 3) Filter by matching STATE + CITY
//   const filteredByCity = allEntries.filter((e) =>
//     e.STATE?.toLowerCase() === state.toLowerCase() &&
//     e.CITY?.toLowerCase() === city.toLowerCase()
//   );

//   if (filteredByCity.length === 0) {
//     // If there are no matching entries for the given city,
//     // either redirect up a level or throw a 404
//     notFound();
//     // or: redirect(`/${bank}/${state}`);
//   }

//   const bankName = getMostFrequentBankName(allEntries, bank);

//   return (
//     <main className="p-6">
//       <h1 className="text-xl font-bold mb-4">
//         {bankName} ({bank}) - {state} / {city}
//       </h1>
//       <p>
//         This is the city-level page. Use the global IFSC form (above) to select a
//         <strong> Branch</strong>.
//       </p>
//     </main>
//   );
// }

// /** SEO-friendly metadata for the city-level page */
// export async function generateMetadata({ params }) {
//   const { bank, state, city } = params;
//   return {
//     title: `City: ${city} | Bank: ${bank} in ${state}`,
//     description: `Choose a branch in ${city}, ${state} for bank ${bank}.`,
//   };
// }