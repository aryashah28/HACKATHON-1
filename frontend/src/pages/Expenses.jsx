import { useEffect, useState } from "react";
import API from "../api";

export default function Expenses() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/expenses/1").then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h2>My Expenses</h2>
      {data.map(e => (
        <div key={e.id}>
          {e.amount} - {e.status}
        </div>
      ))}
    </div>
  );
}