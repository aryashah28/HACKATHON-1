import { useEffect, useState } from "react";
import API from "../api";

export default function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    API.get("/dashboard").then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total: {data.total}</p>
      <p>Approved: {data.approved}</p>
      <p>Pending: {data.pending}</p>
      <p>Rejected: {data.rejected}</p>
    </div>
  );
}