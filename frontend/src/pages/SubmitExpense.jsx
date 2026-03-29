import { useState } from "react";
import API from "../api";

export default function Submit() {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const submit = async () => {
    await API.post("/expense", {
      user_id: 1,
      amount: parseFloat(amount),
      currency: "USD",
      category: "General",
      description: desc
    });
    alert("Submitted");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-96">
      <h2 className="text-xl mb-4">Submit Expense</h2>

      <input
        className="border p-2 w-full mb-3 rounded"
        placeholder="Amount"
        onChange={e => setAmount(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3 rounded"
        placeholder="Description"
        onChange={e => setDesc(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={submit}
      >
        Submit
      </button>
    </div>
  );
}