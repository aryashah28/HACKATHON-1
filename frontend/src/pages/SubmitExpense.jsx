import { useState } from "react";
import API from "../api";
import { AlertCircle, CheckCircle, Send, Loader } from "lucide-react";

export default function Submit() {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("General");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = ["General", "Travel", "Meals", "Office", "Other"];

  const validate = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    if (!desc.trim()) {
      setError("Please enter a description");
      return false;
    }
    return true;
  };

  const submit = async () => {
    setError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);
    try {
      await API.post("/expense", {
        user_id: 1,
        amount: parseFloat(amount),
        currency,
        category,
        description: desc,
      });
      setSuccess("Expense submitted successfully!");
      setAmount("");
      setDesc("");
      setCategory("General");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Submit Expense</h1>

      <div className="glass-card-light shadow-lg p-8 backdrop-blur-xl">
        {error && (
          <div className="mb-6 backdrop-blur-xl bg-red-500/20 border border-red-400/40 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 backdrop-blur-xl bg-green-500/20 border border-green-400/40 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-300">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Amount *
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400 text-white placeholder-gray-400 transition"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400 text-white transition"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>INR</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400 text-white transition"
            >
              {categories.map((cat) => (
                <option key={cat} className="bg-gray-800">{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Description *
            </label>
            <textarea
              placeholder="Enter expense details..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows="4"
              className="w-full backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400 text-white placeholder-gray-400 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full backdrop-blur-xl bg-slate-600/40 hover:bg-slate-600/60 disabled:bg-slate-600/20 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 border border-white/20 hover:border-white/40"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Expense
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}