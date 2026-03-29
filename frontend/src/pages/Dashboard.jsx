import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyExpenses, getPendingApprovals, getCompanyExpenses, getTeamExpenses } from "../api";
import { BarChart, CheckCircle, Clock, XCircle, Users, ArrowUpRight, Plus, ShieldCheck } from "lucide-react";


export default function Dashboard() {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [companyExpenses, setCompanyExpenses] = useState([]);
  const [teamExpenses, setTeamExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (!storedRole || !storedUsername) {
      navigate("/login");
      return;
    }

    setRole(storedRole);
    setUsername(storedUsername);

    loadDashboardData(storedRole);
  }, [navigate]);

  const loadDashboardData = async (userRole) => {
    try {
      setLoading(true);
      setError("");

      const promises = [];

      // All roles can see their own expenses
      promises.push(getMyExpenses());

      // Managers and Admins see pending approvals
      if (userRole === "manager" || userRole === "admin") {
        promises.push(getPendingApprovals());
        promises.push(getTeamExpenses());
      }

      // Admins see everything
      if (userRole === "admin") {
        promises.push(getCompanyExpenses());
      }

      const results = await Promise.all(promises);

      setExpenses(results[0]?.data.expenses || []);

      if (userRole === "manager" || userRole === "admin") {
        setPendingApprovals(results[1]?.data.pending || []);
        setTeamExpenses(results[2]?.data.expenses || []);
      }

      if (userRole === "admin") {
        setCompanyExpenses(results[promises.length - 1]?.data.expenses || []);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-5 flex items-center justify-between transition hover:bg-white/[0.15]">
      <div>
        <p className="text-white/60 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-white/5 ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">System Dashboard</h1>
          <p className="text-white/60 mt-2">Welcome back, <span className="text-blue-400 font-semibold">{username}</span></p>
        </div>
        <button
          onClick={() => navigate("/submit")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} /> New Expense
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 flex items-center gap-2">
          <XCircle size={20} /> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Submissions"
          value={expenses.length}
          icon={BarChart}
          colorClass="text-blue-400"
        />
        <StatCard
          title="Awaiting Action"
          value={pendingApprovals.length}
          icon={Clock}
          colorClass="text-yellow-400"
        />
        <StatCard
          title="Team Overview"
          value={teamExpenses.length}
          icon={Users}
          colorClass="text-purple-400"
        />
        <StatCard
          title="Final Approved"
          value={expenses.filter(e => e.status === 'approved').length}
          icon={CheckCircle}
          colorClass="text-green-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Feed: My Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <section className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowUpRight size={20} className="text-blue-400" /> My Recent Expenses
              </h2>
              <button
                onClick={() => navigate("/expenses")}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {expenses.length === 0 ? (
                <div className="text-center py-10 text-white/40 italic text-sm">No expenses found. Start by submitting one!</div>
              ) : (
                expenses.slice(0, 4).map((exp) => (
                  <div key={exp.id} className="group bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-xl p-4 transition flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold text-lg">{exp.category}</p>
                      <p className="text-white/50 text-sm mt-1">{exp.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-xl">${exp.amount}</p>
                      <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold mt-2 tracking-widest ${exp.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        exp.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                        {exp.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Team History for Managers */}
          {(role === 'manager' || role === 'admin') && (
            <section className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Users size={20} className="text-purple-400" /> Team History
              </h2>
              <div className="space-y-4">
                {teamExpenses.length === 0 ? (
                  <div className="text-center py-6 text-white/40 text-sm italic">No team activity yet.</div>
                ) : (
                  teamExpenses.slice(0, 3).map((exp) => (
                    <div key={exp.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                          {exp.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-bold">{exp.username}</p>
                          <p className="text-white/40 text-xs">{exp.category} • {new Date(exp.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${exp.amount}</p>
                        <p className={`text-xs font-bold ${exp.status === 'approved' ? 'text-green-400' : 'text-yellow-400'}`}>{exp.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: Pending Actions */}
        <div className="space-y-6">
          {(role === 'manager' || role === 'admin') && (
            <section className="backdrop-blur-xl bg-blue-600/10 rounded-2xl border border-blue-500/30 p-6 shadow-xl shadow-blue-500/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Clock size={20} className="text-yellow-400" /> Action Required
              </h2>
              <div className="space-y-4">
                {pendingApprovals.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/40 text-center py-10 italic">
                    All caught up! ✨
                  </div>
                ) : (
                  pendingApprovals.slice(0, 3).map((approval) => (
                    <div key={approval.approval_id} className="bg-white/10 border border-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-bold">{approval.category}</p>
                        <p className="text-blue-400 font-black">${approval.amount}</p>
                      </div>
                      <p className="text-white/50 text-xs line-clamp-1 mb-3">{approval.description}</p>
                      <button
                        onClick={() => navigate("/approvals")}
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition"
                      >
                        Review Step {approval.step}
                      </button>
                    </div>
                  ))
                )}
              </div>
              {pendingApprovals.length > 3 && (
                <button
                  onClick={() => navigate("/approvals")}
                  className="w-full mt-4 text-center text-sm text-blue-400 font-medium"
                >
                  View {pendingApprovals.length - 3} more...
                </button>
              )}
            </section>
          )}

          {/* Admin Panel Quick Link */}
          {role === 'admin' && (
            <section className="backdrop-blur-xl bg-purple-600/10 rounded-2xl border border-purple-500/30 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <ShieldCheck size={20} className="text-purple-400" /> Admin Access
              </h2>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                Full system control. Manage users, update roles, and configure custom approval rules for the entire company.
              </p>
              <button
                onClick={() => navigate("/admin")}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-lg shadow-purple-900/40"
              >
                Open Admin Panel
              </button>
            </section>
          )}


          {/* App Tips */}
          <section className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h3 className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-4">Dashboard Tip</h3>
            <p className="text-white/60 text-sm italic leading-relaxed">
              "Use mobile Snap-and-Save for receipts. Our OCR handles the rest."
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}