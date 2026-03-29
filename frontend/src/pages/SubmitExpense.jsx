import { useState } from "react";
import API from "../api";

export default function SubmitExpense() {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const submit = async () => {
    await API.post("/expense", {
      user_id: 1,
      amount: parseFloat(amount),
      currency: "USD",
      category: "General",
      description: desc,
    });
    alert("Submitted");
  };

  return (
    <div>
      <h2>Submit Expense</h2>
      <input placeholder="Amount" onChange={e=>setAmount(e.target.value)} />
      <input placeholder="Description" onChange={e=>setDesc(e.target.value)} />
      <button onClick={submit}>Submit</button>
    </div>
  );
}