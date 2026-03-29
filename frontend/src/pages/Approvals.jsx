import { useEffect, useState } from "react";
import API from "../api";

export default function Approvals() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/pending_approvals?user_id=1")
      .then(res => setData(res.data));
  }, []);

  const act = async (id, decision) => {
    await API.post("/approve", null, {
      params: { approval_id: id, decision }
    });
    alert("Updated");
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Approvals</h2>

      {data.map(a => (
        <div key={a.id} className="bg-white p-4 mb-3 rounded shadow">
          <p>Expense #{a.expense_id}</p>
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