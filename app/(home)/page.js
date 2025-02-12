import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}

// "use client";
// import { useEffect, useState } from "react";

// /**
//  * Minimal client component for the homepage.
//  * When all 4 dropdowns are selected, the user can proceed
//  * to the dynamic route for SEO-friendly display + pagination.
//  */
// export default function HomePage() {
//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState("");

//   const [states, setStates] = useState([]);
//   const [selectedState, setSelectedState] = useState("");

//   const [cities, setCities] = useState([]);
//   const [selectedCity, setSelectedCity] = useState("");

//   const [branches, setBranches] = useState([]);
//   const [selectedBranch, setSelectedBranch] = useState("");

//   // On mount, fetch all banks
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/ifsc?mode=banks");
//         const data = await res.json();
//         setBanks(data.data || []);
//       } catch (err) {
//         console.error(err);
//       }
//     })();
//   }, []);

//   // When selectedBank changes -> fetch states
//   useEffect(() => {
//     if (!selectedBank) {
//       setStates([]);
//       setSelectedState("");
//       return;
//     }
//     (async () => {
//       try {
//         const url = `/api/ifsc?mode=states&bank=${selectedBank}`;
//         const res = await fetch(url);
//         const data = await res.json();
//         setStates(data.data || []);
//         setSelectedState("");
//         setCities([]);
//         setBranches([]);
//       } catch (err) {
//         console.error(err);
//       }
//     })();
//   }, [selectedBank]);

//   // When selectedState changes -> fetch cities
//   useEffect(() => {
//     if (!selectedState || !selectedBank) {
//       setCities([]);
//       setSelectedCity("");
//       return;
//     }
//     (async () => {
//       try {
//         const url = `/api/ifsc?mode=cities&bank=${selectedBank}&state=${encodeURIComponent(selectedState)}`;
//         const res = await fetch(url);
//         const data = await res.json();
//         setCities(data.data || []);
//         setSelectedCity("");
//         setBranches([]);
//       } catch (err) {
//         console.error(err);
//       }
//     })();
//   }, [selectedState, selectedBank]);

//   // When selectedCity changes -> fetch branches
//   useEffect(() => {
//     if (!selectedCity || !selectedBank || !selectedState) {
//       setBranches([]);
//       setSelectedBranch("");
//       return;
//     }
//     (async () => {
//       try {
//         const url = `/api/ifsc?mode=branches&bank=${selectedBank}&state=${encodeURIComponent(selectedState)}&city=${encodeURIComponent(selectedCity)}`;
//         const res = await fetch(url);
//         const data = await res.json();
//         setBranches(data.data || []);
//         setSelectedBranch("");
//       } catch (err) {
//         console.error(err);
//       }
//     })();
//   }, [selectedCity, selectedBank, selectedState]);

//   const onViewDetails = () => {
//     if (!selectedBank || !selectedState || !selectedCity || !selectedBranch) return;
//     // Navigate to page 1 of the dynamic route
//     window.location.href = `/ifsc/${selectedBank}/${selectedState}/${selectedCity}/${selectedBranch}/page/1`;
//   };

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen p-4">
//       <h1 className="text-2xl font-bold mb-6">IFSC Lookup (SEO + SSR + Pagination)</h1>

//       {/* Bank */}
//       <div className="mb-4">
//         <label className="block font-semibold mb-1">Bank</label>
//         <select
//           className="border rounded px-3 py-2 w-72"
//           value={selectedBank}
//           onChange={(e) => setSelectedBank(e.target.value)}
//         >
//           <option value="">-- Select Bank --</option>
//           {banks.map((b) => (
//             <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
//           ))}
//         </select>
//       </div>

//       {/* State */}
//       <div className="mb-4">
//         <label className="block font-semibold mb-1">State</label>
//         <select
//           className="border rounded px-3 py-2 w-72"
//           value={selectedState}
//           onChange={(e) => setSelectedState(e.target.value)}
//           disabled={!selectedBank}
//         >
//           <option value="">-- Select State --</option>
//           {states.map((s) => (
//             <option key={s} value={s}>{s}</option>
//           ))}
//         </select>
//       </div>

//       {/* City */}
//       <div className="mb-4">
//         <label className="block font-semibold mb-1">City</label>
//         <select
//           className="border rounded px-3 py-2 w-72"
//           value={selectedCity}
//           onChange={(e) => setSelectedCity(e.target.value)}
//           disabled={!selectedState}
//         >
//           <option value="">-- Select City --</option>
//           {cities.map((c) => (
//             <option key={c} value={c}>{c}</option>
//           ))}
//         </select>
//       </div>

//       {/* Branch */}
//       <div className="mb-4">
//         <label className="block font-semibold mb-1">Branch</label>
//         <select
//           className="border rounded px-3 py-2 w-72"
//           value={selectedBranch}
//           onChange={(e) => setSelectedBranch(e.target.value)}
//           disabled={!selectedCity}
//         >
//           <option value="">-- Select Branch --</option>
//           {branches.map((b) => (
//             <option key={b} value={b}>{b}</option>
//           ))}
//         </select>
//       </div>

//       {/* View Details Button */}
//       <button
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//         onClick={onViewDetails}
//         disabled={!selectedBank || !selectedState || !selectedCity || !selectedBranch}
//       >
//         View Details
//       </button>
//     </main>
//   );
// }
