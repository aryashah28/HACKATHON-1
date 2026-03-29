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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Pending Approvals</h1>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm">Expense ID</p>
                  <p className="text-2xl font-bold text-blue-600">#{a.expense_id}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    Step {a.step} • Status: <span className="font-semibold text-yellow-600">Pending</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => act(a.id, "approved")}
                    disabled={processing === a.id}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition font-medium"
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
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition font-medium"
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