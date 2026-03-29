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
      params: { approval_id: id, decision },
    });
    alert("Updated");
  };

  return (
    <div>
      <h2>Approvals</h2>
      {data.map(a => (
        <div key={a.id}>
          Expense #{a.expense_id}
          <button onClick={()=>act(a.id,"approved")}>Approve</button>
          <button onClick={()=>act(a.id,"rejected")}>Reject</button>
        </div>
      ))}
    </div>
  );
}