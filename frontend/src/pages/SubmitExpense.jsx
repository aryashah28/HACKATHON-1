import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitExpense, extractReceipt } from "../api";
import { Upload, X, CheckCircle } from "lucide-react";

const CATEGORIES = [
  "Travel",
  "Meals",
  "Office",
  "Equipment",
  "Utilities",
  "Entertainment",
  "Medical",
  "General",
];

export default function SubmitExpense() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "",
    currency: "USD",
    category: "General",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const [file, setFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleExtractReceipt = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const res = await extractReceipt(file);

      if (res.data.success && res.data.data) {
        const data = res.data.data;
        setOcrData(data);
        setForm({
          ...form,
          amount: data.amount || form.amount,
          category: data.category || form.category,
          description: data.merchant || form.description,
        });
      }
    } catch (err) {
      setError("Failed to extract receipt data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || !form.description) {
      setError("Please fill in amount and description");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await submitExpense(
        parseFloat(form.amount),
        form.currency,
        form.category,
        form.description,
        form.expense_date
      );

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit expense");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6 mb-8">
          <h1 className="text-3xl font-bold text-white">Submit Expense</h1>
          <p className="text-white/60 mt-2">Upload receipt or enter details manually</p>
        </div>

        {success && (
          <div className="backdrop-blur-xl bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200 mb-8 flex items-center">
            <CheckCircle className="mr-2" />
            Expense submitted successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OCR Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Receipt OCR (Optional)</h2>
            
            <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center mb-4 hover:border-white/50 transition">
              <Upload className="mx-auto text-white/60 mb-2" size={32} />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <p className="text-white font-semibold">Click to upload receipt</p>
                <p className="text-white/60 text-sm">or drag and drop</p>
                {file && <p className="text-blue-400 text-sm mt-2">{file.name}</p>}
              </label>
            </div>

            <button
              type="button"
              onClick={handleExtractReceipt}
              disabled={!file || loading}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition font-semibold"
            >
              {loading ? "Extracting..." : "Extract Receipt Data"}
            </button>

            {ocrData && (
              <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-white/60 text-sm">Extracted Data:</p>
                <p className="text-white">${ocrData.amount} - {ocrData.merchant}</p>
                <p className="text-white/60 text-sm">{ocrData.date}</p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Expense Details</h2>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-white/50 transition"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white transition"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Description</label>
              <textarea
                name="description"
                placeholder="What is this expense for?"
                value={form.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-white/50 transition resize-none"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Expense Date</label>
              <input
                type="date"
                name="expense_date"
                value={form.expense_date}
                onChange={handleChange}
                className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white transition"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-semibold border border-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-500/50 disabled:to-green-600/50 text-white rounded-lg transition font-semibold"
            >
              {loading ? "Submitting..." : "Submit Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}