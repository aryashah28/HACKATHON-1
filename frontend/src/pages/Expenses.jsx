import { useEffect, useState } from "react";
import API from "../api";

export default function Expenses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/expenses/1")
      .then((res) => {
        console.log("DATA:", res.data);
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);

        // 🔥 fallback dummy data
        setData([
          { id: 1, amount: 500, status: "approved" },
          { id: 2, amount: 300, status: "pending" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Expenses</h2>

      {/* 🔄 Loading */}
      {loading && <p>Loading...</p>}

      {/* ❌ Empty */}
      {!loading && data.length === 0 && (
        <p className="text-gray-500">No expenses found</p>
      )}

      {/* ✅ Data */}
      <div className="grid grid-cols-3 gap-4">
        {data.map((e) => (
          <div key={e.id} className="bg-white p-4 rounded-xl shadow">
            <p className="font-bold text-lg">₹{e.amount}</p>
            <p className="text-gray-500 capitalize">{e.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}