import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingApprovals, approveExpense } from "../api";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function Approvals() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPendingApprovals();
      setApprovals(res.data.pending || []);
    } catch (err) {
      setError("Failed to load approvals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approval_id, decision) => {
    try {
      setSubmitting(true);
      await approveExpense(approval_id, decision, comments);

      // Remove from list
      setApprovals(approvals.filter(a => a.approval_id !== approval_id));
      setSelectedApproval(null);
      setComments("");
    } catch (err) {
      setError("Failed to process approval");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Approvals</h1>
            <p className="text-white/60">Manage expense approval requests</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition border border-white/20"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 mb-8">
            {error}
          </div>
        )}

        {approvals.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-12 text-center">
            <Clock className="mx-auto text-white/60 mb-4" size={40} />
            <p className="text-white/60 text-lg">No pending approvals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Approvals List */}
            <div className="lg:col-span-2 space-y-4">
              {approvals.map((approval) => (
                <div
                  key={approval.approval_id}
                  onClick={() => setSelectedApproval(approval)}
                  className={`backdrop-blur-xl rounded-xl border transition cursor-pointer ${selectedApproval?.approval_id === approval.approval_id
                      ? "bg-white/20 border-white/40"
                      : "bg-white/10 border-white/20 hover:bg-white/15"
                    }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{approval.category}</h3>
                        <p className="text-white/60 mt-1">{approval.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          ${approval.amount.toFixed(2)}
                        </p>
                        <p className="text-white/60 text-sm">{approval.company_currency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>Step {approval.step} of 3</span>
                      <span>•</span>
                      <span>Submitted: {new Date(approval.submitted_date).toLocaleDateString()}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 flex gap-1">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 h-2 rounded-full ${step <= approval.step ? "bg-blue-500" : "bg-white/10"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Approval Details & Actions */}
            {selectedApproval && (
              <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6 h-fit sticky top-6">
                <h2 className="text-xl font-bold text-white mb-4">Review Details</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-white/60 text-sm">Amount</p>
                    <p className="text-white font-bold text-lg">
                      ${selectedApproval.amount.toFixed(2)} {selectedApproval.company_currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Category</p>
                    <p className="text-white font-semibold">{selectedApproval.category}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Description</p>
                    <p className="text-white">{selectedApproval.description}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Current Step</p>
                    <p className="text-white font-semibold">Step {selectedApproval.step} of 3</p>
                  </div>
                </div>

                {/* Comments */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Approval Comments (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments..."
                    rows="4"
                    className="w-full px-3 py-2 backdrop-blur-lg bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-white/50 transition resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleApprove(selectedApproval.approval_id, "approved")}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition font-semibold"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApproval.approval_id, "rejected")}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg transition font-semibold"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}