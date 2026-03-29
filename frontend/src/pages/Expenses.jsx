import { useEffect, useState } from "react";
import API from "../api";

export default function Expenses() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/expenses/1").then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-4">My Expenses</h2>

      <div className="grid grid-cols-3 gap-4">
        {data.map(e => (
          <div key={e.id} className="bg-white p-4 rounded-xl shadow">
            <p className="font-bold">{e.amount}</p>
            <p className="text-gray-500">{e.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}