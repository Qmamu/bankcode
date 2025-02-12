// app/[bank]/page.js
import { loadEntries, getAllBanks, getMostFrequentBankName, toSlug, fromSlug } from "@/lib/ifscUtils";
import { redirect, notFound } from "next/navigation";

export async function generateStaticParams() {
  const banks = getAllBanks(); // e.g. ["SBIN", "ESFB"]
  return banks.map((b) => ({ bank: b }));
}

export default function BankPage({ params }) {
  const { bank } = params; // "SBIN" or "ESFB"
  const entries = loadEntries(bank);

  if (!entries.length) {
    redirect("/");
  }

  const bankName = getMostFrequentBankName(entries, bank);
  // gather unique states
  const states = Array.from(new Set(entries.map((e) => e.STATE))).filter(Boolean);

  return (
    <main className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Bank: {bankName} ({bank})
      </h2>
      <h3 className="font-semibold mb-2">States for this bank:</h3>
      <ul className="list-disc list-inside">
        {states.map((s) => {
          // slugify the state so we don't have spaces
          const slug = toSlug(s);
          return (
            <li key={s}>
              <a href={`/${bank}/${slug}`} className="text-blue-600 underline">
                {s}
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export async function generateMetadata({ params }) {
  const { bank } = params;
  return {
    title: `Bank: ${bank}`,
    description: `Select a state for bank code ${bank}.`
  };
}

// import { loadEntries, getMostFrequentBankName } from "@/lib/ifscUtils";
// import { redirect, notFound } from "next/navigation";

// export default function BankPage({ params }) {
//   const { bank } = params;

//   // Load all entries for this bank
//   const entries = loadEntries(bank);

//   // If no entries found, bank does not exist => redirect or notFound
// //   if (entries.length === 0) {
// //     // EITHER redirect them home:
// //     redirect("/");

// //     // OR do a 404:
// //     // notFound();
// //   }

//   const bankName = getMostFrequentBankName(entries, bank);

//   return (
//     <main className="p-6">
//       <h1 className="text-2xl font-bold mb-4">
//         Bank: {bankName} ({bank})
//       </h1>
//       <p>Select a state from the form above.</p>
//     </main>
//   );
// }

// export async function generateMetadata({ params }) {
//   const { bank } = params;
//   return {
//     title: `Bank: ${bank}`,
//     description: `Page for bank code ${bank}.`,
//   };
// }
