import { useEffect, useState } from "react";
import API from "../api";
import { CheckCircle, XCircle, Clock, Loader } from "lucide-react";

export default function Approvals() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = () => {
    API.get("/pending_approvals?user_id=1")
      .then((res) => {
        setData(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const act = async (id, decision) => {
    setProcessing(id);
    try {
      await API.post("/approve", null, {
        params: { approval_id: id, decision },
      });
      setData(data.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error processing approval", err);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-slate-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Pending Approvals</h1>

      {data.length === 0 ? (
        <div className="glass-card-light shadow-lg p-12 text-center backdrop-blur-xl">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((a) => (
            <div
              key={a.id}
              className="glass-card-light shadow-lg hover:shadow-xl transition p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Expense ID</p>
                  <p className="text-2xl font-bold text-slate-300">#{a.expense_id}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    Step {a.step} • Status: <span className="font-semibold text-yellow-300">Pending</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => act(a.id, "approved")}
                    disabled={processing === a.id}
                    className="flex items-center gap-2 backdrop-blur-lg bg-green-600/40 hover:bg-green-600/60 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition font-medium border border-white/20"
                  >
                    {processing === a.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>

                  <button
                    onClick={() => act(a.id, "rejected")}
                    disabled={processing === a.id}
                    className="flex items-center gap-2 backdrop-blur-lg bg-red-600/40 hover:bg-red-600/60 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition font-medium border border-white/20"
                  >
                    {processing === a.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}