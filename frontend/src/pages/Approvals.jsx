import { useEffect, useState } from "react";
import API from "../api";

export default function Approvals() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    API.get("/pending_approvals?user_id=1")
      .then((res) => {
        console.log("API DATA:", res.data); // debug
        setData(res.data);
      })
      .catch((err) => {
        console.error("API ERROR:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const act = async (id, decision) => {
    try {
      await API.post("/approve", null, {
        params: { approval_id: id, decision },
      });
      alert("Updated ✅");

      // 🔥 refresh list after action
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error updating ❌");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Approvals</h2>

      {/* 🔄 Loading */}
      {loading && <p>Loading...</p>}

      {/* ❌ Empty */}
      {!loading && data.length === 0 && (
        <p className="text-gray-500">No approvals found</p>
      )}

      {/* ✅ Data */}
      {data.map((a) => (
        <div key={a.id} className="bg-white p-4 mb-3 rounded shadow">
          <p className="font-semibold">Expense #{a.expense_id}</p>

          <div className="mt-2 flex gap-2">
            <button
              className="bg-green-500 text-white px-3 py-1 rounded"
              onClick={() => act(a.id, "approved")}
            >
              Approve
            </button>

            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => act(a.id, "rejected")}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}