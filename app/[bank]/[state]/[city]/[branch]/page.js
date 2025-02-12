// app/[bank]/[state]/[city]/[branch]/page.js
import { loadEntries, getAllBanks, getMostFrequentBankName, toSlug, fromSlug } from "@/lib/ifscUtils";
import { redirect, notFound } from "next/navigation";

export async function generateStaticParams() {
  const banks = getAllBanks();
  const paramsArr = [];

  for (const b of banks) {
    const entries = loadEntries(b);

    const states = Array.from(new Set(entries.map((e) => e.STATE))).filter(Boolean);
    for (const s of states) {
      const inState = entries.filter((x) => x.STATE === s);
      const cities = Array.from(new Set(inState.map((x) => x.CITY))).filter(Boolean);

      for (const c of cities) {
        const inCity = inState.filter((x) => x.CITY === c);
        const branches = Array.from(new Set(inCity.map((i) => i.BRANCH))).filter(Boolean);

        for (const br of branches) {
          paramsArr.push({
            bank: b,
            state: toSlug(s),
            city: toSlug(c),
            branch: toSlug(br)
          });
        }
      }
    }
  }

  return paramsArr;
}

export default function BranchPage({ params }) {
  const { bank, state, city, branch } = params;

  const all = loadEntries(bank);
  if (!all.length) {
    redirect("/");
  }

  const realState = fromSlug(state);
  const realCity = fromSlug(city);
  const realBranch = fromSlug(branch);

  const finalEntries = all.filter(
    (e) =>
      e.STATE?.toLowerCase() === realState.toLowerCase() &&
      e.CITY?.toLowerCase() === realCity.toLowerCase() &&
      e.BRANCH?.toLowerCase() === realBranch.toLowerCase()
  );

  if (!finalEntries.length) {
    notFound();
  }

  const bankName = getMostFrequentBankName(all, bank);

  return (
    <main className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {bankName} ({bank}) - {realState} / {realCity} / {realBranch}
      </h2>

      {finalEntries.map((item, idx) => (
        <div key={idx} className="border p-3 rounded mb-4">
          <p>
            <strong>IFSC:</strong> {item.IFSC}
          </p>
          <p>
            <strong>Address:</strong> {item.ADDRESS}
          </p>
          {/* Add more fields as needed */}
        </div>
      ))}
    </main>
  );
}

export async function generateMetadata({ params }) {
  const { bank, state, city, branch } = params;
  const realState = fromSlug(state);
  const realCity = fromSlug(city);
  const realBranch = fromSlug(branch);

  return {
    title: `IFSC: ${bank} - ${realState}, ${realCity}, ${realBranch}`,
    description: `Static route for branch ${realBranch} in ${realCity}, ${realState}, bank ${bank}.`
  };
}

// import { loadEntries, getMostFrequentBankName } from "@/lib/ifscUtils";

// export default function BranchPage({ params }) {
//   const { bank, state, city, branch } = params;

//   // Filter from local JSON
//   const all = loadEntries(bank);
//   const results = all.filter(
//     (r) =>
//       r.STATE?.toLowerCase() === state.toLowerCase() &&
//       r.CITY?.toLowerCase() === city.toLowerCase() &&
//       r.BRANCH?.toLowerCase() === branch.toLowerCase()
//   );

//   const bankName = getMostFrequentBankName(all, bank);

//   return (
//     <main className="p-6">
//       <h1 className="text-2xl font-bold mb-4">
//         {bankName} ({bank}) - {state} / {city} / {branch}
//       </h1>
//       {results.length === 0 ? (
//         <p className="text-gray-700">No records found.</p>
//       ) : (
//         results.map((item, idx) => (
//           <div key={idx} className="border p-3 rounded mb-4">
//             <p>
//               <strong>IFSC:</strong> {item.IFSC}
//             </p>
//             <p>
//               <strong>State:</strong> {item.STATE}
//             </p>
//             <p>
//               <strong>City:</strong> {item.CITY}
//             </p>
//             <p>
//               <strong>Branch:</strong> {item.BRANCH}
//             </p>
//             <p>
//               <strong>Address:</strong> {item.ADDRESS}
//             </p>
//           </div>
//         ))
//       )}
//     </main>
//   );
// }

// export async function generateMetadata({ params }) {
//   const { bank, state, city, branch } = params;
//   return {
//     title: `IFSC: ${bank} - ${state}, ${city}, ${branch}`,
//     description: `Details for bank ${bank}, branch ${branch} in ${city}, ${state}.`
//   };
// }
