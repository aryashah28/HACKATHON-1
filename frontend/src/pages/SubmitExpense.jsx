import { useState } from "react";
import API from "../api";

export default function Submit() {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !desc) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await API.post("/expense", {
        user_id: 1,
        amount: parseFloat(amount),
        currency: "USD",
        category: "General",
        description: desc,
      });

      alert("Expense Submitted ✅");

      // clear form
      setAmount("");
      setDesc("");
    } catch (err) {
      console.error(err);
      alert("Error submitting ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-96">
      <h2 className="text-xl mb-4 font-bold">Submit Expense</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          placeholder="Amount"
          className="border p-2 w-full rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description"
          className="border p-2 w-full rounded"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}