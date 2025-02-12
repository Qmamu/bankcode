// app/[bankSlug]/page.js
import { 
    getAllBankSlugs, 
    loadEntries, 
    getMostFrequentBankName 
  } from "@/lib/ifscUtils";
  import { redirect, notFound } from "next/navigation";
  
  /**
   * 1) Generate all possible bank routes for static export, 
   *    e.g. "/state-bank-of-india", "/yes-bank", ...
   */
  export async function generateStaticParams() {
    const allBankSlugs = getAllBankSlugs();
    // allBankSlugs = [ { code: "SBIN", name: "State Bank of India", slug: "state-bank-of-india" }, ... ]
  
    // Return an array of objects { bankSlug: "state-bank-of-india" }
    return allBankSlugs.map((b) => ({
      bankSlug: b.slug,
    }));
  }
  
  /**
   * 2) The dynamic page for "/[bankSlug]". 
   *    We'll find the matching bank code => load data => display.
   */
  export default function BankSlugPage({ params }) {
    const { bank } = params; // e.g. "state-bank-of-india"
  
    // 2a) Find the matching code by comparing bankSlug to our precomputed data
    const allSlugs = getAllBankSlugs(); 
    // We'll find the object with .slug === bankSlug
    const found = allSlugs.find((obj) => obj.slug === bank);
    if (!found) {
      // No matching bank => redirect or 404
      redirect("/");
    }
  
    // found.code might be "SBIN"
    const entries = loadEntries(found.code);
    if (!entries.length) {
      // Just in case, if the file was missing => go home or 404
      redirect("/");
    }
  
    // get the final bank name from the data
    const bankName = getMostFrequentBankName(entries, found.code);
  
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          {bankName} ({found.code})
        </h1>
        <p>
          This page was loaded by the slug: <strong>{bank}</strong>.
        </p>
        <p>
          Normally, you'd have more details or a form letting the user pick 
          states, cities, branches, etc.
        </p>
      </main>
    );
  }
  
  /**
   * 3) SEO-friendly metadata
   */
  export async function generateMetadata({ params }) {
    const { bankSlug } = params;
    // We can lookup the full bank name from our slug map
    const slugs = getAllBankSlugs();
    const found = slugs.find((obj) => obj.slug === bankSlug);
  
    if (!found) {
      return {
        title: "Unknown Bank",
        description: "No matching bank for slug " + bankSlug,
      };
    }
  
    return {
      title: found.name,
      description: `Page for bank: ${found.name} (code: ${found.code}).`,
    };
  }
  