"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  const [ifscData, setIfscData] = useState([]);

  // 1) On mount, fetch all banks (alphabetically sorted by name)
  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await fetch("/api/ifsc?mode=banks");
        const data = await res.json();
        setBanks(data.data || []);
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    }
    fetchBanks();
  }, []);

  // 2) When selectedBank changes, fetch states
  useEffect(() => {
    if (!selectedBank) {
      setStates([]);
      setSelectedState("");
      return;
    }
    async function fetchStates() {
      try {
        const url = `/api/ifsc?mode=states&bank=${selectedBank}`;
        const res = await fetch(url);
        const data = await res.json();
        setStates(data.data || []);
        setSelectedState("");
        setCities([]);
        setBranches([]);
        setIfscData([]);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    }
    fetchStates();
  }, [selectedBank]);

  // 3) When selectedState changes, fetch cities
  useEffect(() => {
    if (!selectedState || !selectedBank) {
      setCities([]);
      setSelectedCity("");
      return;
    }
    async function fetchCities() {
      try {
        const url = `/api/ifsc?mode=cities&bank=${selectedBank}&state=${encodeURIComponent(selectedState)}`;
        const res = await fetch(url);
        const data = await res.json();
        setCities(data.data || []);
        setSelectedCity("");
        setBranches([]);
        setIfscData([]);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }
    fetchCities();
  }, [selectedState, selectedBank]);

  // 4) When selectedCity changes, fetch branches
  useEffect(() => {
    if (!selectedCity || !selectedBank || !selectedState) {
      setBranches([]);
      setSelectedBranch("");
      return;
    }
    async function fetchBranches() {
      try {
        const url = `/api/ifsc?mode=branches&bank=${selectedBank}&state=${encodeURIComponent(selectedState)}&city=${encodeURIComponent(selectedCity)}`;
        const res = await fetch(url);
        const data = await res.json();
        setBranches(data.data || []);
        setSelectedBranch("");
        setIfscData([]);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    }
    fetchBranches();
  }, [selectedCity, selectedBank, selectedState]);

  // 5) When selectedBranch changes, fetch final IFSC data (no mode)
  useEffect(() => {
    if (!selectedBranch || !selectedBank || !selectedState || !selectedCity) {
      setIfscData([]);
      return;
    }
    async function fetchIfscData() {
      try {
        const params = new URLSearchParams({
          bank: selectedBank,
          state: selectedState,
          city: selectedCity,
          branch: selectedBranch,
        });
        const res = await fetch(`/api/ifsc?${params.toString()}`);
        const data = await res.json();
        setIfscData(data.data || []);
      } catch (error) {
        console.error("Error fetching IFSC data:", error);
        setIfscData([]);
      }
    }
    fetchIfscData();
  }, [selectedBranch, selectedBank, selectedState, selectedCity]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">IFSC Search (Bank → State → City → Branch)</h1>

      {/* Bank Dropdown */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Bank</label>
        <select
          className="border rounded px-3 py-2 w-72"
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
        >
          <option value="">-- Select Bank --</option>
          {banks.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      {/* State Dropdown */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">State</label>
        <select
          className="border rounded px-3 py-2 w-72"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          disabled={!selectedBank}
        >
          <option value="">-- Select State --</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* City Dropdown */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">City</label>
        <select
          className="border rounded px-3 py-2 w-72"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={!selectedState}
        >
          <option value="">-- Select City --</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Branch Dropdown */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Branch</label>
        <select
          className="border rounded px-3 py-2 w-72"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          disabled={!selectedCity}
        >
          <option value="">-- Select Branch --</option>
          {branches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* IFSC Data */}
      <div className="border rounded p-4 w-full max-w-2xl">
        <h2 className="font-bold text-lg mb-2">IFSC Data</h2>
        {ifscData.length === 0 ? (
          <p className="text-gray-500">No data yet or no match.</p>
        ) : (
          ifscData.map((item, idx) => (
            <div key={idx} className="mb-4 p-2 border rounded">
              <p><strong>Bank:</strong> {item.BANK}</p>
              <p><strong>IFSC:</strong> {item.IFSC}</p>
              <p><strong>State:</strong> {item.STATE}</p>
              <p><strong>City:</strong> {item.CITY}</p>
              <p><strong>Branch:</strong> {item.BRANCH}</p>
              {/* Add more fields if needed */}
            </div>
          ))
        )}
      </div>
    </main>
  );
}


// "use client";
// import { useState } from "react";

// export default function Home() {
//   const [bank, setBank] = useState("");
//   const [state, setState] = useState("");
//   const [district, setDistrict] = useState("");
//   const [branch, setBranch] = useState("");
//   const [results, setResults] = useState([]);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     try {
//       const params = new URLSearchParams();
//       if (bank) params.append("bank", bank);
//       if (state) params.append("state", state);
//       if (district) params.append("district", district);
//       if (branch) params.append("branch", branch);

//       const res = await fetch(`/api/ifsc?${params.toString()}`);
//       const data = await res.json();
//       setResults(data.data || []);
//     } catch (error) {
//       console.error("Error fetching IFSC data:", error);
//       setResults([]);
//     }
//   };

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen p-4">
//       <h1 className="text-2xl font-bold mb-4">IFSC Search</h1>

//       <form onSubmit={handleSearch} className="w-full max-w-md space-y-4">
//         <div>
//           <label className="block font-semibold mb-1">Bank Code (e.g. SBIN, YESB)</label>
//           <input
//             type="text"
//             value={bank}
//             onChange={(e) => setBank(e.target.value)}
//             className="w-full border rounded p-2"
//             placeholder="e.g. SBIN"
//           />
//         </div>
//         <div>
//           <label className="block font-semibold mb-1">State</label>
//           <input
//             type="text"
//             value={state}
//             onChange={(e) => setState(e.target.value)}
//             className="w-full border rounded p-2"
//             placeholder="e.g. WEST BENGAL"
//           />
//         </div>
//         <div>
//           <label className="block font-semibold mb-1">District</label>
//           <input
//             type="text"
//             value={district}
//             onChange={(e) => setDistrict(e.target.value)}
//             className="w-full border rounded p-2"
//             placeholder="e.g. KOLKATA"
//           />
//         </div>
//         <div>
//           <label className="block font-semibold mb-1">Branch</label>
//           <input
//             type="text"
//             value={branch}
//             onChange={(e) => setBranch(e.target.value)}
//             className="w-full border rounded p-2"
//             placeholder="e.g. KOLKATA MAIN"
//           />
//         </div>
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Search
//         </button>
//       </form>

//       <div className="mt-8 w-full max-w-2xl">
//         <h2 className="text-xl font-bold mb-2">Results</h2>
//         {results.length === 0 && (
//           <p className="text-gray-500">No results found.</p>
//         )}
//         {results.map((item, index) => (
//           <div key={index} className="border p-2 rounded mb-2">
//             <p><strong>Bank:</strong> {item.BANK}</p>
//             <p><strong>IFSC:</strong> {item.IFSC}</p>
//             <p><strong>State:</strong> {item.STATE}</p>
//             <p><strong>District:</strong> {item.DISTRICT}</p>
//             <p><strong>Branch:</strong> {item.BRANCH}</p>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }



// "use client";

// import { useState, useEffect } from "react";

// export default function BankDropdown() {
//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState("");

//   useEffect(() => {
//     const fetchBanks = async () => {
//       const res = await fetch(`/api/banks`);
//       const data = await res.json();
//       setBanks(data.banks);
//     };
//     fetchBanks();
//   }, []);

//   console.log("banks", banks);

//   return (
//     <div className="p-4 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Select Bank</h1>

//       <div className="mb-4">
//         <label className="block text-sm font-medium">Bank</label>
//         <select
//           value={selectedBank}
//           onChange={(e) => setSelectedBank(e.target.value)}
//           className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
//         >
//           <option value="">Select Bank</option>
//           {/* {banks?.map((item, index) => (
//             <option key={index} value={item.bank}>
//               {item.bank}
//             </option>
//           ))} */}
//         </select>
//       </div>

//       {banks?.map((item, index) => (
//         <p key={index} value={item.bank}>
//          {index + 1}). {" "} {" "} {item.bank} <span className="text-red"> ( {item.file} )</span>
//         </p>
//       ))}

//       {/* Show total bank count */}
//       <p className="text-gray-600">
//         Total Banks: <span className="font-bold">{banks.length}</span>
//       </p>

//       {/* Show the selected bank */}
//       {selectedBank && (
//         <p className="mt-4 text-gray-800">
//           Selected Bank: <span className="font-bold">{selectedBank}</span>
//         </p>
//       )}
//     </div>
//   );
// }
