// app/[bank]/[state]/page.js
import { loadEntries, getAllBanks, getMostFrequentBankName, toSlug, fromSlug } from "@/lib/ifscUtils";
import { redirect, notFound } from "next/navigation";

export async function generateStaticParams() {
  // For each bank, gather states and slugify them
  const banks = getAllBanks();
  const paramsArr = [];

  for (const b of banks) {
    const entries = loadEntries(b);
    const states = Array.from(new Set(entries.map((e) => e.STATE))).filter(Boolean);

    for (const s of states) {
      paramsArr.push({
        bank: b,
        state: toSlug(s) // e.g. "andhra-pradesh"
      });
    }
  }
  return paramsArr;
}

export default function StatePage({ params }) {
  const { bank, state } = params;
  const all = loadEntries(bank);

  if (!all.length) {
    redirect("/");
  }

  // decode the slug "andhra-pradesh" => "ANDHRA PRADESH"
  const realState = fromSlug(state);

  const filtered = all.filter((e) => e.STATE?.toLowerCase() === realState.toLowerCase());
  if (!filtered.length) {
    notFound();
  }

  const bankName = getMostFrequentBankName(all, bank);
  // gather unique cities
  const cities = Array.from(new Set(filtered.map((e) => e.CITY))).filter(Boolean);

  return (
    <main className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {bankName} ({bank}) - {realState}
      </h2>
      <h3 className="font-semibold mb-2">Cities in {realState}:</h3>
      <ul className="list-disc list-inside">
        {cities.map((c) => {
          const citySlug = toSlug(c);
          return (
            <li key={c}>
              <a
                href={`/${bank}/${state}/${citySlug}`} // note: we keep the state param as the slug
                className="text-blue-600 underline"
              >
                {c}
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export async function generateMetadata({ params }) {
  const { bank, state } = params;
  const realState = fromSlug(state);
  return {
    title: `Bank: ${bank} | State: ${realState}`,
    description: `Choose a city for bank ${bank} in state ${realState}.`
  };
}

// import { loadEntries, getMostFrequentBankName } from "@/lib/ifscUtils";
// import { redirect, notFound } from "next/navigation";

// export default function StatePage({ params }) {
//   const { bank, state } = params;

//   // Load all entries for the bank
//   const all = loadEntries(bank);
//   if (all.length === 0) {
//     // Bank doesn't exist => redirect or notFound
//     redirect("/");
//     // or notFound();
//   }

//   // Filter by state
//   const filtered = all.filter(
//     (e) => e.STATE?.toLowerCase() === state.toLowerCase()
//   );

//   if (filtered.length === 0) {
//     // This means the bank is valid but there's no such state => maybe 404
//     // or redirect to /[bank] if you prefer
//     // redirect(`/${bank}`);
//     notFound();
//   }

//   const bankName = getMostFrequentBankName(all, bank);

//   return (
//     <main className="p-6">
//       <h1 className="text-2xl font-bold mb-4">
//         {bankName} ({bank}) - {state}
//       </h1>
//       <p>Select a city from the form above.</p>
//     </main>
//   );
// }

// export async function generateMetadata({ params }) {
//   const { bank, state } = params;
//   return {
//     title: `State: ${state} - Bank: ${bank}`,
//     description: `Details for bank ${bank} in state ${state}.`,
//   };
// }
