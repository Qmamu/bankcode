"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[()]/g, ""); // remove parentheses etc. if needed
}

/**
 * A client component that:
 * - Fetches lists of banks, states, cities, branches from /api/ifsc
 * - Stores user selection in local state
 * - Slugifies state, city, branch in the path
 * - Immediately updates the path whenever a selection changes
 *
 * This avoids raw spaces in the URL (e.g. "ANDHRA PRADESH"),
 * preventing the "NormalizeError" during static export.
 */
export default function IFSCForm() {
  const router = useRouter();
  const currentPath = usePathname(); // e.g. "/SBIN/andhra-pradesh"

  // Step-by-step selections
  const [bank, setBank] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [cityVal, setCityVal] = useState("");
  const [branchVal, setBranchVal] = useState("");

  // Data lists for dropdowns
  const [banks, setBanks] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [branches, setBranches] = useState([]);

  /**
   * 1) On mount: fetch all banks
   *    e.g. GET /api/ifsc?mode=banks => { data: [{ code: "SBIN", name: "State Bank..."}, ...] }
   */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ifsc?mode=banks");
        const json = await res.json();
        setBanks(json.data || []);
      } catch (err) {
        console.error("Error fetching banks:", err);
      }
    })();
  }, []);

  /**
   * 2) Whenever 'bank' changes: fetch states => /api/ifsc?mode=states&bank=SBIN
   *    Reset subsequent selections
   */
  useEffect(() => {
    if (!bank) {
      setStates([]);
      setStateVal("");
      setCities([]);
      setCityVal("");
      setBranches([]);
      setBranchVal("");
      return;
    }
    (async () => {
      try {
        const url = `/api/ifsc?mode=states&bank=${bank}`;
        const res = await fetch(url);
        const json = await res.json();
        setStates(json.data || []);
        setStateVal("");
        setCities([]);
        setCityVal("");
        setBranches([]);
        setBranchVal("");
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    })();
  }, [bank]);

  /**
   * 3) Whenever 'stateVal' changes: fetch cities => /api/ifsc?mode=cities&bank=SBIN&state=ANDHRA%20PRADESH
   */
  useEffect(() => {
    if (!bank || !stateVal) {
      setCities([]);
      setCityVal("");
      setBranches([]);
      setBranchVal("");
      return;
    }
    (async () => {
      try {
        const encState = encodeURIComponent(stateVal);
        const url = `/api/ifsc?mode=cities&bank=${bank}&state=${encState}`;
        const res = await fetch(url);
        const json = await res.json();
        setCities(json.data || []);
        setCityVal("");
        setBranches([]);
        setBranchVal("");
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    })();
  }, [stateVal, bank]);

  /**
   * 4) Whenever 'cityVal' changes: fetch branches => /api/ifsc?mode=branches&bank=SBIN&state=ANDHRA%20PRADESH&city=VIJAYAWADA
   */
  useEffect(() => {
    if (!bank || !stateVal || !cityVal) {
      setBranches([]);
      setBranchVal("");
      return;
    }
    (async () => {
      try {
        const encState = encodeURIComponent(stateVal);
        const encCity = encodeURIComponent(cityVal);
        const url = `/api/ifsc?mode=branches&bank=${bank}&state=${encState}&city=${encCity}`;
        const res = await fetch(url);
        const json = await res.json();
        setBranches(json.data || []);
        setBranchVal("");
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    })();
  }, [cityVal, stateVal, bank]);

  /**
   * 5) Watch for changes to (bank, stateVal, cityVal, branchVal).
   *    We slugify state/city/branch => push the new route:
   *      /[bank]                 (if only bank)
   *      /[bank]/[slugState]     (if bank & state)
   *      /[bank]/[slugState]/[slugCity]
   *      /[bank]/[slugState]/[slugCity]/[slugBranch]
   */
  useEffect(() => {
    // If no bank => go to root

    if (!bank) {
      if (currentPath !== "/") {
        router.push("/");
      }
      return;
    }

    
    
    // Bank but no state => e.g. "/SBIN"
    if (bank && !stateVal) {
      const datas = banks?.filter((item) => item.code === bank);
      const banko = datas[0]?.slug;
      console.log(
        "bank",
        banko
      );

      router.push(`/${banko}`);
      return;
    }

    // Bank, State => e.g. "/SBIN/andhra-pradesh"
    if (bank && stateVal && !cityVal) {
      router.push(`/${bank}/${toSlug(stateVal)}`);
      return;
    }

    // Bank, State, City => e.g. "/SBIN/andhra-pradesh/vijayawada"
    if (bank && stateVal && cityVal && !branchVal) {
      router.push(`/${bank}/${toSlug(stateVal)}/${toSlug(cityVal)}`);
      return;
    }

    // Bank, State, City, Branch => e.g. "/SBIN/andhra-pradesh/vijayawada/m-g-road"
    if (bank && stateVal && cityVal && branchVal) {
      router.push(`/${bank}/${toSlug(stateVal)}/${toSlug(cityVal)}/${toSlug(branchVal)}`);
    }
  }, [bank, stateVal, cityVal, branchVal]);

  // Render the 4 dropdowns
  return (
    <div className="p-4 border-b bg-gray-50">
      <h2 className="text-lg font-bold mb-2">IFSC Lookup (Slug Approach)</h2>

      {/* Bank dropdown */}
      <div className="mb-2">
        <label className="block font-semibold mb-1">Bank</label>
        <select className="border rounded px-2 py-1 w-72" value={bank} onChange={(e) => setBank(e.target.value)}>
          <option value="">-- Select Bank --</option>
          {banks.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} ({item.code})
            </option>
          ))}
        </select>
      </div>

      {/* State dropdown */}
      <div className="mb-2">
        <label className="block font-semibold mb-1">State</label>
        <select
          className="border rounded px-2 py-1 w-72"
          value={stateVal}
          onChange={(e) => setStateVal(e.target.value)}
          disabled={!bank}
        >
          <option value="">-- Select State --</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* City dropdown */}
      <div className="mb-2">
        <label className="block font-semibold mb-1">City</label>
        <select
          className="border rounded px-2 py-1 w-72"
          value={cityVal}
          onChange={(e) => setCityVal(e.target.value)}
          disabled={!stateVal}
        >
          <option value="">-- Select City --</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Branch dropdown */}
      <div className="mb-2">
        <label className="block font-semibold mb-1">Branch</label>
        <select
          className="border rounded px-2 py-1 w-72"
          value={branchVal}
          onChange={(e) => setBranchVal(e.target.value)}
          disabled={!cityVal}
        >
          <option value="">-- Select Branch --</option>
          {branches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { usePathname, useRouter } from "next/navigation";

// /**
//  * A client component that fetches banks/states/cities/branches from /api/ifsc
//  * and updates the route path in real time as the user selects.
//  */
// export default function IFSCForm() {
//   const router = useRouter();
//   const currentPath = usePathname();

//   const [allBanks, setAllBanks] = useState([]);
//   const [bank, setBank] = useState("");
//   const [stateVal, setStateVal] = useState("");
//   const [city, setCity] = useState("");
//   const [branch, setBranch] = useState("");

//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [branches, setBranches] = useState([]);

//   // 1) Fetch all banks on mount
//   useEffect(() => {
//     async function fetchBanks() {
//       try {
//         const res = await fetch("/api/ifsc?mode=banks");
//         const data = await res.json();
//         if (data.data) {
//           setAllBanks(data.data);
//         }
//       } catch (err) {
//         console.error("Failed to load banks:", err);
//       }
//     }
//     fetchBanks();
//   }, []);

//   // 2) If user changes bank, fetch states & reset next fields
//   useEffect(() => {
//     if (!bank) {
//       setStates([]);
//       setStateVal("");
//       setCities([]);
//       setCity("");
//       setBranches([]);
//       setBranch("");
//       return;
//     }
//     async function fetchStates() {
//       try {
//         const res = await fetch(`/api/ifsc?mode=states&bank=${bank}`);
//         const data = await res.json();
//         setStates(data.data || []);
//         setStateVal("");
//         setCities([]);
//         setCity("");
//         setBranches([]);
//         setBranch("");
//       } catch (err) {
//         console.error("Failed to load states:", err);
//       }
//     }
//     fetchStates();
//   }, [bank]);

//   // 3) If user changes state, fetch cities
//   useEffect(() => {
//     if (!bank || !stateVal) {
//       setCities([]);
//       setCity("");
//       setBranches([]);
//       setBranch("");
//       return;
//     }
//     async function fetchCities() {
//       try {
//         const s = encodeURIComponent(stateVal);
//         const res = await fetch(`/api/ifsc?mode=cities&bank=${bank}&state=${s}`);
//         const data = await res.json();
//         setCities(data.data || []);
//         setCity("");
//         setBranches([]);
//         setBranch("");
//       } catch (err) {
//         console.error("Failed to load cities:", err);
//       }
//     }
//     fetchCities();
//   }, [bank, stateVal]);

//   // 4) If user changes city, fetch branches
//   useEffect(() => {
//     if (!bank || !stateVal || !city) {
//       setBranches([]);
//       setBranch("");
//       return;
//     }
//     async function fetchBranches() {
//       try {
//         const s = encodeURIComponent(stateVal);
//         const c = encodeURIComponent(city);
//         const res = await fetch(`/api/ifsc?mode=branches&bank=${bank}&state=${s}&city=${c}`);
//         const data = await res.json();
//         setBranches(data.data || []);
//         setBranch("");
//       } catch (err) {
//         console.error("Failed to load branches:", err);
//       }
//     }
//     fetchBranches();
//   }, [bank, stateVal, city]);

//   /**
//    * Watch for changes to the 4 fields: bank, state, city, branch.
//    * Whenever they change, push a new route immediately:
//    * /bank
//    * /bank/state
//    * /bank/state/city
//    * /bank/state/city/branch
//    */
//   useEffect(() => {
//     // If none selected, go to root
//     if (!bank) {
//       if (currentPath !== "/") {
//         router.push("/");
//       }
//       return;
//     }

//     // If only bank selected
//     if (bank && !stateVal) {
//       router.push(`/${bank}`);
//       return;
//     }

//     // If bank & state selected
//     if (bank && stateVal && !city) {
//       router.push(`/${bank}/${encodeURIComponent(stateVal)}`);
//       return;
//     }

//     // If bank, state, city selected
//     if (bank && stateVal && city && !branch) {
//       router.push(`/${bank}/${encodeURIComponent(stateVal)}/${encodeURIComponent(city)}`);
//       return;
//     }

//     // If all 4 selected
//     if (bank && stateVal && city && branch) {
//       router.push(`/${bank}/${encodeURIComponent(stateVal)}/${encodeURIComponent(city)}/${encodeURIComponent(branch)}`);
//       return;
//     }
//   }, [bank, stateVal, city, branch]);

//   return (
//     <div className="border-b bg-gray-50 p-4">
//       <h2 className="text-lg font-bold mb-2">Global IFSC Lookup Form</h2>
//       {/* Bank */}
//       <div className="mb-2">
//         <label className="block font-semibold">Bank</label>
//         <select
//           className="border rounded px-2 py-1 w-72"
//           value={bank}
//           onChange={(e) => setBank(e.target.value)}
//         >
//           <option value="">-- Select Bank --</option>
//           {allBanks.map((b) => (
//             <option key={b.code} value={b.code}>
//               {b.name} ({b.code})
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* State */}
//       <div className="mb-2">
//         <label className="block font-semibold">State</label>
//         <select
//           className="border rounded px-2 py-1 w-72"
//           value={stateVal}
//           onChange={(e) => setStateVal(e.target.value)}
//           disabled={!bank}
//         >
//           <option value="">-- Select State --</option>
//           {states.map((s) => (
//             <option key={s} value={s}>{s}</option>
//           ))}
//         </select>
//       </div>

//       {/* City */}
//       <div className="mb-2">
//         <label className="block font-semibold">City</label>
//         <select
//           className="border rounded px-2 py-1 w-72"
//           value={city}
//           onChange={(e) => setCity(e.target.value)}
//           disabled={!stateVal}
//         >
//           <option value="">-- Select City --</option>
//           {cities.map((c) => (
//             <option key={c} value={c}>{c}</option>
//           ))}
//         </select>
//       </div>

//       {/* Branch */}
//       <div className="mb-2">
//         <label className="block font-semibold">Branch</label>
//         <select
//           className="border rounded px-2 py-1 w-72"
//           value={branch}
//           onChange={(e) => setBranch(e.target.value)}
//           disabled={!city}
//         >
//           <option value="">-- Select Branch --</option>
//           {branches.map((b) => (
//             <option key={b} value={b}>{b}</option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// }
