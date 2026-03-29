import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyExpenses, getPendingApprovals, getCompanyExpenses } from "../api";
import { BarChart, CheckCircle, Clock, XCircle } from "lucide-react";

export default function Dashboard() {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [company_id, setCompanyId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [companyExpenses, setCompanyExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");
    const storedCompanyId = localStorage.getItem("company_id");

    if (!storedRole || !storedUsername || !storedCompanyId) {
      navigate("/login");
      return;
    }

    setRole(storedRole);
    setUsername(storedUsername);
    setCompanyId(storedCompanyId);

    loadDashboardData(storedRole);
  }, [navigate]);

  const loadDashboardData = async (userRole) => {
    try {
      setLoading(true);
      setError("");

      if (userRole === "employee" || userRole === "manager") {
        const expRes = await getMyExpenses();
        setExpenses(expRes.data.expenses || []);
      }

      if (userRole === "manager" || userRole === "admin") {
        const approvalRes = await getPendingApprovals();
        setPendingApprovals(approvalRes.data.pending || []);
      }

      if (userRole === "admin") {
        const companyRes = await getCompanyExpenses();
        setCompanyExpenses(companyRes.data.expenses || []);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/60">Welcome <span className="font-semibold text-white">{username}</span>!</p>
            <p className="text-white/60">Role: <span className="font-semibold text-blue-400 capitalize">{role}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition border border-red-500/50"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 mb-8">
          {error}
        </div>
      )}

      {/* Role-based Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Employee/Manager - My Expenses */}
        {(role === "employee" || role === "manager") && (
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6">
            <div className="flex items-center mb-4">
              <BarChart className="text-blue-400 mr-2" />
              <h2 className="text-xl font-bold text-white">My Expenses</h2>
            </div>
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-white/60">No expenses submitted yet</p>
              ) : (
                expenses.slice(0, 5).map((exp) => (
                  <div key={exp.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{exp.category}</p>
                        <p className="text-white/60 text-sm">{exp.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">${exp.amount}</p>
                        <p className={`text-xs font-semibold ${
                          exp.status === 'approved' ? 'text-green-400' :
                          exp.status === 'rejected' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {exp.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate("/submit-expense")}
              className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-semibold"
            >
              Submit New Expense
            </button>
          </div>
        )}

        {/* Manager/Admin - Pending Approvals */}
        {(role === "manager" || role === "admin") && (
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6">
            <div className="flex items-center mb-4">
              <Clock className="text-yellow-400 mr-2" />
              <h2 className="text-xl font-bold text-white">Pending Approvals</h2>
            </div>
            <div className="space-y-3">
              {pendingApprovals.length === 0 ? (
                <p className="text-white/60">No pending approvals</p>
              ) : (
                pendingApprovals.slice(0, 5).map((approval) => (
                  <div key={approval.approval_id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{approval.category}</p>
                        <p className="text-white/60 text-sm">{approval.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">${approval.amount} {approval.company_currency}</p>
                        <p className="text-white/60 text-xs">Step {approval.step}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate("/approvals")}
              className="w-full mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-semibold"
            >
              View All Approvals
            </button>
          </div>
        )}

        {/* Admin - Company Overview */}
        {role === "admin" && (
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6">
            <div className="flex items-center mb-4">
              <BarChart className="text-purple-400 mr-2" />
              <h2 className="text-xl font-bold text-white">Company Expenses</h2>
            </div>
            <div className="space-y-3">
              {companyExpenses.length === 0 ? (
                <p className="text-white/60">No company expenses</p>
              ) : (
                companyExpenses.slice(0, 5).map((exp) => (
                  <div key={exp.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{exp.category}</p>
                        <p className="text-white/60 text-sm">User ID: {exp.user_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">${exp.amount} {exp.currency}</p>
                        <p className={`text-xs font-semibold ${
                          exp.status === 'approved' ? 'text-green-400' :
                          exp.status === 'rejected' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {exp.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="w-full mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition font-semibold"
            >
              Admin Panel
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="flex items-center">
                <CheckCircle className="text-green-400 mr-2" size={20} />
                <span className="text-white">Approved</span>
              </div>
              <span className="text-white font-bold">
                {expenses.filter(e => e.status === 'approved').length + 
                 companyExpenses.filter(e => e.status === 'approved').length}
              </span>
            </div>
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="flex items-center">
                <Clock className="text-yellow-400 mr-2" size={20} />
                <span className="text-white">Pending</span>
              </div>
              <span className="text-white font-bold">{pendingApprovals.length}</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="flex items-center">
                <XCircle className="text-red-400 mr-2" size={20} />
                <span className="text-white">Rejected</span>
              </div>
              <span className="text-white font-bold">
                {expenses.filter(e => e.status === 'rejected').length + 
                 companyExpenses.filter(e => e.status === 'rejected').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}